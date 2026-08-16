import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";
import { GassmaClient as StrictClient } from "../__generated__/clientStrict";

declare const client: GassmaClient;

// groupBy: take があるのに orderBy が無いと拒否（Prisma パリティ）
{
  // @ts-expect-error take を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], _count: { id: true }, take: 10 });
}

// groupBy: skip があるのに orderBy が無いと拒否
{
  // @ts-expect-error skip を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], _count: { id: true }, skip: 1 });
}

// groupBy: skip が 0 でも拒否（型はキーの有無だけを見る・Prisma パリティ）
{
  // @ts-expect-error skip を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], _count: { id: true }, skip: 0 });
}

// groupBy: take: undefined でも拒否（キーが書かれているため・Prisma パリティ）
{
  // @ts-expect-error take を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], take: undefined });
}

// groupBy: take と skip を両方書いても拒否
{
  // @ts-expect-error take / skip を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], take: 10, skip: 5 });
}

// groupBy: orderBy があれば take / skip を書ける
{
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    take: 10,
    orderBy: { isActive: "asc" },
  });
  client.User.groupBy({
    by: ["isActive"],
    skip: 1,
    orderBy: [{ isActive: "asc" }],
  });
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    take: 10,
    skip: 5,
    orderBy: { _count: { id: "desc" } },
  });
}

// groupBy: take / skip が無ければ従来どおり orderBy は任意
{
  client.User.groupBy({ by: ["isActive"] });
  client.User.groupBy({ by: ["isActive"], _count: { id: true } });
  client.User.groupBy({
    by: ["isActive"],
    having: { age: { _avg: { gt: 1 } } },
  });
}

// groupBy: take + orderBy でも結果型はこれまでどおり解決する
{
  const r = client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    take: 10,
    orderBy: { _count: { id: "desc" } },
  });
  expectTypeOf<typeof r>().toBeArray();
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<(typeof r)[number]["_count"]["id"]>().toEqualTypeOf<number>();
}

// groupBy: 制約が付いても by の誤りは引き続き検出する
{
  // @ts-expect-error "nonexistent" は User のフィールドでない
  client.User.groupBy({ by: ["nonexistent"], take: 1, orderBy: { id: "asc" } });
}

// findMany: 同じ制約は無い（Prisma 実測。take だけで通る）
{
  client.User.findMany({ take: 10 });
  client.User.findMany({ skip: 5 });
  client.User.findMany({ take: 10, skip: 5 });
  client.User.findFirst({ take: 1 });
}

// aggregate: 同じ制約は無い（Prisma 実測）
{
  client.User.aggregate({ _count: { id: true }, take: 10 });
  client.User.aggregate({ _count: { id: true }, skip: 1 });
}

// strictUndefinedChecks 生成物でも同じ制約がかかる
{
  const strictClient = new StrictClient();
  // @ts-expect-error take を指定するなら orderBy も必要
  strictClient.User.groupBy({ by: ["isActive"], take: 10 });
  strictClient.User.groupBy({
    by: ["isActive"],
    take: 10,
    orderBy: { isActive: "asc" },
  });
}
