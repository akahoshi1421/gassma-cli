import type { GassmaClient } from "../__generated__/client";
import {
  Gassma as GassmaStrict,
  type GassmaClient as GassmaClientStrict,
} from "../__generated__/clientStrict";

declare const client: GassmaClient;
declare const strictClient: GassmaClientStrict;

// 数値カラムは NumberOperation を受け付ける（update / updateMany / upsert.update）
{
  client.User.update({ where: { id: 1 }, data: { age: { increment: 1 } } });
  client.User.update({ where: { id: 1 }, data: { age: { decrement: 1 } } });
  client.User.update({ where: { id: 1 }, data: { age: { multiply: 2 } } });
  client.User.update({ where: { id: 1 }, data: { age: { divide: 2 } } });
  // 直接値も渡せる
  client.User.update({ where: { id: 1 }, data: { age: 30 } });
  client.User.updateMany({ data: { score: { increment: 1 } } });
  client.User.updateManyAndReturn({ data: { score: { increment: 1 } } });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 0 },
    update: { score: { increment: 1 } },
  });
}

// addType で number を含む複合型カラムも NumberOperation を受け付ける（_avg / _sum と同一基準）
{
  client.User.update({ where: { id: 1 }, data: { rating: { increment: 1 } } });
  client.Post.update({ where: { id: 1 }, data: { content: { increment: 1 } } });
}

// 非数値カラム（string / boolean / Date）は NumberOperation を受け付けない
{
  client.User.update({
    where: { id: 1 },
    // @ts-expect-error string カラムに increment は不可
    data: { name: { increment: 1 } },
  });
  client.User.update({
    where: { id: 1 },
    // @ts-expect-error boolean カラムに increment は不可
    data: { isActive: { increment: 1 } },
  });
  client.User.update({
    where: { id: 1 },
    // @ts-expect-error Date カラムに increment は不可
    data: { createdAt: { increment: 1 } },
  });
  client.User.updateMany({
    // @ts-expect-error string カラムに increment は不可
    data: { email: { increment: 1 } },
  });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 0 },
    // @ts-expect-error string カラムに increment は不可
    update: { name: { increment: 1 } },
  });
}

// nested update の data でも数値カラムは NumberOperation を受け付ける
// （本体は nested update を updateManyOnSheet 経由で通常の update パイプラインに流す）
{
  client.User.update({
    where: { id: 1 },
    data: {
      posts: {
        update: { where: { id: 1 }, data: { authorId: { increment: 1 } } },
      },
    },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      posts: {
        update: [
          { where: { id: 1 }, data: { authorId: { increment: 1 } } },
          { where: { id: 2 }, data: { authorId: { decrement: 1 } } },
        ],
      },
    },
  });
  client.Post.update({
    where: { id: 1 },
    data: { author: { update: { score: { increment: 1 } } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { profile: { update: { userId: { increment: 1 } } } },
  });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 0 },
    update: {
      posts: {
        update: { where: { id: 1 }, data: { authorId: { increment: 1 } } },
      },
    },
  });
}

// nested update の data でも非数値カラムは NumberOperation を受け付けない
{
  client.User.update({
    where: { id: 1 },
    data: {
      posts: {
        // @ts-expect-error nested update でも string カラムに increment は不可
        update: { where: { id: 1 }, data: { title: { increment: 1 } } },
      },
    },
  });
  client.Post.update({
    where: { id: 1 },
    data: {
      author: {
        // @ts-expect-error nested update でも string カラムに increment は不可
        update: { email: { increment: 1 } },
      },
    },
  });
}

// strict クライアントでも数値カラム限定は同じ（SkipValue と共存できる）
{
  strictClient.User.update({
    where: { id: 1 },
    data: { age: { increment: 1 }, name: GassmaStrict.skip },
  });
  strictClient.User.update({
    where: { id: 1 },
    // @ts-expect-error strict でも string カラムに increment は不可
    data: { name: { increment: 1 } },
  });
}
