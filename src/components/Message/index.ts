/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createVNode, render } from 'vue'
import Message from './Msg.vue'

import type { ComponentPublicInstance, VNode } from 'vue'
// vm 的 类型
interface MessageQueueItem {
  vm: VNode
}
// close 类型
export type CloseFn = (...args: any) => any
// 组件Props 参数类型
export interface Options {
  message: string
  id: string
  offset: number
  zIndex: number
  duration: number
  type: 'success' | 'error' | 'warning'| 'info'
  onClose: CloseFn
  customClass: string
  showClose: boolean
  center: boolean
}
// 存放 vm节点的数组
const instances: MessageQueueItem[] = []
let send = 1
// PermaMessage 返回类型
interface MessageReturn {
  close: CloseFn
}
export const permaMessage = (
  options: Partial<Omit<Options, 'id'>>
): MessageReturn => {
  // 默认距离顶部距离
  let srcollTop: number = 82
  // 通过 vm 的数组 设置 顶部高度
  instances.forEach(({ vm }) => {
    srcollTop = srcollTop + +(vm.el != null ? vm.el.offsetHeight : 0) + 16
  })
  srcollTop += 16
  // 获取字符串 id
  const id = `permaMessage_${send++}`
  // 用户 自定义删除方法 close 方法
  const userOnClose = options.onClose
  // 组件 Props 内容
  const props: Partial<Options> = {
    zIndex: 1000 + send,
    offset: srcollTop,
    ...options,
    id,
    // close 方法
    onClose: () => {
      // 调用删除数组中对应id 并且调用用户自定义close方法
      close(id, userOnClose)
    }
  }
  // 创建 容器
  const container = document.createElement('div')
  // 创建 dom节点传递（组件 + Props）
  const vm = createVNode(Message, props) as any
  // vue3 绑定事件需要加on，挂载onDestroy 方法，emits 可以 使用 (e:'destroy')便可以捕获到，不需要加on
  ((vm).props)!.onDestroy = () => {
    // 删除 body中的container节点
    render(null, container)
  }
  // 渲染vm 在 container 上
  render(vm, container)
  // 将当前的 vm节点 添加在数组内
  instances.push({ vm })
  // 将 container 渲染在 body 上
  document.body.appendChild(container.firstElementChild as Element)
  // 返回方法， 用户自定义删除当前的vm节点
  return {
    close: () =>
      ((
        vm.component?.proxy as ComponentPublicInstance<{ visible: boolean }>
      ).visible = false)
  }
}
// close 方法 接收 id 和用户自定义删除方法
const close = (id: string, userOnClose?: (vm: VNode) => void): void => {
  // 找到 相同id的 vm节点 记录下标 idx 找不到返回 -1
  const idx = instances.findIndex(({ vm }) => id === vm.component?.props.id)
  // 若没有直接返回
  if (idx === -1) return
  // 解构出 idx 的vm
  const { vm } = instances[idx]
  if (vm === null || vm === undefined) return
  // 将 vm 传递给 用户的自定义删除事件，用户自由操作 vm 节点
  userOnClose?.(vm)
  // 获取要删除的 vm 的高度
  const removedHeight = vm.el!.offsetHeight
  // 删除 数组中 vm节点
  instances.splice(idx, 1)
  // 重新获取数组长度
  const len = instances.length
  if (len < 1) return
  // for循环 从 删除的idx下标开始，重新赋值数组中 vm 的 style Top
  for (let i = idx; i < len; i++) {
    // parseInt 转成整数 - 删除的vm的自身高度 - 间隔的 16 px
    const pos = parseInt(instances[i].vm.el!.style.top, 10) - removedHeight - 16
    // 挨个进行赋值，利用 transition 的过渡 达到动画效果
    instances[i].vm.component!.props.offset = pos
  }
}
