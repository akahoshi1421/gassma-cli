import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;
declare const clientOmit: GassmaClient<{ Post: { published: true } }>;

// manyToMany: Post.tags を直接 include → 配列
{
  const p = client.Post.findFirst({
    where: { id: 1 },
    include: { tags: true },
  });
  type P = NonNullable<typeof p>;
  expectTypeOf<P["tags"]>().toBeArray();
  expectTypeOf<P["tags"][number]["name"]>().toEqualTypeOf<string>();
}

// manyToMany 逆側: Tag.posts → 配列
{
  const t = client.Tag.findFirst({
    where: { id: 1 },
    include: { posts: true },
  });
  type T = NonNullable<typeof t>;
  expectTypeOf<T["posts"]>().toBeArray();
  expectTypeOf<T["posts"][number]["title"]>().toEqualTypeOf<string>();
}

// oneToOne 逆側(FK 保有側): Profile.user → User | null
{
  const pr = client.Profile.findFirst({
    where: { id: 1 },
    include: { user: true },
  });
  type Pr = NonNullable<typeof pr>;
  expectTypeOf<Pr["user"]>().toBeNullable();
  expectTypeOf<NonNullable<Pr["user"]>["email"]>().toEqualTypeOf<string>();
}

// 3段以上の深いネスト include: User -> posts -> tags -> posts
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: {
      posts: {
        include: {
          tags: { include: { posts: { select: { title: true } } } },
        },
      },
    },
  });
  type U = NonNullable<typeof u>;
  type DeepPost = U["posts"][number]["tags"][number]["posts"][number];
  expectTypeOf<DeepPost["title"]>().toEqualTypeOf<string>();
  expectTypeOf<DeepPost>().not.toHaveProperty("id");
}

// 4段ネスト(自己参照): Category children -> children -> parent -> children
{
  const c = client.Category.findFirst({
    where: { id: 1 },
    include: {
      children: {
        include: {
          children: { include: { parent: { include: { children: true } } } },
        },
      },
    },
  });
  type C = NonNullable<typeof c>;
  type Deep = NonNullable<
    C["children"][number]["children"][number]["parent"]
  >["children"];
  expectTypeOf<Deep>().toBeArray();
  expectTypeOf<Deep[number]["name"]>().toEqualTypeOf<string>();
}

// omit と include の併用: スカラーだけ落ちてリレーションは残る
{
  const p = client.Post.findFirst({
    where: { id: 1 },
    omit: { published: true },
    include: { author: true, tags: true },
  });
  type P = NonNullable<typeof p>;
  expectTypeOf<P>().not.toHaveProperty("published");
  expectTypeOf<P["author"]>().toBeNullable();
  expectTypeOf<P["tags"]>().toBeArray();
  expectTypeOf<P["title"]>().toEqualTypeOf<string>();
}

// グローバルomit と include の併用
{
  const p = clientOmit.Post.findFirst({
    where: { id: 1 },
    include: { author: true },
  });
  type P = NonNullable<typeof p>;
  expectTypeOf<P>().not.toHaveProperty("published");
  expectTypeOf<P["author"]>().toBeNullable();
}

// select と include の役割分担: select 内リレーション + _count
{
  const u = client.User.findFirst({
    where: { id: 1 },
    select: {
      id: true,
      posts: { select: { title: true } },
      profile: true,
      _count: { select: { posts: true } },
    },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["posts"]>().toBeArray();
  expectTypeOf<U["profile"]>().toBeNullable();
  expectTypeOf<U["_count"]["posts"]>().toEqualTypeOf<number>();
  expectTypeOf<U>().not.toHaveProperty("email");
}

// リレーションを持たないモデル: 結果はスカラーのみで include キーが存在しない
{
  const m = client.Member.findFirstOrThrow({ where: { id: 1 } });
  type M = typeof m;
  expectTypeOf<M["id"]>().toEqualTypeOf<number>();
  expectTypeOf<M>().not.toHaveProperty("_count");
}

// リレーションを持たないモデルの select
{
  const m = client.Member.findFirstOrThrow({
    where: { id: 1 },
    select: { id: true, role: true },
  });
  type M = typeof m;
  expectTypeOf<M["id"]>().toEqualTypeOf<number>();
  expectTypeOf<M>().not.toHaveProperty("firstName");
}
