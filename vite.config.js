import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { wasm } from '@rollup/plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import buildConfig from './build.config';

const copyFiles = {
  targets: [
    {
      src: 'node_modules/@element-hq/element-call-embedded/dist/*',
      dest: 'public/element-call',
    },
    {
      src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
      dest: '',
      rename: 'pdf.worker.min.js',
    },
    {
      src: 'netlify.toml',
      dest: '',
    },
    {
      src: 'config.json',
      dest: '',
    },
    {
      src: 'public/manifest.json',
      dest: '',
    },
    {
      src: 'public/res/android',
      dest: 'public/',
    },
    {
      src: 'public/locales',
      dest: 'public/',
    },
  ],
};

function serverMatrixSdkCryptoWasm(wasmFilePath) {
  return {
    name: 'vite-plugin-serve-matrix-sdk-crypto-wasm',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === wasmFilePath) {
          const resolvedPath = path.join(
            path.resolve(),
            '/node_modules/@matrix-org/matrix-sdk-crypto-wasm/pkg/matrix_sdk_crypto_wasm_bg.wasm'
          );

          if (fs.existsSync(resolvedPath)) {
            res.setHeader('Content-Type', 'application/wasm');
            res.setHeader('Cache-Control', 'no-cache');

            const fileStream = fs.createReadStream(resolvedPath);
            fileStream.pipe(res);
          } else {
            res.writeHead(404);
            res.end('File not found');
          }
        } else {
          next();
        }
      });
    },
  };
}

const getRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

function serveLocalReportApi() {
  let reportHandlerPromise;

  const loadReportHandler = async () => {
    if (!reportHandlerPromise) {
      reportHandlerPromise = import(new URL('./api/report.js', import.meta.url).href).then(
        (module) => module.default
      );
    }

    return reportHandlerPromise;
  };

  const handleReportRequest = async (req, res, next) => {
    const pathname = req.url?.split('?')[0];
    if (pathname !== '/api/report') {
      next();
      return;
    }

    try {
      if (req.method === 'POST' && req.body === undefined) {
        req.body = await getRequestBody(req);
      }

      const reportHandler = await loadReportHandler();
      await reportHandler(req, res);
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to process report request on the local server',
        })
      );
    }
  };

  return {
    name: 'vite-plugin-serve-local-report-api',
    configureServer(server) {
      server.middlewares.use(handleReportRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleReportRequest);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (!process.env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN) {
    process.env.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  }

  if (!process.env.TELEGRAM_REPORT_CHANNEL_ID && env.TELEGRAM_REPORT_CHANNEL_ID) {
    process.env.TELEGRAM_REPORT_CHANNEL_ID = env.TELEGRAM_REPORT_CHANNEL_ID;
  }

  return {
    appType: 'spa',
    publicDir: false,
    base: buildConfig.base,
    server: {
      port: 8080,
      host: true,
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
    plugins: [
      serveLocalReportApi(),
      serverMatrixSdkCryptoWasm('/node_modules/.vite/deps/pkg/matrix_sdk_crypto_wasm_bg.wasm'),
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: '__tla',
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: (i) => `__tla_${i}`,
      }),
      viteStaticCopy(copyFiles),
      vanillaExtractPlugin(),
      wasm(),
      react(),
      VitePWA({
        srcDir: 'src',
        filename: 'sw.ts',
        strategies: 'injectManifest',
        injectRegister: false,
        manifest: false,
        injectManifest: {
          injectionPoint: undefined,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          // Enable esbuild polyfill plugins
          NodeGlobalsPolyfillPlugin({
            process: false,
            buffer: true,
          }),
        ],
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      copyPublicDir: false,
      rollupOptions: {
        plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
      },
    },
  };
});
