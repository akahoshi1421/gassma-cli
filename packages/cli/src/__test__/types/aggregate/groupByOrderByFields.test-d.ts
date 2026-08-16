import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";
import { GassmaClient as StrictClient } from "../__generated__/clientStrict";

declare const client: GassmaClient;

// groupBy: by に含まれない列では orderBy できない（Prisma パリティ）
{
  // @ts-expect-error "age" は by に無い
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    orderBy: { age: "asc" },
  });
}

// groupBy: by が単一文字列でも効く
{
  // @ts-expect-error "id" は by に無い
  client.Member.groupBy({
    by: "role",
    _count: { id: true },
    orderBy: { id: "asc" },
  });
}

// groupBy: 配列 orderBy の一つでも by に無ければ拒否
{
  // @ts-expect-error "title" は by に無い
  client.Post.groupBy({
    by: ["published", "authorId"],
    _count: { id: true },
    orderBy: [{ published: "asc" }, { title: "asc" }],
  });
}

// groupBy: by に含まれる列なら orderBy できる
{
  client.User.groupBy({ by: ["isActive"], orderBy: { isActive: "asc" } });
  client.Member.groupBy({
    by: "role",
    _count: { id: true },
    orderBy: { role: "asc" },
  });
  client.User.groupBy({
    by: ["isActive", "age"],
    orderBy: [{ isActive: "asc" }, { age: "desc" }],
  });
}

// groupBy: 集計値の orderBy は by に無くても通る（本体 #158 / #226）
{
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  client.User.groupBy({ by: ["isActive"], orderBy: { _sum: { age: "desc" } } });
  client.User.groupBy({ by: ["isActive"], orderBy: { _avg: { age: "asc" } } });
  client.User.groupBy({
    by: ["isActive"],
    orderBy: { _max: { email: "asc" } },
  });
  client.User.groupBy({
    by: ["isActive"],
    orderBy: { _min: { createdAt: "desc" } },
  });
}

// groupBy: 集計値と by の列を混ぜた配列 orderBy も通る
{
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    orderBy: [{ _count: { id: "desc" } }, { isActive: "asc" }],
  });
}

// groupBy: SortOrderInput 形式でも by に含まれていれば通る
{
  client.User.groupBy({
    by: ["age"],
    orderBy: { age: { sort: "asc", nulls: "last" } },
  });
}

// groupBy: 2つの制約は同時に効く（by に無い列 + take）
{
  // @ts-expect-error "age" は by に無い
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    take: 10,
    orderBy: { age: "asc" },
  });
}

// gassma-test の実機テストで使われている形（型エラーにならないこと）
{
  const posts = client.Post.groupBy({
    by: ["published", "authorId"],
    _count: { id: true },
    orderBy: [{ published: "asc" }, { authorId: "asc" }],
    take: 10,
  });
  expectTypeOf<(typeof posts)[number]["published"]>().toEqualTypeOf<boolean>();
  expectTypeOf<
    (typeof posts)[number]["_count"]["id"]
  >().toEqualTypeOf<number>();

  const members = client.Member.groupBy({
    by: "role",
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });
  expectTypeOf<(typeof members)[number]["role"]>().toEqualTypeOf<
    "ADMIN" | "USER" | "MODERATOR"
  >();
}

// findMany / aggregate は by を持たないので影響しない
{
  client.User.findMany({ orderBy: { age: "asc" } });
  client.User.aggregate({ _count: { id: true }, orderBy: { age: "asc" } });
}

// strictUndefinedChecks 生成物でも同じ制約がかかる
{
  const strictClient = new StrictClient();
  // @ts-expect-error "age" は by に無い
  strictClient.User.groupBy({ by: ["isActive"], orderBy: { age: "asc" } });
  strictClient.User.groupBy({ by: ["isActive"], orderBy: { isActive: "asc" } });
}
