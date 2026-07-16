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
  // 0件ヒット時に null を返すため、集計値は | null（本体実装に一致）
  expectTypeOf<(typeof r)["_avg"]["age"]>().toEqualTypeOf<number | null>();
  expectTypeOf<(typeof r)["_sum"]["age"]>().toEqualTypeOf<number | null>();
  // _count も 0件時 null（本体挙動。Prisma は 0 だが本体差異は別タスク）
  expectTypeOf<(typeof r)["_count"]["id"]>().toEqualTypeOf<number | null>();
}

// aggregate: _min / _max は元のフィールド型 | null
{
  const r = client.User.aggregate({
    where: {},
    _min: { createdAt: true },
    _max: { email: true },
  });
  expectTypeOf<(typeof r)["_min"]["createdAt"]>().toEqualTypeOf<Date | null>();
  expectTypeOf<(typeof r)["_max"]["email"]>().toEqualTypeOf<string | null>();
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

// aggregate: _avg / _sum は数値フィールドのみ受け付ける（本体 avg.ts / sum.ts は非数値で throw）
{
  client.User.aggregate({ _avg: { age: true }, _sum: { score: true } });
  // addType で number を含む複合型（rating: Int? + addType string,boolean）は許容
  client.User.aggregate({ _avg: { rating: true }, _sum: { rating: true } });
  // _min / _max / _count は非数値フィールドも従来通り許容
  client.User.aggregate({
    _min: { email: true },
    _max: { createdAt: true },
    _count: { email: true },
  });
  // @ts-expect-error _avg は数値フィールド限定（email は string）
  client.User.aggregate({ _avg: { email: true } });
  // @ts-expect-error _sum に Date フィールドは指定不可
  client.User.aggregate({ _sum: { createdAt: true } });
  // @ts-expect-error _avg に enum フィールドは指定不可
  client.Member.aggregate({ _avg: { role: true } });
  // @ts-expect-error _sum に replaceType の文字列リテラルフィールドは指定不可
  client.Member.aggregate({ _sum: { size: true } });
}

// aggregate: _min / _max は enum・replaceType の完全な型を保つ（本体 min.ts / max.ts は実データをそのまま返す）
{
  const r = client.Member.aggregate({
    _min: { role: true, size: true },
    _max: { status: true },
  });
  expectTypeOf<(typeof r)["_min"]["role"]>().toEqualTypeOf<
    "ADMIN" | "USER" | "MODERATOR" | null
  >();
  expectTypeOf<(typeof r)["_min"]["size"]>().toEqualTypeOf<
    "small" | "large" | null
  >();
  expectTypeOf<(typeof r)["_max"]["status"]>().toEqualTypeOf<
    "ACTIVE" | "ARCHIVED" | null
  >();
}

// aggregate: addType の複合型も _min / _max で潰れない
{
  const r = client.User.aggregate({
    _min: { rating: true },
    _max: { score: true },
  });
  expectTypeOf<(typeof r)["_min"]["rating"]>().toEqualTypeOf<
    number | string | boolean | null
  >();
  expectTypeOf<(typeof r)["_max"]["score"]>().toEqualTypeOf<
    number | boolean | null
  >();
}

// aggregate: _avg / _sum は複合型フィールドでも常に number | null
{
  const r = client.User.aggregate({
    _avg: { rating: true },
    _sum: { score: true },
  });
  expectTypeOf<(typeof r)["_avg"]["rating"]>().toEqualTypeOf<number | null>();
  expectTypeOf<(typeof r)["_sum"]["score"]>().toEqualTypeOf<number | null>();
}
