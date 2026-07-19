import { Gassma, GassmaClient } from "../__generated__/clientStrict";
import { Gassma as PlainGassma } from "../__generated__/client";

declare const client: GassmaClient;

// Gassma.skip の型が SkipValue になる
{
  const value: Gassma.SkipValue = Gassma.skip;
  void value;
}

// 非 strict の生成物には skip が存在しない
{
  // @ts-expect-error 非 strict では skip は生成されない
  PlainGassma.skip;
}

// where: フィールド値・where 自体に skip を渡せる
{
  client.User.findMany({ where: { id: Gassma.skip } });
  client.User.findMany({ where: Gassma.skip });
  client.User.findMany({ where: { AND: Gassma.skip, OR: Gassma.skip } });
}

// where: FilterConditions の各キーに skip を渡せる
{
  client.User.findMany({
    where: { id: { equals: Gassma.skip, in: Gassma.skip, mode: Gassma.skip } },
  });
}

// where: 配列要素には skip を渡せない
{
  // @ts-expect-error in の配列要素に skip は不可
  client.User.findMany({ where: { id: { in: [Gassma.skip] } } });
}

// where: relation filter に skip を渡せる
{
  client.User.findMany({ where: { posts: Gassma.skip } });
  client.User.findMany({ where: { posts: { some: Gassma.skip } } });
}

// トップレベルのオプショナル引数に skip を渡せる
{
  client.User.findMany({
    orderBy: Gassma.skip,
    take: Gassma.skip,
    skip: Gassma.skip,
    cursor: Gassma.skip,
    distinct: Gassma.skip,
    include: Gassma.skip,
  });
  client.User.findMany({ select: Gassma.skip });
  client.User.findMany({ omit: Gassma.skip });
}

// orderBy / select / omit / include の値に skip を渡せる
{
  client.User.findMany({ orderBy: { id: Gassma.skip } });
  client.User.findMany({ select: { id: Gassma.skip } });
  client.User.findMany({ omit: { id: Gassma.skip } });
  client.User.findMany({ include: { posts: Gassma.skip } });
}

// create: オプショナルなフィールド値に skip を渡せる
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 1,
      id: Gassma.skip,
      name: Gassma.skip,
      isActive: Gassma.skip,
    },
  });
}

// create: 必須フィールドに skip は不可
{
  // @ts-expect-error email は必須なので skip 不可
  client.User.create({ data: { email: Gassma.skip, score: 1 } });
}

// create: data 自体に skip は不可
{
  // @ts-expect-error data は必須引数なので skip 不可
  client.User.create({ data: Gassma.skip });
}

// create: 必須 FK に skip は不可
{
  client.Post.create({
    // @ts-expect-error authorId は必須 FK なので skip 不可
    data: { title: "t", authorId: Gassma.skip },
  });
}

// nested write: 各操作値に skip を渡せる
{
  client.User.create({
    data: { email: "a@example.com", score: 1, posts: Gassma.skip },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      score: 1,
      posts: { create: Gassma.skip, connect: Gassma.skip },
    },
  });
}

// nested write: create 配列の要素に skip は不可
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 1,
      // @ts-expect-error 配列要素に skip は不可
      posts: { create: [Gassma.skip] },
    },
  });
}

// update: data の値に skip を渡せるが where 自体には不可
{
  client.User.update({ where: { id: 1 }, data: { name: Gassma.skip } });
  // @ts-expect-error update の where は必須引数なので skip 不可
  client.User.update({ where: Gassma.skip, data: {} });
}

// updateMany: where / limit / data 値に skip を渡せる
{
  client.User.updateMany({
    where: Gassma.skip,
    data: { name: Gassma.skip },
    limit: Gassma.skip,
  });
}

// upsert: create / update の値に skip を渡せる
{
  client.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 1, name: Gassma.skip },
    update: { name: Gassma.skip },
  });
}

// delete / deleteMany
{
  client.User.deleteMany({ where: Gassma.skip, limit: Gassma.skip });
  // @ts-expect-error delete の where は必須引数なので skip 不可
  client.User.delete({ where: Gassma.skip });
}

// aggregate / count / groupBy
{
  client.User.aggregate({ where: Gassma.skip, _avg: Gassma.skip });
  client.User.count({ where: Gassma.skip, take: Gassma.skip });
  client.User.groupBy({ by: "id", having: Gassma.skip });
  client.User.groupBy({ by: "id", having: { score: Gassma.skip } });
  // @ts-expect-error by は必須引数なので skip 不可
  client.User.groupBy({ by: Gassma.skip });
}
