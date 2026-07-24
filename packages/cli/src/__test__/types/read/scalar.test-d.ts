import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// findFirst の結果型（select/omit/include なし）が全スカラーを持つ
{
  const r = client.User.findFirst({ where: { id: 1 } });
  type R = NonNullable<typeof r>;

  // 必須（@default あり）→ null にならない
  expectTypeOf<R["id"]>().toEqualTypeOf<number>();
  expectTypeOf<R["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<R["createdAt"]>().toEqualTypeOf<Date>();

  // 必須（@default なし）→ null にならない
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();

  // nullable（Type?）→ | null
  expectTypeOf<R["name"]>().toEqualTypeOf<string | null>();
  expectTypeOf<R["age"]>().toEqualTypeOf<number | null>();
}

// findMany / findFirstOrThrow でも同じ結果型
{
  const rs = client.User.findMany({ where: {} });
  expectTypeOf<(typeof rs)[number]["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<(typeof rs)[number]["age"]>().toEqualTypeOf<number | null>();

  const r = client.User.findFirstOrThrow({ where: { id: 1 } });
  expectTypeOf<(typeof r)["isActive"]>().toEqualTypeOf<boolean>();
}

// Prisma 型 → TS 型のマッピング
{
  const p = client.Post.findFirstOrThrow({ where: { id: 1 } });
  type P = typeof p;
  expectTypeOf<P["title"]>().toEqualTypeOf<string>();
  expectTypeOf<P["published"]>().toEqualTypeOf<boolean>();
  expectTypeOf<P["authorId"]>().toEqualTypeOf<number>();
}

// @gassma.addType: 基底型にユニオンを追加する
{
  const r = client.User.findFirstOrThrow({ where: { id: 1 } });
  // score Float + addType boolean
  expectTypeOf<(typeof r)["score"]>().toEqualTypeOf<number | boolean>();
  // rating Int? + addType string, boolean
  expectTypeOf<(typeof r)["rating"]>().toEqualTypeOf<
    number | string | boolean | null
  >();

  const p = client.Post.findFirstOrThrow({ where: { id: 1 } });
  // content String? + addType number
  expectTypeOf<(typeof p)["content"]>().toEqualTypeOf<string | number | null>();
}

// enum → リテラルユニオン。@map 付きは値側にマップされる
{
  const m = client.Member.findFirstOrThrow({ where: { id: 1 } });
  type M = typeof m;
  expectTypeOf<M["role"]>().toEqualTypeOf<"ADMIN" | "USER" | "MODERATOR">();
  expectTypeOf<M["status"]>().toEqualTypeOf<"ACTIVE" | "ARCHIVED">();
}

// @gassma.replaceType: 基底型を置換する（string を含まない）
{
  const m = client.Member.findFirstOrThrow({ where: { id: 1 } });
  expectTypeOf<(typeof m)["size"]>().toEqualTypeOf<"small" | "large">();
}

// @updatedAt: 結果型では必須（null にならない）
{
  const m = client.Member.findFirstOrThrow({ where: { id: 1 } });
  expectTypeOf<(typeof m)["updatedAt"]>().toEqualTypeOf<Date>();
}

// @map: コード上のフィールド名でアクセスする（シート側の名前は出てこない）
{
  const m = client.Member.findFirstOrThrow({ where: { id: 1 } });
  expectTypeOf<(typeof m)["firstName"]>().toEqualTypeOf<string>();
  expectTypeOf<typeof m>().not.toHaveProperty("名前");
}

// @ignore: 結果型から除外される
{
  const m = client.Member.findFirstOrThrow({ where: { id: 1 } });
  expectTypeOf<typeof m>().not.toHaveProperty("secret");
}

// @@ignore: クライアントから除外される
{
  expectTypeOf<GassmaClient>().not.toHaveProperty("AuditLog");
}

// @@map: コード上はモデル名でアクセスする
{
  expectTypeOf<GassmaClient>().toHaveProperty("Member");
  expectTypeOf<GassmaClient>().not.toHaveProperty("メンバー一覧");
}
