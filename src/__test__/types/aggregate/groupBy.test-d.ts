import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// groupBy: 配列を返す。by で指定したフィールドが結果型に出る
{
  const r = client.User.groupBy({ by: ["isActive"] });
  expectTypeOf<typeof r>().toBeArray();
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
}

// groupBy: by は単一文字列でも指定できる
{
  const r = client.User.groupBy({ by: "isActive" });
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
}

// groupBy: 複数キーの by（両方が結果型に出る）
{
  const r = client.User.groupBy({ by: ["isActive", "age"] });
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<(typeof r)[number]["age"]>().toEqualTypeOf<number | null>();
}

// groupBy: 集計を組み合わせる（by + _avg + _count）
{
  const r = client.User.groupBy({
    by: ["isActive"],
    _avg: { age: true },
    _count: { id: true },
  });
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<(typeof r)[number]["_avg"]["age"]>().toEqualTypeOf<
    number | null
  >();
  expectTypeOf<(typeof r)[number]["_count"]["id"]>().toEqualTypeOf<number>();
}

// groupBy: having を受け付ける
{
  client.User.groupBy({
    by: ["isActive"],
    _avg: { age: true },
    having: { age: { _avg: { gt: 20 } } },
  });
}

// groupBy: having の _count / _avg / _sum は数値 Filter（フィールド型に依らない）
{
  client.User.groupBy({
    by: ["email"],
    having: { email: { _count: { gt: 2 } } },
  });
  client.User.groupBy({
    by: ["email"],
    having: { email: { _avg: { gte: 1 }, _sum: { lt: 10 } } },
  });
}

// groupBy: having の _count / _avg / _sum に文字列は拒否
{
  client.User.groupBy({
    by: ["email"],
    // @ts-expect-error _count は数値 Filter（string は不可）
    having: { email: { _count: { gt: "x" } } },
  });
  client.User.groupBy({
    by: ["email"],
    // @ts-expect-error _avg は数値 Filter（string は不可）
    having: { email: { _avg: { gte: "x" } } },
  });
  client.User.groupBy({
    by: ["email"],
    // @ts-expect-error _sum は数値 Filter（string は不可）
    having: { email: { _sum: { lt: "x" } } },
  });
}

// groupBy: having の _min / _max はフィールド型 Filter のまま
{
  client.User.groupBy({
    by: ["email"],
    having: { email: { _min: { equals: "a@b.com" }, _max: { gt: "a" } } },
  });
  client.User.groupBy({
    by: ["email"],
    // @ts-expect-error _min は email のフィールド型 Filter（number は不可）
    having: { email: { _min: { equals: 5 } } },
  });
  client.User.groupBy({
    by: ["email"],
    // @ts-expect-error _max は email のフィールド型 Filter（number は不可）
    having: { email: { _max: { gt: 5 } } },
  });
}

// groupBy: by に存在しないフィールドは拒否
{
  // @ts-expect-error "nonexistent" は User のフィールドでない
  client.User.groupBy({ by: ["nonexistent"] });
}

// groupBy: orderBy 配列も受け付ける
{
  client.User.groupBy({
    by: ["isActive"],
    orderBy: [{ isActive: "asc" }],
  });
}

// groupBy: _avg / _sum の数値フィールド限定が AggregateData から波及する
{
  client.User.groupBy({ by: ["isActive"], _sum: { age: true } });
  // @ts-expect-error _sum は数値フィールド限定（name は string）
  client.User.groupBy({ by: ["isActive"], _sum: { name: true } });
}

// groupBy: _min / _max の enum 型保持が波及する
{
  const r = client.Member.groupBy({ by: ["role"], _min: { role: true } });
  expectTypeOf<(typeof r)[number]["_min"]["role"]>().toEqualTypeOf<
    "ADMIN" | "USER" | "MODERATOR" | null
  >();
}
