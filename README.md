# dbml-cli

DDL (Data Definition Language) から DBML (Database Markup Language) の JSON 中間データを生成する CLI ツールです。

[@dbml/core](https://www.dbml.org/) を使用して、MySQL、PostgreSQL、SQL Server などの DDL を解析し、構造化された JSON データとして出力します。

## 特徴

- ✅ **DDL → JSON 変換**: データベーススキーマを JSON 形式で出力
- ✅ **複数のデータベース対応**: MySQL、PostgreSQL、MSSQL など
- ✅ **ワンバイナリ**: 依存関係なしで動作する単一実行ファイル
- ✅ **クロスプラットフォーム**: Windows、Linux、macOS 対応
- ✅ **CI/CD 統合**: 他のプログラミング言語から簡単に呼び出し可能

## インストール

### バイナリダウンロード（推奨）

[Releases](https://github.com/YOUR_USERNAME/dbml-cli/releases) から、お使いのプラットフォーム向けのバイナリをダウンロードしてください。

各リリースには以下のファイルが含まれています：
- `dbml-cli-windows.exe` - Windows用バイナリ
- `dbml-cli-linux` - Linux用バイナリ
- `dbml-cli-macos` - macOS用バイナリ
- `checksums.txt` - すべてのファイルのSHA256チェックサム

#### Windows
```bash
# PowerShellでダウンロード（例：v0.1.0の場合）
Invoke-WebRequest -Uri "https://github.com/YOUR_USERNAME/dbml-cli/releases/download/v0.1.0/dbml-cli-windows.exe" -OutFile "dbml-cli.exe"

# チェックサムを検証（オプション）
Invoke-WebRequest -Uri "https://github.com/YOUR_USERNAME/dbml-cli/releases/download/v0.1.0/dbml-cli-windows.exe.sha256" -OutFile "dbml-cli.exe.sha256"
Get-FileHash dbml-cli.exe -Algorithm SHA256

# 使用
.\dbml-cli.exe schema.sql -o output.json
```

#### Linux
```bash
# ダウンロード（例：v0.1.0の場合）
wget https://github.com/YOUR_USERNAME/dbml-cli/releases/download/v0.1.0/dbml-cli-linux

# チェックサムを検証（オプション）
wget https://github.com/YOUR_USERNAME/dbml-cli/releases/download/v0.1.0/dbml-cli-linux.sha256
sha256sum -c dbml-cli-linux.sha256

# 実行権限を付与
chmod +x dbml-cli-linux

# PATH の通ったディレクトリに移動（例：/usr/local/bin）
sudo mv dbml-cli-linux /usr/local/bin/dbml-cli

# 使用
dbml-cli schema.sql -o output.json
```

#### macOS
```bash
# ダウンロード（例：v0.1.0の場合）
curl -L -o dbml-cli https://github.com/YOUR_USERNAME/dbml-cli/releases/download/v0.1.0/dbml-cli-macos

# チェックサムを検証（オプション）
curl -L -o dbml-cli.sha256 https://github.com/YOUR_USERNAME/dbml-cli/releases/download/v0.1.0/dbml-cli-macos.sha256
shasum -a 256 -c dbml-cli.sha256

# 実行権限を付与
chmod +x dbml-cli

# PATH の通ったディレクトリに移動（例：/usr/local/bin）
sudo mv dbml-cli /usr/local/bin/

# 使用
dbml-cli schema.sql -o output.json
```

### npm からインストール

```bash
npm install -g dbml-cli
```

## 使い方

### 基本的な使い方

```bash
# DDL を JSON に変換（標準出力）
dbml-cli schema.sql

# JSON ファイルに出力
dbml-cli schema.sql -o output.json

# PostgreSQL の DDL を変換
dbml-cli postgres-schema.sql -t postgres -o output.json

# 圧縮された JSON を出力（改行なし）
dbml-cli schema.sql --no-pretty -o output.json
```

### コマンドラインオプション

```
Usage:
  dbml-cli <input-file> [options]

Options:
  -o, --output <file>     Output file path (default: stdout)
  -f, --format <format>   Output format: 'json' or 'dbml' (default: json)
  -t, --db-type <type>    Database type: mysql, postgres, mssql, etc. (default: mysql)
  --no-pretty             Disable pretty printing for JSON output
  -h, --help              Show this help message
  -v, --version           Show version number
```

### サポートされるデータベース

- MySQL
- PostgreSQL
- Microsoft SQL Server (MSSQL)
- その他 @dbml/core がサポートするデータベース

## 出力例

### 入力 DDL (schema.sql)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 出力 JSON

```json
{
  "name": null,
  "note": null,
  "schemas": [
    {
      "name": "public",
      "tables": [
        {
          "name": "users",
          "fields": [
            {
              "name": "id",
              "type": { "type_name": "INT" },
              "pk": true,
              "unique": false,
              "not_null": false
            },
            {
              "name": "username",
              "type": { "type_name": "VARCHAR(50)" },
              "pk": false,
              "unique": true,
              "not_null": true
            }
          ],
          "indexes": []
        }
      ],
      "refs": [
        {
          "endpoints": [
            {
              "tableName": "posts",
              "fieldNames": ["user_id"],
              "relation": "*"
            },
            {
              "tableName": "users",
              "fieldNames": ["id"],
              "relation": "1"
            }
          ]
        }
      ]
    }
  ]
}
```

## 開発

### 必要な環境

- Node.js 20 以上

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/dbml-cli.git
cd dbml-cli

# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev test-schema.sql
```

### ビルド

#### バンドルのみ作成

```bash
npm run build
# 出力: dist/index.cjs
```

#### プラットフォーム別の実行ファイルを作成

```bash
# Windows
npm run build:windows
# 出力: dist/dbml-cli.exe

# Linux
npm run build:linux
# 出力: dist/dbml-cli

# macOS
npm run build:macos
# 出力: dist/dbml-cli
```

## CI/CD

このプロジェクトは GitHub Actions を使用して、3つのプラットフォーム向けのバイナリを自動的にビルドします。

- **main/master ブランチへの push**: ビルドのみ実行
- **タグ (v*) の push**: ビルド + GitHub Releases に自動アップロード

### リリースの作成

新しいバージョンをリリースする場合は、以下の手順でタグを作成してプッシュします：

```bash
# package.json のバージョンを更新
npm version patch  # または minor、major

# タグを作成（例：v0.1.0）
git tag v0.1.0

# タグをリモートにプッシュ
git push origin v0.1.0

# GitHub Actions が自動的に以下を実行：
# 1. Windows、Linux、macOS 向けにビルド
# 2. 各バイナリの SHA256 チェックサムを生成
# 3. GitHub Releases にすべてのファイルをアップロード
# 4. リリースノートを自動生成
```

リリースが作成されると、以下のファイルが GitHub Releases ページに公開されます：
- `dbml-cli-windows.exe` - Windows用実行ファイル
- `dbml-cli-windows.exe.sha256` - Windowsバイナリのチェックサム
- `dbml-cli-linux` - Linux用実行ファイル
- `dbml-cli-linux.sha256` - Linuxバイナリのチェックサム
- `dbml-cli-macos` - macOS用実行ファイル
- `dbml-cli-macos.sha256` - macOSバイナリのチェックサム
- `checksums.txt` - 全バイナリのチェックサム一覧

## 技術スタック

- **[@dbml/core](https://github.com/holistics/dbml)**: DDL のパースと DBML への変換
- **[esbuild](https://esbuild.github.io/)**: 高速なバンドラー
- **[Node.js SEA](https://nodejs.org/api/single-executable-applications.html)**: Single Executable Application
- **[postject](https://github.com/nodejs/postject)**: SEA の blob 注入ツール

## ライセンス

MIT

## 貢献

Issue や Pull Request を歓迎します！

## 関連リンク

- [DBML Documentation](https://www.dbml.org/docs/)
- [@dbml/core GitHub](https://github.com/holistics/dbml)
