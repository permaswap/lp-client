module.exports = {
  configureWebpack: {
    module: {
      rules: [{
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }]
    },
    plugins: [
      require('unplugin-element-plus/webpack')({
        // options
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Permaswap',
        icon: './src/build/icons/icon.png'
      }
    }
  }
}
