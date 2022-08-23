<template>
  <input
    :value="inputText"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :type="type"
    @focus="$emit('focus')"
    @input="handleInput"
  >
</template>

<script lang="ts">
import { formatInputPrecision } from '@/lib/util'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    inputText: {
      type: String,
      default: ''
    },
    maxlength: {
      type: Number,
      default: 1000
    },
    type: {
      type: String,
      default: 'number'
    },
    textRight: {
      type: Boolean,
      default: false
    },
    inputTextModifiers: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    },
    precision: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:inputText', 'focus'],
  setup (props, context) {
    const handleInput = (e: any) => {
      if (props.inputTextModifiers.precise) {
        // fix can't input 0.0 or 1.x etc.
        if (e.target.value !== props.inputText) {
          // e.target.value 没有 小数点
          // 为了解决光标问题
          // props.inputText 0.0
          // e.target.value 0
          // 在删除小数点的时候，更新数据，(把光标移动到最后)
          if (props.inputText.replace(e.target.value, '').match(/^\.\d+$/g)) {
            context.emit('update:inputText', e.target.value)
          } else {
            e.target.value = formatInputPrecision(e.target.value as string, props.precision)
            context.emit('update:inputText', e.target.value)
          }
        }
      } else {
        context.emit('update:inputText', e.target.value)
      }
    }

    return {
      handleInput
    }
  }
})
</script>

<style lang="scss" scoped>
input {
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
  &::placeholder {
    color: #c2c1cf;
  }
  -moz-appearance: textfield;
  outline: none;
}
</style>
