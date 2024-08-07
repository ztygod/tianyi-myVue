# 双端比较的原理
简单Diff算法的解决方法并不是最优的，我们来看一个例子：
![屏幕截图 2024-04-20 093656.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713577033684-3ea245bf-a338-4aa4-926a-676a754eb8ce.png#averageHue=%23e6e6e6&clientId=u73f9155a-36e1-4&from=ui&id=ud1477482&originHeight=303&originWidth=529&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=32954&status=done&style=none&taskId=u0a94f406-fc4b-42ac-b4cf-9dd38408fc1&title=)
如果按照简单Diff算法，会发生两次DOM移动：
![屏幕截图 2024-04-20 094151.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713577332928-84484e4f-859c-45a4-a35e-e715ce508e4c.png#averageHue=%23eeeeee&clientId=u73f9155a-36e1-4&from=ui&id=u4ac40e28&originHeight=455&originWidth=589&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=78877&status=done&style=none&taskId=u32d2300b-f894-4175-af95-fab1a9282f6&title=)
但是实际上我们只需要将p - 3移动到旧节点最前面即可：
![屏幕截图 2024-04-20 094203.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713577390545-8b822bdd-3c07-4f80-98f2-84c44b08a503.png#averageHue=%23ededed&clientId=u73f9155a-36e1-4&from=ui&id=u3a1c0b28&originHeight=426&originWidth=597&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=49175&status=done&style=none&taskId=u6897daf4-aac1-4db5-9e9a-9d48f75514f&title=)
这就是我们双端算法做的事情。
双端算法顾名思义就是对**新旧两个节点的前后两端进行比较**。
## 例子
我们用四个索引值，分别指向新旧两两组节点的端点。
![屏幕截图 2024-04-20 094820.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713577710312-170ac364-74c4-40ca-b8a5-48f690675e72.png#averageHue=%23efefef&clientId=u73f9155a-36e1-4&from=ui&id=u053789e5&originHeight=324&originWidth=648&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=33671&status=done&style=none&taskId=u7e61fe29-18d0-4330-af98-1dfc6dc5a40&title=)
那我们如何进行比较呢，每一个比较都分为四个部分。
![屏幕截图 2024-04-20 095118.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713577884819-93d0aa3e-650b-4702-bfe4-cbcf47e6ae02.png#averageHue=%23ececec&clientId=u73f9155a-36e1-4&from=ui&id=u3565b65b&originHeight=321&originWidth=697&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=45143&status=done&style=none&taskId=u4fc68eea-2515-4d44-8b96-a3e960e82e9&title=)

1. 第一步：比较旧的一组子节点中的**第一个子节点 p-1 **与新的一组 子节点中的**第一个子节点 p-4**，看看它们是否相同。由于两者的 key 值不同，因此不相同，不可复用，于是什么都不做。 
2. 第二步：比较旧的一组子节点中的**最后一个子节点 p-4** 与新的一 组子节点中的**最后一个子节点 p-3**，看看它们是否相同。由于两 者的 key 值不同，因此不相同，不可复用，于是什么都不做。 
3. 第三步：比较旧的一组子节点中的**第一个子节点 p-1 **与新的一组 子节点中的**最后一个子节点 p-3**，看看它们是否相同。由于两者 的 key 值不同，因此不相同，不可复用，于是什么都不做。 
4. 第四步：比较旧的一组子节点中的**最后一个子节点 p-4 **与新的一 组子节点中的**第一个子节点 p-4**。由于它们的 key 值相同，因此 可以进行 DOM 复用。
### 第一轮更新
由于**旧子节点最后一个节点与新子节点中的第一个节点的key值相同**，说明可以进行复用，这就代表将oldEndIdx对应的真实DOM移动到oldStartIdx对应的真实DOM前面。
代码（有不完善地方，之后会修改）：
```javascript
function pathChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        //省略部分代码
    } else if (Array.isArray(n2.children)) {
        if (Array.isArray(n1.children)) {
            //封装pathKeyChildren函数处理两组节点
            pathKeyChildren(n1, n2, container)
        }
    } else {
        //省略部分代码
    }
}
```
```javascript
function pathKeyChildren(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    //四个索引值
    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1
    //四个索引指向vnode节点
    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    //核心部分
    if (oldStartVNode.key === newStartVNode.key) {
        //第一步：oldStartVNode与newStartVNode比较
    } else if (oldEndVNode.key === newEndVNode.key) {
        //第二步：oldEndVNode与newEndVNode比较
    } else if (oldStartVNode.key === newEndVNode.key) {
        //第三步：oldStartVNode与newEndVNode比较
    } else if (oldEndVNode.key === newStartVNode.key) {
        //第四步：oldEndVNode与newStartVNode比较
        //仍要调用patch函数进行打补丁
        patch(oldEndVNode, newStartVNode, container)
        //移动DOM元素
        //oldEndVNode.el移到oldStartVNode.el前面
        inters(oldEndVNode.el, container, oldStartVNode.el)

        //移动之后更新索引值
        oldEndIdx = oldChildren[--oldEndIdx]
        newStartVNode = newChildren[++newStartIdx]
    }

}
```
效果：
![屏幕截图 2024-04-20 103213.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713580340787-d61bedd2-1160-450e-b133-03cf6e7920e2.png#averageHue=%23f0f0f0&clientId=u73f9155a-36e1-4&from=ui&id=u1867aac7&originHeight=425&originWidth=782&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=77807&status=done&style=none&taskId=ue0f1c523-4fb1-4eec-ae09-63180ee60f4&title=)
此时更新尚未完成，我们可以将节点的更新的代码封装到一个while循环中：
```javascript
function pathKeyChildren(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    //四个索引值
    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1
    //四个索引指向vnode节点
    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    //核心部分
    while(newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx){
      //省略部分代码
    }

}
```
### 第二轮更新
while（）循环中的条件任然成立 ，我们进行下一次比较。
我们发现在第二步比较时，新节点的尾部节点与旧节点的尾部节点key值相同。
两者都处于尾部，因此我们不需要进行DOM的移动，只需要打补丁即可。
代码：
```javascript
function pathKeyChildren(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    //四个索引值
    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1
    //四个索引指向vnode节点
    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    //核心部分
    while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
        if (oldStartVNode.key === newStartVNode.key) {
            //第一步：oldStartVNode与newStartVNode比较
        } else if (oldEndVNode.key === newEndVNode.key) {
            //第二步：oldEndVNode与newEndVNode比较
            //都处于尾部，不需要移动，打补丁即可
            patch(oldEndVNode, newEndVNode, container)
            //更新索引
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            //第三步：oldStartVNode与newEndVNode比较
        } else if (oldEndVNode.key === newStartVNode.key) {
            //第四步：oldEndVNode与newStartVNode比较
            //仍要调用patch函数进行打补丁
            patch(oldEndVNode, newStartVNode, container)
            //移动DOM元素
            //oldEndVNode.el移到oldStartVNode.el前面
            inters(oldEndVNode.el, container, oldStartVNode.el)

            //移动之后更新索引值
            oldEndIdx = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        }

    }
}
```
效果：
![屏幕截图 2024-04-20 105340.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713581627975-d887af05-8507-4dc8-a792-d664b4e2b231.png#averageHue=%23f2f2f2&clientId=u73f9155a-36e1-4&from=ui&id=uccfb6742&originHeight=424&originWidth=767&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=57392&status=done&style=none&taskId=ud8035f55-fab5-4fe5-ab05-850d6a9c992&title=)
### 第三轮更新
更新尚未完成，我们继续
在下一步更新中，我们在第三步比较中发现，旧子节点的头部节点与新子节点中尾部节点的key值相同，这说明我们需要将p-1的真实DOM移动到p - 2对应的真实DOM的后面，并且更新索引位置。
```javascript
    while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
        if (oldStartVNode.key === newStartVNode.key) {
            //第一步：oldStartVNode与newStartVNode比较
        } else if (oldEndVNode.key === newEndVNode.key) {
            //第二步：oldEndVNode与newEndVNode比较
            //都处于尾部，不需要移动，打补丁即可
            patch(oldEndVNode, newEndVNode, container)
            //更新索引
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            //第三步：oldStartVNode与newEndVNode比较
            //仍要更新节点
            patch(oldStartVNode,newEndVNode,container)
            //将旧节点中头子节点移动到尾子节点后面
            insert(oldStartVNode.el,container,oldEndVNode.el)
        } else if (oldEndVNode.key === newStartVNode.key) {
            //第四步：oldEndVNode与newStartVNode比较
            //仍要调用patch函数进行打补丁
            patch(oldEndVNode, newStartVNode, container)
            //移动DOM元素
            //oldEndVNode.el移到oldStartVNode.el前面
            insert(oldEndVNode.el, container, oldStartVNode.el)

            //移动之后更新索引值
            oldEndIdx = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        }

    }
```
效果：
![屏幕截图 2024-04-20 110618.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713582389104-59beedb9-7bb9-49b6-8467-85e46a0701c5.png#averageHue=%23f4f4f4&clientId=u73f9155a-36e1-4&from=ui&id=uc0474c0c&originHeight=444&originWidth=775&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=56211&status=done&style=none&taskId=u965bdcc0-e306-46c0-825f-33c4915fd04&title=)
### 第四轮更新
当前新旧节点的头部索引与尾部索引重合，仍然满足循环的条件，我们进行下一轮更新。
 我们在第一步就发现新旧两组节点的头部节点相同，因为都在头部，所以我们不需要移动DOM，只需要打补丁就可以了。
```javascript
    while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
        if (oldStartVNode.key === newStartVNode.key) {
            //第一步：oldStartVNode与newStartVNode比较
            patch(oldStartVNode, newStartVNode, container)
            //更新索引
            oldStartVNode = oldChildren[++oldStartIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else if (oldEndVNode.key === newEndVNode.key) {
            //第二步：oldEndVNode与newEndVNode比较
            //都处于尾部，不需要移动，打补丁即可
            patch(oldEndVNode, newEndVNode, container)
            //更新索引
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            //第三步：oldStartVNode与newEndVNode比较
            //仍要更新节点
            patch(oldStartVNode, newEndVNode, container)
            //将旧节点中头子节点移动到尾子节点后面
            insert(oldStartVNode.el, container, oldEndVNode.el)
        } else if (oldEndVNode.key === newStartVNode.key) {
            //第四步：oldEndVNode与newStartVNode比较
            //仍要调用patch函数进行打补丁
            patch(oldEndVNode, newStartVNode, container)
            //移动DOM元素
            //oldEndVNode.el移到oldStartVNode.el前面
            insert(oldEndVNode.el, container, oldStartVNode.el)

            //移动之后更新索引值
            oldEndIdx = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        }

    }
```
效果：
![屏幕截图 2024-04-20 111820.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713583109266-afb1e19e-90df-4cbc-a9be-25e9b7f76ebe.png#averageHue=%23f4f4f4&clientId=u73f9155a-36e1-4&from=ui&id=uf7b497ea&originHeight=372&originWidth=784&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=60958&status=done&style=none&taskId=uec653def-c277-4f20-9171-e00ca28b854&title=)
更新全部完成
# 双端比较的优势
我们来看看双端比较相较于简单Diff有什么优势吧。
我们先来看一个例子
![屏幕截图 2024-04-20 112100.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713583295326-afa7530d-d2bf-4c3e-824d-993859a22684.png#averageHue=%23e7e7e7&clientId=u73f9155a-36e1-4&from=ui&id=u3e8fa435&originHeight=289&originWidth=376&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=19825&status=done&style=none&taskId=ubd59286c-790a-41b2-ba17-5d794f6f477&title=)
如果按照简单Diff算法我们会用到两次DOM移动操作。

![屏幕截图 2024-04-20 112233.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713583360613-9f448962-222d-4b86-97e0-331255d53506.png#averageHue=%23efefef&clientId=u73f9155a-36e1-4&from=ui&id=u5b43e7d4&originHeight=481&originWidth=641&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=66145&status=done&style=none&taskId=u93679193-997c-4b78-abc0-8ae5213cda2&title=)
再来看一看双端Diff：
![屏幕截图 2024-04-20 112332.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713583424596-0071ec76-ed1a-448f-aecd-551d64073c2d.png#averageHue=%23eeeeee&clientId=u73f9155a-36e1-4&from=ui&id=u52225551&originHeight=292&originWidth=794&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=39028&status=done&style=none&taskId=u075f1b39-21bc-43eb-96b4-ba84c5c9d84&title=)
我们只需要进行一次DOM移动就可以完成节点更新。
# 非理想状况的处理
我们上面的例子，在每一轮比较中总是可以找到key值相同子节点，然后进行更新，这是一个理想状况 。
我们也可能在一轮比较中找不到一组有相同key值的节点，比如下面：
![屏幕截图 2024-04-20 113614.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713584181159-06d65333-7d16-4a45-ac84-b9b87e95e99a.png#averageHue=%23ededed&clientId=u73f9155a-36e1-4&from=ui&id=u1b79b958&originHeight=385&originWidth=799&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=60988&status=done&style=none&taskId=u9013823a-b344-4ed5-874e-1ec184cab26&title=)
在第一轮的比较中发现无法命中四个步骤中的任何一步。
我们可以这样做：
拿**新子节点的头部节点**去与旧子节点的每个节点去匹配key值，
如果在旧子节点中找到了可复用的子节点。这就意味着，在旧子节点中的某个节点，在更新后应变为头部节点，
所以我们要将其对应的真实DOM移动到当前旧子节点的头部节点之前。
代码：
```javascript
 while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
        if (!oldStartIdx) {
            //如果头部节点为undefined,则是已经被处理过，直接跳到下一个位置
            oldStartVNode = oldChildren[++oldStartIdx]
        }else if(!oldEndVNode){
            oldEndVNode = oldChildren[--oldEndIdx]
        }else if (oldStartVNode.key === newStartVNode.key) {
            //第一步：oldStartVNode与newStartVNode比较
            patch(oldStartVNode, newStartVNode, container)
            //更新索引
            oldStartVNode = oldChildren[++oldStartIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else if (oldEndVNode.key === newEndVNode.key) {
            //第二步：oldEndVNode与newEndVNode比较
            //都处于尾部，不需要移动，打补丁即可
            patch(oldEndVNode, newEndVNode, container)
            //更新索引
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            //第三步：oldStartVNode与newEndVNode比较
            //仍要更新节点
            patch(oldStartVNode, newEndVNode, container)
            //将旧节点中头子节点移动到尾子节点后面
            insert(oldStartVNode.el, container, oldEndVNode.el)
        } else if (oldEndVNode.key === newStartVNode.key) {
            //第四步：oldEndVNode与newStartVNode比较
            //仍要调用patch函数进行打补丁
            patch(oldEndVNode, newStartVNode, container)
            //移动DOM元素
            //oldEndVNode.el移到oldStartVNode.el前面
            insert(oldEndVNode.el, container, oldStartVNode.el)

            //移动之后更新索引值
            oldEndIdx = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else {
            //非理想状况
            //遍历旧子节点，找到与newStartVNode拥有相同key值的元素
            const idxInOld = oldChildren.findIndex(
                node => node.key === newStartVNode.key
            )
            if (idxInOld > 0) {
                //说明找到了可复用的节点
                const vnodeToMove = oldChildren[idxInOld]
                //打补丁
                patch(vnodeToMove, newStartVNode, container)
                //移动
                insert(vnodeToMove.el, container, oldStartVNode.el)
                //设置为undefined
                oldChildren[idxInOld] = undefined
                //更新newStartVNode
                newStartVNode = newChildren[++newStartIdx]
            }
        }

    }
```
但是在循环前我们应该判断旧子节点的头部节点与尾部节点是否存在，如果不存在，则代表已经被处理过，那就跳到下一个位置。
# 添加新元素
在非理想状况下，我们会将新子节点的头部节点去旧的一组子结点中寻找是否存在可复用节点（key值相同）
但是在添加了新元素的情况下，我们并不是总能找到。
![屏幕截图 2024-04-20 142555.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713594364679-c3438180-9a9b-47e4-9eec-a4694c1afa3d.png#averageHue=%23efefef&clientId=ue05515d3-5bfd-4&from=ui&id=ucca77086&originHeight=332&originWidth=795&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=44137&status=done&style=none&taskId=ub845aa7a-cde0-4a00-b36b-43b258d03cb&title=)
我们需要完善我们的代码：
```javascript
//省略部分代码
            else {
            //非理想状况
            //遍历旧子节点，找到与newStartVNode拥有相同key值的元素
            const idxInOld = oldChildren.findIndex(
                node => node.key === newStartVNode.key
            )
            if (idxInOld > 0) {
                //说明找到了可复用的节点
                const vnodeToMove = oldChildren[idxInOld]
                //打补丁
                patch(vnodeToMove, newStartVNode, container)
                //移动
                insert(vnodeToMove.el, container, oldStartVNode.el)
                //设置为undefined
                oldChildren[idxInOld] = undefined
                //更新newStartVNode
                newStartVNode = newChildren[++newStartIdx]
            }else{
                //说明是添加了新元素
                //将newStartVNode作为新节点挂载到头部，用当前头节点作为锚点
                patch(null,newStartVNode,container,oldStartVNode.el)
            }
            newStartVNode = newChildren[++newStartIdx]
        }

```
但是这个仍有遗漏的缺陷，比如：
![屏幕截图 2024-04-20 143324.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713594812297-ff99958c-6af5-480b-9c7a-97fc302882d0.png#averageHue=%23eeeeee&clientId=ue05515d3-5bfd-4&from=ui&id=u0b1b8053&originHeight=321&originWidth=804&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=48821&status=done&style=none&taskId=ude6bda0f-37ec-4f1c-a5e2-32e80b84b81&title=)
这种情况，因为每一步都会出现相匹配的key值，所以不会进入到上述的代码分支中，到了最后只会余下新添加的节点。
```javascript
while(//省略部分代码){
  
}
if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    //如果满足情况说明有新的节点没有挂载上去，需要挂载他们
    for (let i = newStartIdx; i <= newEndIdx; i++) {
        const anchor = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1] : null
        patch(null, newChildren[i], container, anchor)
    }
}
```
# 移除不存在元素
我们接着来讨论移除元素的情况。
![屏幕截图 2024-04-20 145344.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1713596033079-d79fb4e6-f33e-47c8-829e-07c597259ab7.png#averageHue=%23f0f0f0&clientId=ue05515d3-5bfd-4&from=ui&id=ube66f358&originHeight=330&originWidth=802&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=44968&status=done&style=none&taskId=u8a6b8ff4-49ae-4658-ac13-862f81ddab3&title=)
```javascript
while(//省略部分代码){
  
}
if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    //如果满足情况说明有新的节点没有挂载上去，需要挂载他们
    for (let i = newStartIdx; i <= newEndIdx; i++) {
        const anchor = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1] : null
        patch(null, newChildren[i], container, anchor)
    }
}else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
        //此时需要移除元素
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
            unmount(oldChildren[i])
        }
    }
```
