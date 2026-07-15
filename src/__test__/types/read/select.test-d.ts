import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// select スカラーのみ: 指定したキーだけが結果型に出る
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: { id: true, email: true },
  });
  type R = typeof r;
  expectTypeOf<R["id"]>().toEqualTypeOf<number>();
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();
  expectTypeOf<R>().not.toHaveProperty("name");
  expectTypeOf<R>().not.toHaveProperty("posts");
}

// select で relation を true 指定: 結果型に relation が出る（oneToMany → 配列）
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: { id: true, posts: true },
  });
  type R = typeof r;
  expectTypeOf<R["id"]>().toEqualTypeOf<number>();
  expectTypeOf<R["posts"]>().toBeArray();
  expectTypeOf<R["posts"][number]["title"]>().toEqualTypeOf<string>();
  // select していないスカラーは出ない
  expectTypeOf<R>().not.toHaveProperty("email");
}

// select で oneToOne relation: 単一 | null
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: { profile: true },
  });
  type R = typeof r;
  expectTypeOf<R["profile"]>().toBeNullable();
  expectTypeOf<NonNullable<R["profile"]>["bio"]>().toEqualTypeOf<string>();
}

// select で manyToOne relation: 単一 | null
{
  const r = client.Post.findFirstOrThrow({
    where: {},
    select: { id: true, author: true },
  });
  type R = typeof r;
  expectTypeOf<R["author"]>().toBeNullable();
  expectTypeOf<NonNullable<R["author"]>["email"]>().toEqualTypeOf<string>();
}

// select 内の relation に select（ネスト）: relation 先も絞られる
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: {
      id: true,
      posts: { select: { title: true } },
    },
  });
  type R = typeof r;
  expectTypeOf<R["posts"][number]["title"]>().toEqualTypeOf<string>();
  expectTypeOf<R["posts"][number]>().not.toHaveProperty("content");
}

// select + _count
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: {
      id: true,
      _count: { select: { posts: true } },
    },
  });
  type R = typeof r;
  expectTypeOf<R["_count"]["posts"]>().toEqualTypeOf<number>();
}

// self-relation の select
{
  const r = client.Category.findFirstOrThrow({
    where: {},
    select: { name: true, children: true },
  });
  type R = typeof r;
  expectTypeOf<R["children"]>().toBeArray();
  expectTypeOf<R["children"][number]["name"]>().toEqualTypeOf<string>();
}

// findMany でも select が効く
{
  const rs = client.User.findMany({
    where: {},
    select: { id: true, posts: true },
  });
  expectTypeOf<(typeof rs)[number]["posts"]>().toBeArray();
  expectTypeOf<(typeof rs)[number]>().not.toHaveProperty("email");
}
