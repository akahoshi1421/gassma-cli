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

// 深いネスト select（reference の findMany 例相当）: posts -> tags
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: {
      posts: {
        select: {
          title: true,
          tags: { select: { name: true } },
        },
      },
    },
  });
  type R = typeof r;
  expectTypeOf<R>().not.toHaveProperty("email");
  type P = R["posts"][number];
  expectTypeOf<P["title"]>().toEqualTypeOf<string>();
  expectTypeOf<P["tags"]>().toBeArray();
  expectTypeOf<P>().not.toHaveProperty("id");
  expectTypeOf<P>().not.toHaveProperty("content");
  expectTypeOf<P>().not.toHaveProperty("author");
  expectTypeOf<P["tags"][number]["name"]>().toEqualTypeOf<string>();
  expectTypeOf<P["tags"][number]>().not.toHaveProperty("id");
}

// ネスト select 内の relation true: 対象の全スカラー（manyToOne は | null）
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: { posts: { select: { author: true } } },
  });
  type P = (typeof r)["posts"][number];
  expectTypeOf<P>().not.toHaveProperty("title");
  expectTypeOf<P["author"]>().toBeNullable();
  type A = NonNullable<P["author"]>;
  expectTypeOf<keyof A>().toEqualTypeOf<
    | "id"
    | "email"
    | "name"
    | "age"
    | "isActive"
    | "score"
    | "rating"
    | "createdAt"
  >();
  expectTypeOf<A["email"]>().toEqualTypeOf<string>();
  expectTypeOf<A["name"]>().toEqualTypeOf<string | null>();
}

// 3階層の深いネスト select: posts -> tags -> posts
{
  const r = client.User.findFirstOrThrow({
    where: {},
    select: {
      posts: {
        select: {
          tags: {
            select: {
              posts: { select: { title: true } },
            },
          },
        },
      },
    },
  });
  type P = (typeof r)["posts"][number];
  expectTypeOf<P>().not.toHaveProperty("title");
  type T = P["tags"][number];
  expectTypeOf<T>().not.toHaveProperty("name");
  type PP = T["posts"][number];
  expectTypeOf<keyof PP>().toEqualTypeOf<"title">();
  expectTypeOf<PP["title"]>().toEqualTypeOf<string>();
}

// 深いネスト select でも存在しないキーは拒否される
{
  void client.User.findFirstOrThrow({
    where: {},
    select: {
      posts: {
        select: {
          // @ts-expect-error 存在しないキーは指定できない
          nonexistent: true,
        },
      },
    },
  });
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

// select 内 relation の orderBy: 単一・配列の両方を受け付ける
{
  client.User.findFirstOrThrow({
    where: {},
    select: { posts: { orderBy: { title: "asc" }, select: { title: true } } },
  });
  const r = client.User.findFirstOrThrow({
    where: {},
    select: {
      posts: {
        orderBy: [{ published: "desc" }, { title: "asc" }],
        select: { title: true },
      },
    },
  });
  expectTypeOf<(typeof r)["posts"][number]["title"]>().toEqualTypeOf<string>();
}
