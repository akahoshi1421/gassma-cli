import { expectTypeOf } from "vitest";
import type {
  GassmaClient,
  GassmaUserUse,
  GassmaMemberUse,
} from "../__generated__/client";

declare const client: GassmaClient;

// create の data: @default / @updatedAt / nullable は省略できる
{
  // 必須（@default なし）だけ渡せば作れる
  const r = client.User.create({
    data: { email: "a@example.com", score: 0 },
  });
  expectTypeOf<(typeof r)["email"]>().toEqualTypeOf<string>();
}

// 入力型の optional / required
{
  // @default あり → 省略可
  expectTypeOf<GassmaUserUse>().toHaveProperty("id");
  expectTypeOf<GassmaUserUse["id"]>().toEqualTypeOf<number | undefined>();
  expectTypeOf<GassmaUserUse["isActive"]>().toEqualTypeOf<
    boolean | undefined
  >();
  expectTypeOf<GassmaUserUse["createdAt"]>().toEqualTypeOf<Date | undefined>();

  // @default なし・必須 → 省略不可（undefined を含まない）
  expectTypeOf<GassmaUserUse["email"]>().toEqualTypeOf<string>();
  expectTypeOf<GassmaUserUse["score"]>().toEqualTypeOf<number | boolean>();

  // nullable → 省略可、かつ null を渡せる
  expectTypeOf<GassmaUserUse["name"]>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<GassmaUserUse["age"]>().toEqualTypeOf<
    number | null | undefined
  >();
}

// @updatedAt は入力で省略可
{
  expectTypeOf<GassmaMemberUse["updatedAt"]>().toEqualTypeOf<
    Date | undefined
  >();
}

// enum / replaceType は入力型でもリテラルユニオン（enum @default あり → 省略可）
{
  expectTypeOf<GassmaMemberUse["role"]>().toEqualTypeOf<
    "ADMIN" | "USER" | "MODERATOR" | undefined
  >();
  expectTypeOf<GassmaMemberUse["status"]>().toEqualTypeOf<
    "ACTIVE" | "ARCHIVED" | undefined
  >();
  expectTypeOf<GassmaMemberUse["size"]>().toEqualTypeOf<"small" | "large">();
}

// enum @default: create で role / status を省略でき、結果は非 null
{
  const r = client.Member.create({
    data: { firstName: "田中", size: "small" },
  });
  expectTypeOf<(typeof r)["role"]>().toEqualTypeOf<
    "ADMIN" | "USER" | "MODERATOR"
  >();
  expectTypeOf<(typeof r)["status"]>().toEqualTypeOf<"ACTIVE" | "ARCHIVED">();
}

// @ignore は入力型からも除外される
{
  expectTypeOf<GassmaMemberUse>().not.toHaveProperty("secret");
}

// @map: 入力もコード上のフィールド名で渡す
{
  expectTypeOf<GassmaMemberUse["firstName"]>().toEqualTypeOf<string>();
  expectTypeOf<GassmaMemberUse>().not.toHaveProperty("名前");
}

// createMany の data は Use の配列
{
  const r = client.User.createMany({
    data: [{ email: "a@example.com", score: 0 }],
  });
  expectTypeOf<typeof r>().toEqualTypeOf<{ count: number }>();
}
