#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parseSQLToSimplifiedJSON, SQLParseError } from './parser.js';
import { parseArgs, printHelp } from './cli-args.js';

const VERSION = '0.1.0';

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      printHelp();
      process.exit(0);
    }

    if (args.version) {
      console.log(`dbml-cli v${VERSION}`);
      process.exit(0);
    }

    // db-type は必須
    if (!args.dbType) {
      console.error('Error: --db-type (-t) is required');
      printHelp();
      process.exit(1);
    }

    let ddlContent;

    // 標準入力から読み込むか、ファイルから読み込むか
    if (args.stdin) {
      // 標準入力から読み込み
      ddlContent = await new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', chunk => data += chunk);
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
      });
    } else {
      // ファイルから読み込み
      if (!args.input) {
        console.error('Error: Input file is required (or use --stdin)');
        printHelp();
        process.exit(1);
      }

      const inputPath = path.resolve(args.input);
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
      }

      ddlContent = fs.readFileSync(inputPath, 'utf-8');
    }

    // DDL を DBML JSON に変換
    const options = {
      dialect: args.dbType,
      skipUnsupported: true
    };

    let output;
    try {
      output = parseSQLToSimplifiedJSON(ddlContent, options);
    } catch (error) {
      if (error instanceof SQLParseError) {
        console.error(error.message);
      } else {
        console.error('Unexpected error:', error.message);
      }
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }

    // 出力
    if (args.output) {
      const outputPath = path.resolve(args.output);
      fs.writeFileSync(outputPath, output, 'utf-8');
      console.error(`Output written to: ${outputPath}`);
    } else {
      // 標準出力に出力（console.log だと改行が追加されるので process.stdout.write を使用）
      process.stdout.write(output);
      process.stdout.write('\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
