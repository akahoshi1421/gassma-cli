import { expectTypeOf } from "vitest";
import type { GassmaClient } from "./__generated__/client";

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

// Post.author（manyToOne）→ User（null なし）
{
  const p = client.Post.findFirst({
    where: { id: 1 },
    include: { author: true },
  });
  type P = NonNullable<typeof p>;
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
