import {
  ElIcon,
  ElSwitch,
  ElMessage
} from 'element-plus'

const components = [
  ElIcon,
  ElSwitch,
  ElMessage
]

const plugins = [
  ElMessage
]

export const importElementPlus = (app: any): void => {
  components.forEach(component => {
    app.component(component.name, component)
  })

  plugins.forEach(plugin => {
    app.use(plugin)
  })
}
