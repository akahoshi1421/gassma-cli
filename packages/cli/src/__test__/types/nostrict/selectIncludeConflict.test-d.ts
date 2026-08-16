import { expectTypeOf } from "vitest";
import { GassmaClient } from "../__generated__/client";

// strictNullChecks が off でも select と include の同時指定が弾かれる
const client = new GassmaClient();

{
  // @ts-expect-error select と include は同時に指定できない
  client.Post.findMany({ select: { id: true }, include: { author: true } });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.findFirst({ select: { id: true }, include: { author: true } });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.create({
    data: { title: "t", authorId: 1 },
    select: { id: true },
    include: { author: true },
  });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.update({
    where: { id: 1 },
    data: { title: "t" },
    select: { id: true },
    include: { author: true },
  });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.delete({
    where: { id: 1 },
    select: { id: true },
    include: { author: true },
  });
}

{
  client.Post.findMany({ select: { id: true } });
  client.Post.findMany({ include: { author: true } });
  client.Post.findMany({ omit: { title: true } });
  client.Post.findMany({
    where: { published: true },
    include: { author: true },
    take: 10,
  });
  client.Post.create({
    data: { title: "t", authorId: 1 },
    include: { author: true },
  });
  client.Post.update({
    where: { id: 1 },
    data: { title: "t" },
    select: { id: true },
  });
  // ネストの select + include は型では弾かない
  client.User.findMany({
    include: { posts: { select: { id: true }, include: { author: true } } },
  });
}

// 結果型の解決が非 strict でも壊れない
{
  const p = client.Post.findFirstOrThrow({ include: { author: true } });
  expectTypeOf<(typeof p)["title"]>().toEqualTypeOf<string>();
  expectTypeOf<
    NonNullable<(typeof p)["author"]>["email"]
  >().toEqualTypeOf<string>();

  const s = client.Post.findFirstOrThrow({ select: { id: true } });
  expectTypeOf<(typeof s)["id"]>().toEqualTypeOf<number>();
  expectTypeOf(s).not.toHaveProperty("title");
}
