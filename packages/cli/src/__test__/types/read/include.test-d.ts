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

// Post.author（manyToOne・FK 必須）→ User（Prisma と同じく null を含まない）
{
  const p = client.Post.findFirst({
    where: { id: 1 },
    include: { author: true },
  });
  type P = NonNullable<typeof p>;
  expectTypeOf<P["author"]>().not.toBeNullable();
  expectTypeOf<P["author"]["email"]>().toEqualTypeOf<string>();
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

// include 内の深いネスト select: posts -> tags
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: {
      posts: { select: { tags: { select: { name: true } } } },
    },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["id"]>().toEqualTypeOf<number>();
  type P = U["posts"][number];
  expectTypeOf<P>().not.toHaveProperty("title");
  expectTypeOf<P["tags"][number]["name"]>().toEqualTypeOf<string>();
  expectTypeOf<P["tags"][number]>().not.toHaveProperty("id");
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

// include の relation オプション orderBy: 単一・配列の両方を受け付ける
{
  client.User.findFirst({
    where: { id: 1 },
    include: { posts: { orderBy: { title: "asc" } } },
  });
  client.User.findFirst({
    where: { id: 1 },
    include: { posts: { orderBy: [{ published: "desc" }, { title: "asc" }] } },
  });
}

// to-one の null 許容はリレーションフィールドの `?` に従う（include）
{
  const p = client.Post.findFirstOrThrow({ include: { author: true } });
  // Post.author は必須なのでガードなしでアクセスできる
  expectTypeOf<(typeof p)["author"]["email"]>().toEqualTypeOf<string>();

  const c = client.Category.findFirstOrThrow({ include: { parent: true } });
  // Category.parent は `Category?` なので null 許容のまま
  expectTypeOf<(typeof c)["parent"]>().toBeNullable();

  const u = client.User.findFirstOrThrow({ include: { profile: true } });
  // FK を持たない側は相手が存在する保証がないので常に null 許容
  expectTypeOf<(typeof u)["profile"]>().toBeNullable();
}

// to-one の null 許容はリレーションフィールドの `?` に従う（select）
{
  const p = client.Post.findFirstOrThrow({ select: { author: true } });
  expectTypeOf<(typeof p)["author"]["email"]>().toEqualTypeOf<string>();

  const c = client.Category.findFirstOrThrow({ select: { parent: true } });
  expectTypeOf<(typeof c)["parent"]>().toBeNullable();

  const u = client.User.findFirstOrThrow({ select: { profile: true } });
  expectTypeOf<(typeof u)["profile"]>().toBeNullable();
}

// ネストした include の奥でも必須 to-one は null にならない
{
  const u = client.User.findFirstOrThrow({
    include: { posts: { include: { author: true } } },
  });
  expectTypeOf<
    (typeof u)["posts"][number]["author"]["email"]
  >().toEqualTypeOf<string>();
}

// 複合FKの両方が必須: Enrollment.student / Enrollment.course
{
  const e = client.Enrollment.findFirstOrThrow({
    include: { student: true, course: true },
  });
  expectTypeOf<(typeof e)["student"]["name"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof e)["course"]["title"]>().toEqualTypeOf<string>();
}
