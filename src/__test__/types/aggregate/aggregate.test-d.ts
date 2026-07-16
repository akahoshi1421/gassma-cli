import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// count: number を返す
{
  const r = client.User.count({ where: { isActive: true } });
  expectTypeOf<typeof r>().toEqualTypeOf<number>();
}

// aggregate: 指定した集計キーだけが結果型に出る
{
  const r = client.User.aggregate({
    where: {},
    _avg: { age: true },
  });
  // 指定していない _sum などは結果型に出ない
  expectTypeOf<typeof r>().not.toHaveProperty("_sum");
  expectTypeOf<typeof r>().toHaveProperty("_avg");
}

// aggregate: _avg / _sum は数値、_count は number
{
  const r = client.User.aggregate({
    where: {},
    _avg: { age: true },
    _sum: { age: true },
    _min: { age: true },
    _max: { age: true },
    _count: { id: true },
  });
  expectTypeOf<(typeof r)["_avg"]["age"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)["_sum"]["age"]>().toEqualTypeOf<number>();
  // _count は常に number
  expectTypeOf<(typeof r)["_count"]["id"]>().toEqualTypeOf<number>();
}

// aggregate: _min / _max は元のフィールド型を保つ
{
  const r = client.User.aggregate({
    where: {},
    _min: { createdAt: true },
    _max: { email: true },
  });
  expectTypeOf<(typeof r)["_min"]["createdAt"]>().toEqualTypeOf<Date>();
  expectTypeOf<(typeof r)["_max"]["email"]>().toEqualTypeOf<string>();
}

// aggregate: 集計キー内で指定していないフィールドは出ない
{
  const r = client.User.aggregate({ where: {}, _avg: { age: true } });
  expectTypeOf<(typeof r)["_avg"]>().not.toHaveProperty("id");
}

// aggregate: orderBy は配列形式も受け付ける（PR #91 の修正が波及）
{
  client.User.aggregate({
    where: {},
    orderBy: [{ id: "asc" }, { email: "desc" }],
    _count: { id: true },
  });
}
