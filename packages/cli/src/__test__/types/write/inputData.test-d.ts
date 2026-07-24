import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// create: 必須（@default なし）だけ渡せば作れる。@default / nullable は省略可
{
  client.User.create({ data: { email: "a@example.com", score: 0 } });

  // @ts-expect-error email（必須）が無いと型エラー
  client.User.create({ data: { score: 0 } });
}

// update の data: 全フィールドが部分更新可（Partial）
{
  // 1フィールドだけの更新が通る
  client.User.update({ where: { id: 1 }, data: { name: "x" } });
  // 空 data も型上は許容（Partial）
  client.User.update({ where: { id: 1 }, data: {} });
}

// update の数値フィールドは NumberOperation を受け付ける
{
  client.Post.update({
    where: { id: 1 },
    data: { authorId: { increment: 1 } },
  });
  client.Post.update({
    where: { id: 1 },
    data: { authorId: { decrement: 2 } },
  });
  // 直接値も渡せる
  client.Post.update({ where: { id: 1 }, data: { authorId: 5 } });
}

// updateMany は where 省略可、limit を受け付ける
{
  client.User.updateMany({ data: { isActive: false } });
  client.User.updateMany({
    where: { id: 1 },
    data: { isActive: false },
    limit: 3,
  });
}

// upsert は where / create / update をすべて要求する
{
  client.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 0 },
    update: { name: "x" },
  });

  // @ts-expect-error create が無い
  client.User.upsert({ where: { id: 1 }, update: { name: "x" } });
}

// delete / deleteMany の where
{
  client.User.delete({ where: { id: 1 } });
  client.User.deleteMany({ where: { id: 1 } });
  // deleteMany は where 省略可（全件）
  client.User.deleteMany({});
}

// createMany の data は配列
{
  client.User.createMany({
    data: [
      { email: "a@example.com", score: 0 },
      { email: "b@example.com", score: 1 },
    ],
  });
}

// nested write(create): oneToMany の子は自動セットされる FK(authorId)を省略できる
// （本体 processAfterCreate が [reference]: parentValue で上書きするため）
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      posts: { create: [{ title: "t" }] },
    },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      posts: { create: { title: "t" } },
    },
  });
}

// nested write(create): FK 保持側は FK 直接指定か relation op のどちらかで満たす
// （本体 processBeforeCreate が connect/create/connectOrCreate で FK をセットするため）
{
  client.Post.create({
    data: { title: "t", author: { connect: { id: 1 } } },
  });
  client.Post.create({
    data: { title: "t", author: { create: { email: "a@e.com", score: 0 } } },
  });
  client.Post.create({
    data: {
      title: "t",
      author: {
        connectOrCreate: {
          where: { id: 1 },
          create: { email: "a@e.com", score: 0 },
        },
      },
    },
  });
  client.Post.create({ data: { title: "t", authorId: 1 } });

  // @ts-expect-error author も authorId も無いとエラー
  client.Post.create({ data: { title: "t" } });

  client.Profile.create({ data: { bio: "b", user: { connect: { id: 1 } } } });
}

// FK が optional のモデルは FK も relation op も省略できる
{
  client.Category.create({ data: { name: "c" } });
  client.Category.create({
    data: { name: "c", parent: { connect: { id: 1 } } },
  });
}

// nested write(create): oneToMany は createMany を受け付ける（子は FK 省略）
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      posts: { createMany: { data: [{ title: "t" }] } },
    },
  });
}

// nested write(create): manyToMany は create / connectOrCreate を受け付ける
// （本体 processManyToMany が junction 行を作成する）
{
  client.Post.create({
    data: {
      title: "t",
      author: { connect: { id: 1 } },
      tags: { create: [{ name: "t" }] },
    },
  });
  client.Post.create({
    data: {
      title: "t",
      authorId: 1,
      tags: {
        connectOrCreate: { where: { id: 1 }, create: { name: "t" } },
      },
    },
  });
}
