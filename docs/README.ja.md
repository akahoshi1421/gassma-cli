# GASsma-cli

日本語 | [English](../README.md)

GASsma-cli は [GASsma](https://github.com/akahoshi1421/gassma) 用の CLI ツールです。

Prisma CLI と同様に、`.prisma` ファイルから GASsma 用の型定義ファイルとクライアント JS ファイルを生成します。

GASsma-cli を使わない場合、リレーションやデフォルト値などの設定を手動で記述する必要があります。GASsma-cli を使えば、`.prisma` ファイルを利用することで Prisma とほぼ同じ開発体験が得られます。

## 使い方

1. GASsma-cli をインストール

```sh
npm i gassma
```

2. init コマンドを実行

```sh
npx gassma init
```

上記コマンドを実行すると、`schema.prisma` と `gassma.config.ts` が生成されます。

3. データベース定義と設定を記述

例...

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String?
  age   Int
  profile Profile?
}

model Profile {
  id      Int     @id @default(autoincrement())
  bio     String?
  website String?
  userId  Int     @id
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

`schemaClient.js` と `schemaClient.d.ts` が生成されます。

5. 開発

生成されたクライアントファイル（`schemaClient.js`）をインポートすることで、データベースのリレーションやその他の定義が組み込まれた状態で、Prisma と同じように GASsma で開発できます。

```ts
import { GassmaClient } from "../generated/gassma2/schemaClient";

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

スキーマファイルと `gassma.config.ts` ファイルを生成します。

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
|`--watch`|変更を監視して自動的に再生成|

### format

`.prisma` ファイルをフォーマットします。

#### オプション

|名前|説明|
|--|--|
|`--schema <path>`|フォーマット対象の `.prisma` ファイルのパス|
|`--check`|ファイルを変更せずにフォーマット済みかチェック|

### validate

`.prisma` ファイルをバリデーションします。

#### オプション

|名前|説明|
|--|--|
|`--schema <path>`|バリデーション対象の `.prisma` ファイルのパス|

## 詳細リファレンス

https://akahoshi1421.github.io/gassma-reference/docs/reference/type-generation/

## ライセンス

MIT
