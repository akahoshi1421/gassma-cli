import { expectTypeOf } from "vitest";
import type { Gassma, GassmaTransactionClient } from "../__generated__/client";
import { GassmaClient } from "../__generated__/client";
import { GassmaClient as StrictGassmaClient } from "../__generated__/clientStrict";

declare const client: GassmaClient;
declare const omitClient: GassmaClient<{ User: { email: true } }>;
declare const strictClient: StrictGassmaClient;

// 戻り値の型はコールバックの戻り値がそのまま伝播する
{
  const num = client.$transaction(() => 42);
  expectTypeOf(num).toEqualTypeOf<number>();

  const rows = client.$transaction((tx) => tx.User.findMany({}));
  expectTypeOf(rows).toEqualTypeOf(client.User.findMany({}));
}

// tx のモデルは通常クライアントと同一の型
{
  client.$transaction((tx) => {
    expectTypeOf(tx.User).toEqualTypeOf<typeof client.User>();
    expectTypeOf(tx.Post).toEqualTypeOf<typeof client.Post>();
  });
}

// @@map モデルはコード名（Member）でアクセスでき、シート名では見えない
{
  client.$transaction((tx) => {
    const m = tx.Member.findFirstOrThrow({ where: { id: 1 } });
    expectTypeOf(m.role).toEqualTypeOf<"ADMIN" | "USER" | "MODERATOR">();
    // @ts-expect-error シート名（メンバー一覧）は型に存在しない
    tx["メンバー一覧"];
  });
}

// tx 型は GassmaTransactionClient として公開されている
{
  client.$transaction((tx) => {
    expectTypeOf(tx).toEqualTypeOf<GassmaTransactionClient>();
  });
}

// tx 内で $transaction は使えない（ネスト禁止）
{
  client.$transaction((tx) => {
    // @ts-expect-error tx に $transaction は存在しない
    tx.$transaction(() => 1);
  });
}

// options は maxWait / timeout / rollback のみ
{
  client.$transaction(() => 1, {});
  client.$transaction(() => 1, { maxWait: 1000 });
  client.$transaction(() => 1, { maxWait: 1000, timeout: 2000 });
  client.$transaction(() => 1, { rollback: false });
  client.$transaction(() => 1, { rollback: true });
  client.$transaction(() => 1, {
    maxWait: 1000,
    timeout: 2000,
    rollback: true,
  });

  // @ts-expect-error isolationLevel オプションは存在しない
  client.$transaction(() => 1, { isolationLevel: "Serializable" });
}

// 配列形（バッチ）は受け付けない
{
  // @ts-expect-error 配列形の $transaction は未サポート
  client.$transaction([client.User.findMany({})]);
}

// tx 内でも $extends が使え、戻り値は拡張クライアント
{
  client.$transaction((tx) => {
    const extended = tx.$extends({});
    expectTypeOf(extended.User.findMany).toEqualTypeOf<
      typeof client.User.findMany
    >();
  });
}

// $extends の戻り値には $transaction がない
{
  const extended = client.$extends({});
  // @ts-expect-error 拡張クライアントに $transaction は存在しない
  extended.$transaction;
}

// グローバル omit は tx にも引き継がれる
{
  omitClient.$transaction((tx) => {
    expectTypeOf(tx.User).toEqualTypeOf<typeof omitClient.User>();
    const user = tx.User.findFirstOrThrow({ where: { id: 1 } });
    // @ts-expect-error omit された email は結果に存在しない
    user.email;
  });
}

// strict fixture でも同様に $transaction が使える
{
  const num = strictClient.$transaction(() => 42);
  expectTypeOf(num).toEqualTypeOf<number>();

  strictClient.$transaction((tx) => {
    expectTypeOf(tx.User).toEqualTypeOf<typeof strictClient.User>();
    // @ts-expect-error tx に $transaction は存在しない
    tx.$transaction(() => 1);
  });
}

// トランザクション系エラーは Gassma namespace から利用できる
{
  expectTypeOf<Gassma.GassmaTransactionLockTimeoutError>().toExtend<Error>();
  expectTypeOf<Gassma.GassmaTransactionTimeoutError>().toExtend<Error>();
  expectTypeOf<Gassma.GassmaNestedTransactionError>().toExtend<Error>();
  expectTypeOf<
    ConstructorParameters<typeof Gassma.GassmaTransactionLockTimeoutError>
  >().toEqualTypeOf<[maxWaitMs: number]>();
  expectTypeOf<
    ConstructorParameters<typeof Gassma.GassmaTransactionTimeoutError>
  >().toEqualTypeOf<
    [phase: "query" | "commit", timeoutMs: number, elapsedMs: number]
  >();
  expectTypeOf<Gassma.GassmaTransactionRollbackError>().toExtend<Error>();
  expectTypeOf<
    ConstructorParameters<typeof Gassma.GassmaTransactionRollbackError>
  >().toEqualTypeOf<[backupSheetNames: string[]]>();
  expectTypeOf<
    Gassma.GassmaTransactionRollbackError["backupSheetNames"]
  >().toEqualTypeOf<string[]>();
}
