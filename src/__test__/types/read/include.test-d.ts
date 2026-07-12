import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// include: { posts: true } → posts は配列、要素は Post（oneToMany）
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: { posts: true },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["posts"]>().toBeArray();
  expectTypeOf<U["posts"][number]["title"]>().toEqualTypeOf<string>();
}

// include: { profile: true } → Profile | null（oneToOne・optional）
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: { profile: true },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["profile"]>().toBeNullable();
  expectTypeOf<NonNullable<U["profile"]>["bio"]>().toEqualTypeOf<string>();
}

// Post.author（manyToOne）→ User | null（スプレッドシートは FK 制約を持たないため常に null 許容）
{
  const p = client.Post.findFirst({
    where: { id: 1 },
    include: { author: true },
  });
  type P = NonNullable<typeof p>;
  expectTypeOf<P["author"]>().toBeNullable();
  expectTypeOf<NonNullable<P["author"]>["email"]>().toEqualTypeOf<string>();
}

// findMany でも posts は配列で返る
{
  const us = client.User.findMany({ where: {}, include: { posts: true } });
  expectTypeOf<
    (typeof us)[number]["posts"][number]["title"]
  >().toEqualTypeOf<string>();
}

// include しない場合はリレーションが結果型に存在しない
{
  const u = client.User.findFirst({ where: { id: 1 } });
  type U = NonNullable<typeof u>;
  expectTypeOf<U>().not.toHaveProperty("posts");
}

// ネスト include: posts -> tags
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: { posts: { include: { tags: true } } },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["posts"][number]["tags"]>().toBeArray();
  expectTypeOf<
    U["posts"][number]["tags"][number]["name"]
  >().toEqualTypeOf<string>();
}

// include 内 select: posts を title だけに絞る
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: { posts: { select: { title: true } } },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["posts"][number]["title"]>().toEqualTypeOf<string>();
  // select で絞ったので id は含まれない
  expectTypeOf<U["posts"][number]>().not.toHaveProperty("id");
}

// include の _count
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: { _count: { select: { posts: true } } },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["_count"]["posts"]>().toEqualTypeOf<number>();
}

// self-relation: Category.children（oneToMany 自己参照）
{
  const c = client.Category.findFirst({
    where: { id: 1 },
    include: { children: true },
  });
  type C = NonNullable<typeof c>;
  expectTypeOf<C["children"]>().toBeArray();
  expectTypeOf<C["children"][number]["name"]>().toEqualTypeOf<string>();
}

// self-relation ネスト: Category.children -> children
{
  const c = client.Category.findFirst({
    where: { id: 1 },
    include: { children: { include: { children: true } } },
  });
  type C = NonNullable<typeof c>;
  expectTypeOf<C["children"][number]["children"]>().toBeArray();
}

// self-relation: Category.parent（manyToOne 自己参照）→ null 許容
{
  const c = client.Category.findFirst({
    where: { id: 1 },
    include: { parent: true },
  });
  type C = NonNullable<typeof c>;
  expectTypeOf<C["parent"]>().toBeNullable();
}
