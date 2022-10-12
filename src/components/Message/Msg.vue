<template>
  <transition name="permaMessage-fade" @after-leave="afterLeave" @before-leave="beforeLeave">
    <div
      v-show="visible"
      :id="id"
      :class="[
        'perma-message',
        `perma-message--${type ? type : 'info'}`,
        customClass
      ]"
      :style="customStyle"
      @mouseenter="clearTimer"
      @mouseleave="startTimer">
      <i
        v-if="type"
        :class="['perma-message__icon', `el-icon-${type ? type : 'info`'}`]"
      />
      <span class="perma-message__content" :class="[center ? 'perma-message-center' : '']">{{ message }}</span>
      <i v-if="showClose" class="el-icon-close perma-message__closeBtn" @click.stop="close" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, onMounted, defineEmits, withDefaults } from 'vue'
import type { CSSProperties } from 'vue'
import { CloseFn } from './index'
export interface Options {
  message?: string
  id?: string
  offset?: number
  zIndex?: number
  duration: number
  type?: 'success' | 'error' | 'warning'| 'info'
  onClose?: CloseFn
  customClass?: string
  showClose?: boolean
  center?: boolean
}
interface Emits {
  (e:'destroy'):true
}
const props = withDefaults(defineProps<Options>(), {
  message: '',
  id: '',
  offset: 20,
  zIndex: 1000,
  duration: 3000,
  type: 'info',
  onClose: () => true,
  customClass: '',
  center: false,
  showClose: true
})
const emits = defineEmits<Emits>()
const visible = ref(false)
const customStyle = computed<CSSProperties>(() => ({
  top: `${props.offset}px`,
  zIndex: props.zIndex
}))
let timer: any
const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      if (visible.value) close()
    }, props.duration)
  }
}
function clearTimer () {
  clearTimeout(timer)
}
const afterLeave = () => {
  emits('destroy')
}

const beforeLeave = () => {
  props.onClose()
}
onMounted(() => {
  startTimer()
  visible.value = true
})
const close = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.perma-message {
  display: flex;
  justify-content: space-between;
  min-width: 380px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  align-items: center;
  border-radius: 8px;
  color: #fff;
  max-width: 500px;
  justify-content: space-between;
  backdrop-filter: blur(2px);
  overflow: hidden;
  transition: opacity .3s,transform .4s,top .4s;
}
.perma-message__icon{
  font-size: 20px;
  margin-right: 10px;
}
// 重写 success 样式
.perma-message--success {
  background-color: rgba(82, 199, 99, 0.2);
  border: 1px solid rgba(82, 199, 99, 0.2);

  .el-icon-success {
    color: #52C763;
  }
}

// 重写 error 样式
.perma-message--error {
  background: rgba(255, 125, 105, 0.2);
  border: 1px solid rgba(255, 125, 105, 0.2);

  .el-icon-error {
    color: #FF7D69;
  }
}

// 重写 warning 样式
.perma-message--warning {
  background: rgba(255, 197, 61, 0.2);
  border: 1px solid rgba(255, 197, 61, 0.2);

  .el-icon-warning {
    color: #FFC53D;
  }
}
.perma-message--info {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
}
.perma-message__content {
  color: #fff;
  font-size: 14px;
  line-height: 22px;
  padding-right: 8px;
  flex: 1;
}
.perma-message__closeBtn {
  display: contents;
  font-size: 15px;
  font-weight: 900;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
}
.permaMessage-fade-enter-from,
.permaMessage-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%)
}
.perma-message-center{
  text-align: center;
}
</style>
