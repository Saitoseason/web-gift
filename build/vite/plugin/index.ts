import { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import purgeIcons from 'vite-plugin-purge-icons'
import windiCSS from 'vite-plugin-windicss'
import VitePluginCertificate from 'vite-plugin-mkcert'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { configHtmlPlugin } from './html'
import { configPwaConfig } from './pwa'
import { configMockPlugin } from './mock'
import { configCompressPlugin } from './compress'
import { configStyleImportPlugin } from './styleImport'
import { configVisualizerConfig } from './visualizer'
import { configThemePlugin } from './theme'
import { configImageminPlugin } from './imagemin'
import { configSvgIconsPlugin } from './svgSprite'
import importToCDN, { autoComplete } from 'vite-plugin-cdn-import'
import { visualizer } from 'rollup-plugin-visualizer'
export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const {
    VITE_USE_IMAGEMIN,
    VITE_USE_MOCK,
    VITE_LEGACY,
    VITE_BUILD_COMPRESS,
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
  } = viteEnv

  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // have to
    vue(),
    // have to
    vueJsx(),
    // support name
    //2023.6.10补充：该方法会导致本地开发debugger定位错误
    vueSetupExtend(),
    VitePluginCertificate({
      source: 'coding',
    }),
    visualizer({
      open: true, //注意这里要设置为true，否则无效
      filename: 'stats.html', //分析图生成的文件名
      gzipSize: true, // 收集 gzip 大小并将其显示
      brotliSize: true, // 收集 brotli 大小并将其显示
    }),
    importToCDN({
      prodUrl: 'https://unpkg.com/{name}@{version}/{path}',
      modules: [
        {
          name: 'Vue',
          var: 'Vue',
          path: 'https://unpkg.com/vue@3.2.33/dist/vue.global.js',
        },
        {
          name: 'XEUtils',
          var: 'XEUtils',
          path: 'https://unpkg.com/xe-utils@3.5.7/dist/xe-utils.umd.min.js',
        },

        {
          name: 'VXETable',
          var: 'VXETable',
          path: 'https://unpkg.com/vxe-table@4.3.12/lib/index.umd.js',
        },
        {
          name: 'echarts',
          var: 'echarts',
          path: 'https://unpkg.com/echarts@5.3.2/dist/echarts.js',
        },
      ],
    }),
  ]

  // vite-plugin-windicss
  vitePlugins.push(windiCSS())

  // @vitejs/plugin-legacy
  VITE_LEGACY && isBuild && vitePlugins.push(legacy())

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))

  // vite-plugin-svg-icons
  vitePlugins.push(configSvgIconsPlugin(isBuild))

  // vite-plugin-mock
  VITE_USE_MOCK && vitePlugins.push(configMockPlugin(isBuild))

  // vite-plugin-purge-icons
  vitePlugins.push(purgeIcons())

  // vite-plugin-style-import
  vitePlugins.push(configStyleImportPlugin(isBuild))

  // rollup-plugin-visualizer
  vitePlugins.push(configVisualizerConfig())

  // vite-plugin-theme
  vitePlugins.push(configThemePlugin(isBuild))

  // The following plugins only work in the production environment
  if (isBuild) {
    // vite-plugin-imagemin
    VITE_USE_IMAGEMIN && vitePlugins.push(configImageminPlugin())

    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE),
    )

    // vite-plugin-pwa
    vitePlugins.push(configPwaConfig(viteEnv))
  }

  return vitePlugins
}
