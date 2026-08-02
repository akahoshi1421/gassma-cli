import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// aggregate: _count: true は number を返す（Prisma 準拠の省略形）
{
  const r = client.User.aggregate({ _count: true });
  expectTypeOf<(typeof r)["_count"]>().toEqualTypeOf<number>();
}

// aggregate: _count: { _all: true } は { _all: number } を返す
{
  const r = client.User.aggregate({ _count: { _all: true } });
  expectTypeOf<(typeof r)["_count"]["_all"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)["_count"]>().not.toHaveProperty("email");
}

// aggregate: _count: { 列: true } は従来どおり非 NULL カウント型（回帰ガード）
{
  const r = client.User.aggregate({ _count: { email: true } });
  expectTypeOf<(typeof r)["_count"]["email"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)["_count"]>().not.toHaveProperty("_all");
}

// aggregate: _all と列の混在
{
  const r = client.User.aggregate({ _count: { _all: true, name: true } });
  expectTypeOf<(typeof r)["_count"]["_all"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)["_count"]["name"]>().toEqualTypeOf<number>();
}

// aggregate: _all は _count 専用（_avg / _sum / _max / _min は拒否）
{
  // @ts-expect-error _avg に _all は指定不可
  client.User.aggregate({ _avg: { _all: true } });
  // @ts-expect-error _sum に _all は指定不可
  client.User.aggregate({ _sum: { _all: true } });
  // @ts-expect-error _max に _all は指定不可
  client.User.aggregate({ _max: { _all: true } });
  // @ts-expect-error _min に _all は指定不可
  client.User.aggregate({ _min: { _all: true } });
}

// aggregate: true 省略形も _count 専用
{
  // @ts-expect-error _avg: true は指定不可
  client.User.aggregate({ _avg: true });
  // @ts-expect-error _sum: true は指定不可
  client.User.aggregate({ _sum: true });
  // @ts-expect-error _max: true は指定不可
  client.User.aggregate({ _max: true });
  // @ts-expect-error _min: true は指定不可
  client.User.aggregate({ _min: true });
}

// groupBy: _count: true は各要素の _count を number にする
{
  const r = client.User.groupBy({ by: ["isActive"], _count: true });
  expectTypeOf<(typeof r)[number]["_count"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
}

// groupBy: _count: { _all: true } は { _all: number } を返す
{
  const r = client.User.groupBy({ by: ["isActive"], _count: { _all: true } });
  expectTypeOf<(typeof r)[number]["_count"]["_all"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)[number]["_count"]>().not.toHaveProperty("email");
}

// groupBy: _count: { 列: true } は従来どおり（回帰ガード）
{
  const r = client.User.groupBy({ by: ["isActive"], _count: { email: true } });
  expectTypeOf<(typeof r)[number]["_count"]["email"]>().toEqualTypeOf<number>();
}

// groupBy: _all と列の混在
{
  const r = client.User.groupBy({
    by: ["isActive"],
    _count: { _all: true, email: true },
  });
  expectTypeOf<(typeof r)[number]["_count"]["_all"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof r)[number]["_count"]["email"]>().toEqualTypeOf<number>();
}

// groupBy: _all / true 省略形は _count 専用
{
  // @ts-expect-error _avg に _all は指定不可
  client.User.groupBy({ by: ["isActive"], _avg: { _all: true } });
  // @ts-expect-error _sum: true は指定不可
  client.User.groupBy({ by: ["isActive"], _sum: true });
  // @ts-expect-error _max に _all は指定不可
  client.User.groupBy({ by: ["isActive"], _max: { _all: true } });
  // @ts-expect-error _min: true は指定不可
  client.User.groupBy({ by: ["isActive"], _min: true });
}

// groupBy: having の _count は数値 Filter のまま（対象外の回帰ガード）
{
  client.User.groupBy({
    by: ["email"],
    _count: { _all: true },
    having: { email: { _count: { gt: 2 } } },
  });
}
