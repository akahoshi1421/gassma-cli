# GASsma-cli

日本語 | [English](../README.md)

GASsma-cli は [GASsma](https://github.com/akahoshi1421/gassma) 用の CLI ツールです。

Prisma CLI と同様に、`.prisma` ファイルから GASsma 用の型定義ファイルとクライアント JS ファイルを生成します。

GASsma-cli を使わない場合、リレーションやデフォルト値などの設定を手動で記述する必要があります。GASsma-cli を使えば、`.prisma` ファイルを利用することで Prisma とほぼ同じ開発体験が得られます。

## 使い方

> 新規プロジェクトなら `npx gassma bootstrap` 一発で、GAS のローカル開発環境（clasp + esbuild + TypeScript + GASsma）をまとめてセットアップできます。詳細は下の [bootstrap](#bootstrap) を参照してください。以下の手順は既存プロジェクトに GASsma を追加する場合のものです。

1. GASsma-cli をインストール

```sh
npm i gassma
```

2. init コマンドを実行

```sh
npx gassma init
```

上記コマンドを実行すると、`gassma/schema.prisma` と `gassma.config.ts` が生成されます。

3. データベース定義と設定を記述

例...

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./src/generated/gassma"
}

model User {
  id      Int      @id @default(autoincrement())
  name    String
  email   String?
  age     Int
  profile Profile?
}

model Profile {
  id      Int     @id @default(autoincrement())
  bio     String?
  website String?
  userId  Int     @unique
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
}
```

```ts
import { defineConfig } from "gassma/config";

export default defineConfig({
  schema: "gassma/schema.prisma",
  datasource: {
    url: "", // GAS に結びついていないスプレッドシートを操作する場合は、スプレッドシートの URL を記入してください。
  },
});
```

[NOTE] GASsma-cli には Prisma と同様に `format` と `validate` コマンドもあります。

4. 生成コマンドを実行

```sh
npx gassma generate
```

generator ブロックの `output` ディレクトリに `schemaClient.js` と `schemaClient.d.ts` が生成されます。

ファイル名はスキーマファイル名から決まります（`schema.prisma` -> `schemaClient.*`）。スキーマは同じディレクトリ内の複数の `.prisma` ファイルに分割することもでき、自動でマージされます。その場合のファイル名はディレクトリ名から決まります（`gassma/` -> `gassmaClient.*`）。

5. 開発

生成されたクライアントファイル（`schemaClient.js`）をインポートすることで、データベースのリレーションやその他の定義が組み込まれた状態で、Prisma と同じように GASsma で開発できます。

```ts
import { GassmaClient } from "./generated/gassma/schemaClient";

const gassma = new GassmaClient();

function myFunction() {
  const result = gassma.User.findMany({
    where: {
      id: { gte: 10 }
    }
  });

  console.log(result);
}
```

## CLI コマンドリファレンス

### init

`gassma/schema.prisma` と `gassma.config.ts` ファイルを生成します。

#### オプション

|名前|説明|
|--|--|
|`--output <path>`|生成ファイルのカスタム出力先パス|
|`--with-model`|サンプルの User モデルをスキーマに含める|

### generate

`.prisma` ファイルから型定義ファイルと、リレーション設定・autoincrement・デフォルト値などが組み込まれたクライアント JS ファイルを生成します。

#### オプション

|名前|説明|
|--|--|
|`--schema <path>`|生成対象の `.prisma` ファイルのパス|
|`--config <path>`|GASsma config ファイルのカスタムパス|
|`--watch`|変更を監視して自動的に再生成|

### format

`.prisma` ファイルをフォーマットします。

#### オプション

|名前|説明|
|--|--|
|`--schema <path>`|フォーマット対象の `.prisma` ファイルのパス|
|`--config <path>`|GASsma config ファイルのカスタムパス|
|`--check`|ファイルを変更せずにフォーマット済みかチェック|

### validate

`.prisma` ファイルをバリデーションします。

#### オプション

|名前|説明|
|--|--|
|`--schema <path>`|バリデーション対象の `.prisma` ファイルのパス|
|`--config <path>`|GASsma config ファイルのカスタムパス|

### migrate

スキーマに合わせてスプレッドシートのシートを同期する GAS 関数を生成します。実行用スタブ `gassma-migration.js` を出力ディレクトリに、証跡 `migrations/<timestamp>[_name]/migration.js` をスキーマと同じディレクトリに生成します。`clasp push` は自動実行されません。スタブを push した後、Apps Script エディタで `gassmaMigrate` 関数を 1 回実行してください。

#### オプション

|名前|説明|
|--|--|
|`--name <name>`|マイグレーションの名前|
|`--output <dir>`|gassma-migration.js の出力先ディレクトリ（デフォルトは .clasp.json の rootDir）|
|`--schema <path>`|マイグレーション対象の `.prisma` ファイルのパス|
|`--config <path>`|GASsma config ファイルのカスタムパス|
|`--accept-data-loss`|スキーマに無いシート・列を削除|

### db push

`migrate` と同様に、スキーマに合わせてスプレッドシートのシートを同期する GAS 関数を生成しますが、証跡は記録しません。同じ実行用スタブ `gassma-migration.js` を出力ディレクトリに生成し、`migrations/` ディレクトリには一切触れません。マイグレーション履歴が不要な場合に使ってください。`clasp push` は自動実行されません。スタブを push した後、Apps Script エディタで `gassmaMigrate` 関数を 1 回実行してください。

#### オプション

|名前|説明|
|--|--|
|`--output <dir>`|gassma-migration.js の出力先ディレクトリ（デフォルトは .clasp.json の rootDir）|
|`--schema <path>`|同期対象の `.prisma` ファイルのパス|
|`--config <path>`|GASsma config ファイルのカスタムパス|
|`--accept-data-loss`|スキーマに無いシート・列を削除|

### bootstrap

GAS のローカル開発環境（clasp + esbuild + TypeScript + GASsma）を対話形式でセットアップします。clasp で Apps Script プロジェクトを作成し、GASsma ライブラリを登録し、プロジェクトファイル（`package.json`・`esbuild.mjs`・`tsconfig.json`・`.gitignore`・サンプルの `src/index.ts`）を生成して `gassma init` を実行し、依存関係をインストールします。

```sh
npx gassma bootstrap my-app   # my-app/ を作成してその中にセットアップ
npx gassma bootstrap          # 最初にディレクトリを質問
npx gassma bootstrap .        # カレントディレクトリにセットアップ
```

[clasp](https://github.com/google/clasp) が必要です: `npm install -g @google/clasp` の後、`clasp login` してください。詳細は [bootstrap リファレンス](https://akahoshi1421.github.io/gassma-reference/docs/reference/bootstrap)を参照してください。

#### 引数

|名前|説明|
|--|--|
|`[directory]`|セットアップ先のディレクトリ（カレントディレクトリなら `.`）。省略すると対話で質問|

#### オプション

|名前|説明|
|--|--|
|`--yes`|すべての質問にデフォルト値で回答|
|`--skip-install`|依存関係のインストールをスキップ|
|`--dry-run`|ファイルの書き込みやコマンド実行をせずに実行予定の内容を表示|

### studio

データソースのスプレッドシートをデフォルトブラウザで開きます。

#### オプション

|名前|説明|
|--|--|
|`--config <path>`|GASsma config ファイルのカスタムパス|

### debug

デバッグやバグ報告に役立つ情報（ランタイム・config・スキーマ・clasp など）を表示します。

#### オプション

|名前|説明|
|--|--|
|`--schema <path>`|調査対象の `.prisma` ファイルのパス|
|`--config <path>`|GASsma config ファイルのカスタムパス|

### version

GASsma CLI の現在のバージョンを表示します。

#### オプション

|名前|説明|
|--|--|
|`--json`|バージョン情報を JSON で出力|

## config ファイル

config ファイルはカレントディレクトリから `gassma.config.{js,ts,mjs,cjs,mts,cts}`、次に `.config/gassma.{js,ts,mjs,cjs,mts,cts}` の順で探索されます。`--config <path>` で探索を上書きできます。`gassma/config` の `env("NAME")` ヘルパーで config ファイル内から環境変数を読み取れます。

スキーマの generator ブロックでは `previewFeatures = ["strictUndefinedChecks"]` もサポートしています。詳細は [strictUndefinedChecks リファレンス](https://akahoshi1421.github.io/gassma-reference/docs/reference/config/strict-undefined-checks)を参照してください。

## 詳細リファレンス

https://akahoshi1421.github.io/gassma-reference/docs/reference/type-generation/

## ライセンス

MIT
