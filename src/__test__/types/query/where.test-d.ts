import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// where: フィールドに直接値を渡せる
{
  client.User.findMany({ where: { id: 1, email: "a@example.com" } });
}

// where: FilterConditions を渡せる（数値: 比較演算子）
{
  client.User.findMany({ where: { id: { gte: 1, lt: 100 } } });
  client.User.findMany({ where: { id: { in: [1, 2, 3], notIn: [4] } } });
  client.User.findMany({ where: { id: { equals: 1, not: 2 } } });
}

// where: 文字列マッチ + mode
{
  client.User.findMany({
    where: { email: { contains: "example", mode: "insensitive" } },
  });
  client.User.findMany({
    where: { email: { startsWith: "a", endsWith: "z" } },
  });
}

// where: nullable フィールドは null を直接渡せる
{
  client.User.findMany({ where: { name: null } });
  client.User.findMany({ where: { age: null } });
}

// where: 非 nullable フィールドに null は渡せない
{
  // @ts-expect-error email は非 nullable なので null 不可
  client.User.findMany({ where: { email: null } });
}

// where: AND / OR / NOT
{
  client.User.findMany({
    where: {
      AND: [{ id: 1 }, { email: "a@example.com" }],
    },
  });
  client.User.findMany({ where: { OR: [{ id: 1 }, { id: 2 }] } });
  client.User.findMany({ where: { NOT: { id: 1 } } });
  // AND は配列でも単体でも可
  client.User.findMany({ where: { AND: { id: 1 } } });
}

// where: relation filter（oneToMany → some / every / none）
{
  client.User.findMany({
    where: { posts: { some: { published: true } } },
  });
  client.User.findMany({ where: { posts: { every: {} } } });
  client.User.findMany({ where: { posts: { none: { published: false } } } });
}

// where: relation filter（oneToOne / manyToOne → is / isNot）
{
  client.User.findMany({
    where: { profile: { is: { bio: "hello" } } },
  });
  client.User.findMany({ where: { profile: { isNot: {} } } });

  client.Post.findMany({
    where: { author: { is: { email: "a@example.com" } } },
  });
}

// where: is / isNot に null（FK が null のレコード検索）
{
  client.User.findMany({ where: { profile: { is: null } } });
  client.User.findMany({ where: { profile: { isNot: null } } });
  client.Post.findMany({ where: { author: { is: null } } });
}

// where: to-one relation に直接 null（is: null のショートハンド）
{
  client.User.findMany({ where: { profile: null } });
  client.Post.findMany({ where: { author: null } });
  client.Category.findMany({ where: { parent: null } });
  // gassma に required 概念はないため FK 側 oneToOne も null 可（Prisma との差異）
  client.Profile.findMany({ where: { user: null } });
  client.User.findMany({ where: { posts: { some: { author: null } } } });
}

// where: list relation に直接 null は渡せない
{
  // @ts-expect-error posts は oneToMany なので null 不可
  client.User.findMany({ where: { posts: null } });
  // @ts-expect-error tags は manyToMany なので null 不可
  client.Post.findMany({ where: { tags: null } });
}

// where: nullable フィールドの FilterConditions で null を使える
{
  client.User.findMany({ where: { name: { equals: null } } });
  client.User.findMany({ where: { name: { not: null } } });
  client.User.findMany({ where: { age: { equals: null } } });
}

// where: 非 nullable フィールドの equals に null は不可
{
  // @ts-expect-error email は非 nullable なので equals: null 不可
  client.User.findMany({ where: { email: { equals: null } } });
}

// where: not / in / notIn に FieldRef は使えない（fields.md の制約）
{
  // @ts-expect-error not に FieldRef は使用不可
  client.User.findMany({ where: { id: { not: client.User.fields.age } } });
  // @ts-expect-error in に FieldRef は使用不可
  client.User.findMany({ where: { id: { in: [client.User.fields.age] } } });
}

// where: enum / addType / Date フィールドのフィルタ
{
  client.Member.findMany({
    where: { role: "ADMIN", status: { in: ["ACTIVE"] } },
  });
  // @ts-expect-error enum にないリテラルは不可
  client.Member.findMany({ where: { role: "SUPERADMIN" } });
  // @ts-expect-error @ignore された secret は where に存在しない
  client.Member.findMany({ where: { secret: "x" } });
  client.User.findMany({ where: { createdAt: { lte: new Date() } } });
}

// where: NOT は配列でも可、OR は配列のみ
{
  client.User.findMany({ where: { NOT: [{ id: 1 }, { id: 2 }] } });
  // @ts-expect-error OR は配列のみ（AND / NOT と異なる）
  client.User.findMany({ where: { OR: { id: 1 } } });
}

// where: relation filter の深いネスト
{
  client.User.findMany({
    where: { posts: { some: { author: { is: { email: "a@example.com" } } } } },
  });
}

// where: relation の single filter に list filter は使えない
{
  // @ts-expect-error profile は oneToOne なので some は使えない
  client.User.findMany({ where: { profile: { some: {} } } });
}

// where: FieldRef を equals / 比較に使える
{
  client.User.findMany({
    where: { id: { equals: client.User.fields.age } },
  });
  client.Post.findMany({
    where: { authorId: { gt: client.Post.fields.id } },
  });
}

// where は count / delete / update でも同じ型
{
  client.User.count({ where: { id: { gte: 1 } } });
  client.User.deleteMany({ where: { posts: { some: {} } } });
  client.User.updateMany({
    where: { name: null },
    data: { isActive: false },
  });
}
