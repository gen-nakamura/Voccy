const { defineConfig } = require('@vue/cli-service')
const Dotenv = require('dotenv-webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    configureWebpack: {
      plugins: [
        new Dotenv()
      ]
    },
    electronBuilder: {
      builderOptions: {
        "appId": "voccy_gen-nakamura",
        "productName": "Voccy",
        "icon": "src/build/icon.png",
        "publish": [{
          "provider": "github",
          "owner": "gen-nakamura",
          "repo": "Voccy"
        }],
        win: {
          target: 'nsis' // NSISインストーラーを使用してEXEファイルをエクスポート
        }
      }
    }
  }
})
