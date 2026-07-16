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
  expectTypeOf<(typeof r)[number]["_count"]["id"]>().toEqualTypeOf<
    number | null
  >();
}

// groupBy: having を受け付ける
{
  client.User.groupBy({
    by: ["isActive"],
    _avg: { age: true },
    having: { age: { _avg: { gt: 20 } } },
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
