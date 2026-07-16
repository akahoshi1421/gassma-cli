import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// orderBy: asc / desc
{
  client.User.findMany({ where: {}, orderBy: { id: "asc" } });
  client.User.findMany({ where: {}, orderBy: { email: "desc" } });
}

// orderBy: SortOrderInput（nulls 制御）
{
  client.User.findMany({
    where: {},
    orderBy: { name: { sort: "asc", nulls: "last" } },
  });
  client.User.findMany({
    where: {},
    orderBy: { age: { sort: "desc", nulls: "first" } },
  });
}

// orderBy: relation フィールドでソート
{
  client.User.findMany({
    where: {},
    orderBy: { posts: { _count: "desc" } },
  });
  client.Post.findMany({
    where: {},
    orderBy: { author: { email: "asc" } },
  });
}

// orderBy: _count でソート
{
  client.User.findMany({
    where: {},
    orderBy: { _count: { posts: "desc" } },
  });
}

// orderBy: 配列形式（複数キーソート）
{
  client.User.findMany({
    where: {},
    orderBy: [{ id: "asc" }, { email: "desc" }],
  });
  // relation ソートとの併用も配列で
  client.User.findMany({
    where: {},
    orderBy: [{ posts: { _count: "desc" } }, { name: "asc" }],
  });
}

// orderBy: 不正な方向は拒否
{
  // @ts-expect-error "ascending" は無効（asc | desc のみ）
  client.User.findMany({ where: {}, orderBy: { id: "ascending" } });
}

// cursor: Partial<Use>（任意のフィールドで指定可）
{
  client.User.findMany({ where: {}, cursor: { id: 1 } });
  client.User.findMany({ where: {}, cursor: { email: "a@example.com" } });
  // 複数フィールドも可
  client.User.findMany({
    where: {},
    cursor: { id: 1, email: "a@example.com" },
  });
}

// distinct: フィールド名（単一 / 配列）
{
  client.User.findMany({ where: {}, distinct: "email" });
  client.User.findMany({ where: {}, distinct: ["email", "name"] });
}

// distinct: 存在しないフィールドは拒否
{
  // @ts-expect-error "nonexistent" は User のフィールドでない
  client.User.findMany({ where: {}, distinct: "nonexistent" });
}

// take / skip: number
{
  client.User.findMany({ where: {}, take: 10, skip: 5 });
}
