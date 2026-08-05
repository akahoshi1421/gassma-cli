import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";
import { GassmaClient as StrictGassmaClient } from "../__generated__/clientStrict";

declare const client: GassmaClient;
declare const strictClient: StrictGassmaClient;
declare const anyField: string;

// autoincrement フィールドを渡せる。戻り値は「次に発行される値」
{
  expectTypeOf(client.User.$getAutoincrement("id")).toEqualTypeOf<number>();
  expectTypeOf(client.User.$setAutoincrement("id", 1000)).toEqualTypeOf<void>();
  expectTypeOf(client.User.$syncAutoincrement("id")).toEqualTypeOf<number>();
}

// @@map されたモデルでもコード名でアクセスして呼べる
{
  expectTypeOf(client.Member.$getAutoincrement("id")).toEqualTypeOf<number>();
}

// autoincrement ではないフィールド名は弾かれる
{
  // @ts-expect-error email は autoincrement ではない
  client.User.$getAutoincrement("email");
  // @ts-expect-error name は autoincrement ではない
  client.User.$setAutoincrement("name", 1000);
  // @ts-expect-error createdAt は autoincrement ではない
  client.User.$syncAutoincrement("createdAt");
}

// typo は黙って通らない
{
  // @ts-expect-error "i" というフィールドは存在しない
  client.User.$getAutoincrement("i");
  // @ts-expect-error "Id" は大文字違い
  client.User.$syncAutoincrement("Id");
}

// 任意の文字列は受け付けない
{
  // @ts-expect-error string ではリテラルに絞り込めない
  client.User.$getAutoincrement(anyField);
}

// next は number のみ
{
  // @ts-expect-error next に文字列は渡せない
  client.User.$setAutoincrement("id", "1000");
  // @ts-expect-error next は省略できない
  client.User.$setAutoincrement("id");
}

// autoincrement を1つも持たないモデルでは呼べない
{
  // @ts-expect-error Enrollment に autoincrement フィールドは無い
  client.Enrollment.$getAutoincrement("studentId");
  // @ts-expect-error Enrollment に autoincrement フィールドは無い
  client.Enrollment.$setAutoincrement("studentId", 1);
  // @ts-expect-error Enrollment に autoincrement フィールドは無い
  client.Enrollment.$syncAutoincrement("courseId");
}

// トランザクション内でも読み取りは型として使える
{
  client.$transaction((tx) => tx.User.$getAutoincrement("id"));
}

// strict fixture でも同じ
{
  expectTypeOf(
    strictClient.Post.$getAutoincrement("id"),
  ).toEqualTypeOf<number>();
  // @ts-expect-error title は autoincrement ではない
  strictClient.Post.$syncAutoincrement("title");
}
