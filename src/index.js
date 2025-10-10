#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Parser, ModelExporter } from '@dbml/core';
import { normalizeDatabase } from './normalizer.js';
import { parseArgs, printHelp } from './cli-args.js';

const VERSION = '0.1.0';

/**
 * Preprocess SQL to remove unsupported statements
 */
function preprocessSQL(sqlContent, skipUnsupported = true) {
  if (!skipUnsupported) {
    return sqlContent;
  }

  let processed = sqlContent;

  // Remove PostgreSQL-style functions with $$ delimiters
  processed = processed.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION[\s\S]*?\$\$[\s\S]*?\$\$[\s\S]*?;/gi, '');

  // Remove MySQL-style triggers (with BEGIN...END blocks)
  processed = processed.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER[\s\S]*?BEGIN[\s\S]*?END\s*;/gi, '');

  // Remove simple triggers (without BEGIN...END)
  processed = processed.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER[\s\S]*?;/gi, '');

  // Remove procedure calls
  processed = processed.replace(/CALL\s+[\s\S]*?;/gi, '');

  // Remove DROP statements for triggers and functions
  processed = processed.replace(/DROP\s+(?:TRIGGER|FUNCTION)[\s\S]*?;/gi, '');

  // Clean up multiple empty lines
  processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');

  return processed.trim();
}

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

    // 前処理: サポートされていないステートメントを削除
    const processedSQL = preprocessSQL(ddlContent, true);

    // DDL をパース（既存スクリプトと同じ2段階アプローチ）
    const dbType = args.dbType || 'mysql';

    let rawDatabase;
    try {
      switch (dbType) {
        case 'postgres':
          rawDatabase = Parser.parsePostgresToJSONv2(processedSQL);
          break;
        case 'mysql':
          rawDatabase = Parser.parseMySQLToJSONv2(processedSQL);
          break;
        case 'mssql':
          rawDatabase = Parser.parseMSSQLToJSONv2(processedSQL);
          break;
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }
    } catch (parseError) {
      console.error('Failed to parse SQL');
      console.error('Error:', parseError.message);
      console.error('SQL content length:', ddlContent.length, 'characters');
      console.error('Database type:', dbType);
      if (process.env.DEBUG) {
        console.error('Stack trace:', parseError.stack);
      }
      process.exit(1);
    }

    const database = Parser.parseJSONToDatabase(rawDatabase);

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
