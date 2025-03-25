import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://threadtalk-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://threadtalk-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // 新增SPA回退配置
    historyApiFallback: true
  },
  // 新增构建配置
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './dashboard.html',
        profile: './profile.html'
      }
    }
  }
});