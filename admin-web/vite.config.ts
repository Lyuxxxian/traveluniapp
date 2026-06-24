import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const serveStatic = require('serve-static')

const uniappStatic = path.resolve(__dirname, '../src/static')

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'serve-uniapp-static',
      configureServer(server) {
        server.middlewares.use('/static', serveStatic(uniappStatic))
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
  },
})
