<template>
  <div class="text-center h-12 w-full flex items-center relative justify-end" style="background: rgba(255, 197, 61, 0.2);backdrop-filter: blur(5px);top: 20px;">
    <div ref="boxInfo" class="relative flex-1 overflow-hidden h-full cursor-pointer flex justify-center items-center">
      <div ref="info" class="whitespace-nowrap absolute leading-5" :class="isAnimation ? 'infoAnimation' : ''">
        <slot />
      </div>
    </div>
    <el-icon class="cursor-pointer text-xl sm:ml-6 sm:mr-20 mr-10 ml-4" @click="emits('close')">
      <Close />
    </el-icon>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref, defineProps, defineEmits } from 'vue'
const props = defineProps<{
duration:number
}>()
const emits = defineEmits<{(e:'close'):void}>()
const boxInfo = ref<HTMLElement>({} as HTMLElement)
const info = ref<HTMLElement>({} as HTMLElement)
const startingPoint = ref(0)
const endPoint = ref(0)
const duration = ref(props.duration)
const isAnimation = ref(false)
onMounted(async () => {
  // 动画在循环调用时执行起始点， 终点距离是-info的宽度
  info.value.addEventListener('animationiteration', () => {
    startingPoint.value = boxInfo.value.clientWidth
  })
  // 挂在是否需要动画
  if (info.value.clientWidth > boxInfo.value.clientWidth) {
    startingPoint.value = boxInfo.value.clientWidth
    endPoint.value = -info.value.clientWidth
    isAnimation.value = true
  } else {
    isAnimation.value = false
  }
  // 移动窗口 判断是否需要动画，以及确定终点距离
  window.addEventListener('resize', () => {
    endPoint.value = -info.value.clientWidth
    if (info.value.clientWidth > boxInfo.value.clientWidth) {
      isAnimation.value = true
    } else {
      isAnimation.value = false
    }
  })
})
</script>

<style scoped lang="scss">
  .infoAnimation{
  animation-name: noticeboard;
  animation-duration: calc(v-bind(duration) * 1s);
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  &:hover{
    animation-play-state:paused;
  }
  }
  @keyframes noticeboard {
    from{
      transform: translateX(calc(v-bind(startingPoint) * 1px));
    }
    to{
      transform: translateX(calc(v-bind(endPoint) * 1px));
    }
  }
</style>
