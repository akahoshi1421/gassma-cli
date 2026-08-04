import { expectTypeOf } from "vitest";
import { GassmaClient } from "../__generated__/client";

// strictNullChecks の有無に依存しない書き方だけを使う。
// `| null` は非 strict では潰れるため NonNullable<> 経由で中身を検証する。
const client = new GassmaClient();

// 引数に select / include / omit を渡さない場合に全スカラーが解決される
{
  const u = client.User.findFirst({ where: { id: 1 } });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["id"]>().toEqualTypeOf<number>();
  expectTypeOf<U["email"]>().toEqualTypeOf<string>();
  expectTypeOf<U["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<U["createdAt"]>().toEqualTypeOf<Date>();

  const us = client.User.findMany({ where: {} });
  expectTypeOf<(typeof us)[number]["id"]>().toEqualTypeOf<number>();
}

// select
{
  const u = client.User.findFirstOrThrow({ select: { id: true, email: true } });
  expectTypeOf<(typeof u)["id"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof u)["email"]>().toEqualTypeOf<string>();
  expectTypeOf(u).not.toHaveProperty("isActive");
}

// omit
{
  const u = client.User.findFirstOrThrow({ omit: { email: true } });
  expectTypeOf<(typeof u)["id"]>().toEqualTypeOf<number>();
  expectTypeOf(u).not.toHaveProperty("email");
}

// include（リレーションが never にならない）
{
  const u = client.User.findFirstOrThrow({ include: { posts: true } });
  expectTypeOf<(typeof u)["posts"][number]["title"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof u)["id"]>().toEqualTypeOf<number>();

  const p = client.Post.findFirstOrThrow({ include: { author: true } });
  expectTypeOf<
    NonNullable<(typeof p)["author"]>["email"]
  >().toEqualTypeOf<string>();
}

// ネストした include
{
  const u = client.User.findFirstOrThrow({
    include: { posts: { include: { tags: true } } },
  });
  type Post = (typeof u)["posts"][number];
  expectTypeOf<Post["title"]>().toEqualTypeOf<string>();
  expectTypeOf<Post["tags"][number]["name"]>().toEqualTypeOf<string>();
}

// include 内の select
{
  const u = client.User.findFirstOrThrow({
    include: { posts: { select: { title: true } } },
  });
  type Post = (typeof u)["posts"][number];
  expectTypeOf<Post["title"]>().toEqualTypeOf<string>();
  expectTypeOf<Post>().not.toHaveProperty("id");
}

// _count
{
  const u = client.User.findFirstOrThrow({
    include: { _count: { select: { posts: true } } },
  });
  expectTypeOf<(typeof u)["_count"]["posts"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof u)["id"]>().toEqualTypeOf<number>();
}

// 自己参照リレーション
{
  const c = client.Category.findFirstOrThrow({
    include: { children: { include: { children: true } } },
  });
  expectTypeOf<(typeof c)["name"]>().toEqualTypeOf<string>();
  type Child = (typeof c)["children"][number];
  expectTypeOf<Child["name"]>().toEqualTypeOf<string>();
  expectTypeOf<Child["children"][number]["name"]>().toEqualTypeOf<string>();

  const p = client.Category.findFirstOrThrow({ include: { parent: true } });
  expectTypeOf<
    NonNullable<(typeof p)["parent"]>["name"]
  >().toEqualTypeOf<string>();
}

// $extends result: 算出フィールドだけを select した場合はスカラーが付かない
{
  const extended = client.$extends({
    result: {
      User: {
        fullName: {
          needs: { email: true },
          compute: (user) => `x${user.email}`,
        },
      },
    },
  });

  const onlyComputed = extended.User.findMany({ select: { fullName: true } });
  expectTypeOf<
    (typeof onlyComputed)[number]["fullName"]
  >().toEqualTypeOf<string>();
  expectTypeOf(onlyComputed[0]).not.toHaveProperty("id");

  // 引数省略時は算出フィールドとスカラーの両方が付く
  const all = extended.User.findMany({ where: {} });
  expectTypeOf<(typeof all)[number]["fullName"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof all)[number]["id"]>().toEqualTypeOf<number>();
}
