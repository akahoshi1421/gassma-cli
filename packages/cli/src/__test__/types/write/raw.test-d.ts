import { expectTypeOf } from "vitest";
import { Gassma, type GassmaClient } from "../__generated__/client";
import {
  Gassma as GassmaStrict,
  type GassmaClient as GassmaClientStrict,
} from "../__generated__/clientStrict";

declare const client: GassmaClient;
declare const strictClient: GassmaClientStrict;

// Gassma.raw の戻り値が RawValue になる（非 strict / strict 両方に生成される）
{
  expectTypeOf(Gassma.raw("=SUM(A1:A2)")).toEqualTypeOf<Gassma.RawValue>();
  expectTypeOf(
    GassmaStrict.raw("=SUM(A1:A2)"),
  ).toEqualTypeOf<GassmaStrict.RawValue>();
}

// create: 全カラム型（string / number / boolean / Date / nullable）で raw を渡せる
{
  client.User.create({
    data: {
      email: Gassma.raw("=A1"),
      name: Gassma.raw("=CONCAT(A1, B1)"),
      age: Gassma.raw("=B1+1"),
      isActive: Gassma.raw("=A1>5"),
      score: Gassma.raw("=SUM(B2:B10)"),
      createdAt: Gassma.raw("=TODAY()"),
    },
  });
}

// create: enum カラム・replaceType のリテラル union カラムでも raw を渡せる
{
  client.Member.create({
    data: {
      firstName: Gassma.raw("=A1"),
      role: Gassma.raw("=A1"),
      status: Gassma.raw("=A1"),
      size: Gassma.raw("=A1"),
    },
  });
}

// create: FK スカラー（XOR の Pick 側）でも raw を渡せる
{
  client.Post.create({
    data: { title: "t", authorId: Gassma.raw("=A1") },
  });
}

// createMany / createManyAndReturn: 要素の全カラムで raw を渡せる
{
  client.User.createMany({
    data: [{ email: Gassma.raw("=A1"), score: Gassma.raw("=SUM(B2:B10)") }],
  });
  client.User.createManyAndReturn({
    data: [{ email: Gassma.raw("=A1"), score: Gassma.raw("=SUM(B2:B10)") }],
  });
}

// update / updateMany / updateManyAndReturn: data の全カラムで raw を渡せる
{
  client.User.update({
    where: { id: 1 },
    data: {
      email: Gassma.raw("=A1"),
      age: Gassma.raw("=B1+1"),
      isActive: Gassma.raw("=A1>5"),
      createdAt: Gassma.raw("=TODAY()"),
    },
  });
  client.User.updateMany({ data: { score: Gassma.raw("=SUM(B2:B10)") } });
  client.User.updateManyAndReturn({ data: { name: Gassma.raw("=A1") } });
}

// upsert: create / update の両方で raw を渡せる
{
  client.User.upsert({
    where: { id: 1 },
    create: { email: Gassma.raw("=A1"), score: Gassma.raw("=SUM(B2:B10)") },
    update: { email: Gassma.raw("=A1"), age: Gassma.raw("=B1+1") },
  });
}

// nested write: create / createMany / connectOrCreate.create / update の data で raw を渡せる
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      posts: {
        create: { title: Gassma.raw("=A1"), published: Gassma.raw("=B1>0") },
        createMany: { data: [{ title: Gassma.raw("=A1") }] },
      },
    },
  });
  client.Post.create({
    data: {
      title: "t",
      author: {
        connectOrCreate: {
          where: { id: 1 },
          create: { email: Gassma.raw("=A1"), score: 0 },
        },
      },
    },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      posts: {
        update: { where: { id: 1 }, data: { title: Gassma.raw("=A1") } },
      },
    },
  });
}

// strict: raw と skip を同じ data 内で併用できる
{
  strictClient.User.update({
    where: { id: 1 },
    data: { age: GassmaStrict.raw("=B1+1"), name: GassmaStrict.skip },
  });
  strictClient.User.create({
    data: { email: GassmaStrict.raw("=A1"), score: 0 },
  });
}

// where には raw を渡せない
{
  client.User.findMany({
    // @ts-expect-error where の直接値に raw は不可
    where: { name: Gassma.raw("=A1") },
  });
  client.User.findMany({
    // @ts-expect-error where の equals に raw は不可
    where: { name: { equals: Gassma.raw("=A1") } },
  });
  client.User.update({
    // @ts-expect-error update の where に raw は不可
    where: { id: Gassma.raw("=A1") },
    data: { name: "x" },
  });
}

// 結果型に RawValue は現れない
{
  const created = client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      createdAt: Gassma.raw("=TODAY()"),
    },
  });
  expectTypeOf<(typeof created)["email"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof created)["createdAt"]>().toEqualTypeOf<Date>();

  const found = client.User.findMany({});
  expectTypeOf<(typeof found)[number]["email"]>().toEqualTypeOf<string>();

  const updated = client.User.update({ where: { id: 1 }, data: {} });
  expectTypeOf<
    NonNullable<typeof updated>["createdAt"]
  >().toEqualTypeOf<Date>();
}

// 型安全は維持: 不正な値は依然エラー
{
  client.User.create({
    data: {
      email: "a@example.com",
      // @ts-expect-error 数値カラムに raw でない文字列は不可
      score: "=SUM(A1:A2)",
    },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      // @ts-expect-error ブランドのないオブジェクトは不可
      score: {},
    },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      // @ts-expect-error boolean カラムに数値は不可
      isActive: 1,
    },
  });
}
