#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Parser, ModelExporter } from '@dbml/core';
import { normalizeDatabase } from './normalizer.js';
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

    if (!args.input) {
      console.error('Error: Input file is required');
      printHelp();
      process.exit(1);
    }

    // 入力ファイルを読み込み
    const inputPath = path.resolve(args.input);
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: Input file not found: ${inputPath}`);
      process.exit(1);
    }

    const ddlContent = fs.readFileSync(inputPath, 'utf-8');

    // DDL をパース
    const dbType = args.dbType || 'mysql';
    const parser = new Parser(dbType);
    const database = parser.parse(ddlContent, dbType);

    let output;

    // 出力形式に応じて変換
    if (args.format === 'dbml') {
      // DBML テキスト形式で出力
      // Note: ModelExporter には既知のバグがあるため、エラーをキャッチ
      try {
        output = ModelExporter.export(database, 'dbml');
      } catch (exportError) {
        console.error('Warning: DBML export failed, falling back to JSON export');
        console.error('Error:', exportError.message);
        const normalizedData = normalizeDatabase(database);
        output = JSON.stringify(normalizedData, null, args.pretty ? 2 : 0);
      }
    } else {
      // JSON 形式で出力（デフォルト）
      const normalizedData = normalizeDatabase(database);
      output = JSON.stringify(normalizedData, null, args.pretty ? 2 : 0);
    }

    // 出力
    if (args.output) {
      const outputPath = path.resolve(args.output);
      fs.writeFileSync(outputPath, output, 'utf-8');
      console.log(`Output written to: ${outputPath}`);
    } else {
      console.log(output);
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
