import { expectTypeOf } from "vitest";
import type {
  GassmaClient,
  GassmaPostFindManyData,
} from "../__generated__/client";

declare const client: GassmaClient;
declare const prebuiltArgs: GassmaPostFindManyData;

// トップレベルで select と include を同時に指定できない（本体の
// GassmaIncludeSelectConflictError に相当する制約を型で表す）
{
  // @ts-expect-error select と include は同時に指定できない
  client.Post.findMany({ select: { id: true }, include: { author: true } });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.findFirst({ select: { id: true }, include: { author: true } });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.findFirstOrThrow({
    select: { id: true },
    include: { author: true },
  });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.create({
    data: { title: "t", authorId: 1 },
    select: { id: true },
    include: { author: true },
  });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.createManyAndReturn({
    data: [{ title: "t", authorId: 1 }],
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
  client.Post.updateManyAndReturn({
    data: { title: "t" },
    select: { id: true },
    include: { author: true },
  });
  // @ts-expect-error select と include は同時に指定できない
  client.Post.upsert({
    where: { id: 1 },
    create: { title: "t", authorId: 1 },
    update: { title: "t" },
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

// 片方だけなら通る
{
  client.Post.findMany({ select: { id: true } });
  client.Post.findMany({ include: { author: true } });
  client.Post.findMany({ omit: { title: true } });
  client.Post.findMany({
    where: { published: true },
    include: { author: true },
    take: 10,
  });
  client.Post.create({ data: { title: "t", authorId: 1 } });
  client.Post.create({
    data: { title: "t", authorId: 1 },
    include: { author: true },
  });
  client.Post.update({
    where: { id: 1 },
    data: { title: "t" },
    select: { id: true },
  });
  client.Post.upsert({
    where: { id: 1 },
    create: { title: "t", authorId: 1 },
    update: { title: "t" },
    include: { author: true },
  });
  client.Post.delete({ where: { id: 1 }, include: { author: true } });
  client.Post.createManyAndReturn({
    data: [{ title: "t", authorId: 1 }],
    select: { id: true },
  });
  client.Post.updateManyAndReturn({
    data: { title: "t" },
    omit: { title: true },
  });
}

// 事前に組み立てた引数（select / include が任意キーのまま）は拒否されない
{
  client.Post.findMany(prebuiltArgs);
}

// select + omit の同時指定は従来どおり拒否される
{
  // @ts-expect-error select と omit は同時に指定できない
  client.Post.findMany({ select: { id: true }, omit: { title: true } });
}

// ネストした select + include は Prisma と同じく型では弾かない
// （本体の IncludeSelectIncludeConflictError が実行時に弾く）
{
  client.User.findMany({
    include: { posts: { select: { id: true }, include: { author: true } } },
  });
  client.User.findMany({
    select: { posts: { select: { id: true }, include: { author: true } } },
  });
}

// 結果型の解決は変わらない
{
  const withInclude = client.Post.findMany({ include: { author: true } });
  type P = (typeof withInclude)[number];
  expectTypeOf<P["title"]>().toEqualTypeOf<string>();
  expectTypeOf<P["author"]["email"]>().toEqualTypeOf<string>();

  const withSelect = client.Post.findMany({ select: { id: true } });
  expectTypeOf<typeof withSelect>().branded.toEqualTypeOf<{ id: number }[]>();

  const nested = client.User.findFirstOrThrow({
    include: { posts: { select: { title: true } } },
  });
  expectTypeOf<(typeof nested)["posts"][number]>().branded.toEqualTypeOf<{
    title: string;
  }>();

  const created = client.Post.create({
    data: { title: "t", authorId: 1 },
    include: { author: true },
  });
  expectTypeOf<(typeof created)["author"]["email"]>().toEqualTypeOf<string>();

  const updated = client.Post.update({
    where: { id: 1 },
    data: { title: "t" },
    select: { id: true },
  });
  expectTypeOf<NonNullable<typeof updated>>().branded.toEqualTypeOf<{
    id: number;
  }>();

  const upserted = client.Post.upsert({
    where: { id: 1 },
    create: { title: "t", authorId: 1 },
    update: { title: "t" },
    include: { author: true },
  });
  expectTypeOf<(typeof upserted)["author"]["email"]>().toEqualTypeOf<string>();

  const deleted = client.Post.delete({
    where: { id: 1 },
    include: { author: true },
  });
  expectTypeOf<
    NonNullable<typeof deleted>["author"]["email"]
  >().toEqualTypeOf<string>();

  const returned = client.Post.createManyAndReturn({
    data: [{ title: "t", authorId: 1 }],
    include: { author: true },
  });
  expectTypeOf<
    (typeof returned)[number]["author"]["email"]
  >().toEqualTypeOf<string>();

  const manyUpdated = client.Post.updateManyAndReturn({
    data: { title: "t" },
    select: { id: true },
  });
  expectTypeOf<typeof manyUpdated>().branded.toEqualTypeOf<{ id: number }[]>();
}
