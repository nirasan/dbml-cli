import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const distDir = './dist';

// dist ディレクトリを作成
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// esbuild でバンドル (CommonJS形式)
await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.cjs',
  format: 'cjs',
  external: [],
  minify: false,
  sourcemap: false
});

console.log('✓ Bundle created: dist/index.cjs');
