import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const platform = process.argv[2] || 'windows';

const config = {
  windows: {
    nodeBinary: 'node.exe',
    outputBinary: 'dbml-cli.exe',
    postfixCommand: 'npx postject dist/dbml-cli.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
  },
  linux: {
    nodeBinary: 'node',
    outputBinary: 'dbml-cli',
    postfixCommand: 'npx postject dist/dbml-cli NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'
  },
  macos: {
    nodeBinary: 'node',
    outputBinary: 'dbml-cli',
    postfixCommand: 'npx postject dist/dbml-cli NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA'
  }
};

const platformConfig = config[platform];

if (!platformConfig) {
  console.error(`Unknown platform: ${platform}`);
  console.error('Available platforms: windows, linux, macos');
  process.exit(1);
}

console.log(`Building SEA for ${platform}...`);

try {
  // 1. Generate SEA blob
  console.log('Step 1: Generating SEA blob...');
  execSync('node --experimental-sea-config sea-config.json', { stdio: 'inherit' });

  // 2. Copy Node.js binary
  console.log(`Step 2: Copying Node.js binary (${platformConfig.nodeBinary})...`);
  const nodePath = execSync(`where ${platformConfig.nodeBinary}`, { encoding: 'utf-8' }).trim().split('\\n')[0];
  const outputPath = path.join('dist', platformConfig.outputBinary);

  fs.copyFileSync(nodePath, outputPath);

  // Linux/macOS の場合、実行権限を付与
  if (platform !== 'windows') {
    fs.chmodSync(outputPath, 0o755);
  }

  // 3. Inject SEA blob using postject
  console.log('Step 3: Injecting SEA blob...');

  // Windows の場合、signtool で署名を削除
  if (platform === 'windows') {
    try {
      execSync(`npx postject dist/${platformConfig.outputBinary} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Note: postject may require admin privileges on Windows');
      throw error;
    }
  } else {
    execSync(platformConfig.postfixCommand, { stdio: 'inherit' });
  }

  console.log(`✓ SEA binary created: ${outputPath}`);
  console.log(`\nYou can now run: ./${outputPath} --help`);

} catch (error) {
  console.error('Error building SEA:', error.message);
  process.exit(1);
}
