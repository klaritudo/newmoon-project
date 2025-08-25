import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine if we're in production mode
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  // Set port based on environment
  const port = parseInt(env.VITE_PORT || (isProduction ? '3000' : '5173'))
  const host = env.VITE_HOST || (isProduction ? '0.0.0.0' : 'localhost')
  
  console.log(`Running in ${mode} mode on ${host}:${port}`)
  
  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
          // Prevent multiple instances of @emotion/react
          babelrc: false,
          configFile: false
        }
      })
    ],
    
    // Add dedupe for emotion packages
    optimizeDeps: {
      include: [
        '@mui/material',
        '@mui/icons-material',
        '@mui/icons-material/MoreVert',
        '@mui/icons-material/Person',
        '@mui/icons-material/CheckCircle',
        '@mui/icons-material/PauseCircleOutline',
        '@mui/icons-material/Delete',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache'
      ],
      force: isDevelopment // Only force in development
    },
    
    // Add special config for dependencies that might be duplicated
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@features': path.resolve(__dirname, './src/features'),
        '@services': path.resolve(__dirname, './src/services'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@app': path.resolve(__dirname, './src/app'),
        // Deduplicate emotion packages
        '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
        '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled')
      },
      dedupe: ['@emotion/react', '@emotion/styled', 'react', 'react-dom']
    },
    
    base: '/',
    
    // Server configuration (used for development)
    server: {
      port: isDevelopment ? 5173 : port,
      strictPort: true,
      host: '0.0.0.0', // Allow external access
      open: isDevelopment, // Only auto-open in development
      cors: true,
      force: isDevelopment,
      allowedHosts: [
        '.qnuta.com', // Allow all qnuta.com subdomains
      ],
      hmr: {
        port: 5173,
      },
      proxy: isDevelopment ? {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5100',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
        '/public': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5100',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5100',
          changeOrigin: true,
          ws: true
        },
        '/uploads': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5100',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
        '/user-api': {
          target: env.VITE_USER_API_URL || 'http://localhost:5101',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/user-api/, '')
        }
      } : undefined,
      fs: {
        // 정적 파일 접근 허용
        strict: false,
        allow: ['..', '/Applications/MAMP/htdocs/nm']
      }
    },
    
    // Preview server configuration (used for production preview)
    preview: {
      port: isProduction ? port : 4173,
      strictPort: true,
      host: host,
      open: false,
      cors: true,
      proxy: isProduction ? {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5100',
          changeOrigin: true,
          secure: false
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5100',
          changeOrigin: true,
          ws: true
        },
        '/uploads': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5100',
          changeOrigin: true,
          secure: false
        }
      } : undefined
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: isDevelopment || env.VITE_ENABLE_SOURCE_MAP === 'true',
      commonjsOptions: {
        // This helps with bundling and deduplication
        transformMixedEsModules: true
      },
      // Minification settings based on environment
      minify: isProduction ? 'esbuild' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: env.VITE_SHOW_CONSOLE_LOGS !== 'true',
          drop_debugger: true,
          pure_funcs: env.VITE_SHOW_CONSOLE_LOGS !== 'true' ? ['console.log', 'console.info'] : []
        }
      } : undefined,
      // Chunk size warnings
      chunkSizeWarningLimit: isProduction ? 1000 : 2000,
      // Rollup options for better code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // MUI와 Emotion을 하나의 청크로 통합하여 순환 참조 문제 해결
            'mui-emotion-vendor': [
              '@mui/material', 
              '@mui/icons-material', 
              '@mui/x-data-grid', 
              '@mui/x-date-pickers',
              '@emotion/react', 
              '@emotion/styled',
              '@emotion/cache'
            ],
            'utils': ['axios', 'date-fns', 'moment'],
          }
        }
      }
    },
    
    // ESBuild configuration
    esbuild: {
      drop: isProduction ? ['debugger'] : [],
      pure: isProduction && env.VITE_SHOW_CONSOLE_LOGS !== 'true' ? ['console.log', 'console.info'] : []
    },
    
    // Cache optimization
    cacheDir: 'node_modules/.vite',
    
    // Define global constants
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || mode),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'Admin Dashboard'),
      'import.meta.env.VITE_DEBUG': JSON.stringify(env.VITE_DEBUG || 'false')
    }
  }
})