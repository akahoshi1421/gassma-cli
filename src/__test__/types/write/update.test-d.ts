import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

const u = client.User.update({
  where: { id: 1 },
  data: { name: "y" },
  include: { posts: true },
});
type U = NonNullable<typeof u>;
expectTypeOf<U["posts"]>().toBeArray();
expectTypeOf<U["posts"][number]["title"]>().toEqualTypeOf<string>();

// manyToOne の nested write: update / delete / disconnect / connect
// （本体 processBeforeUpdate は manyToOne を oneToOne と同一処理する）
{
  client.Post.update({
    where: { id: 1 },
    data: { author: { disconnect: true } },
  });
  client.Post.update({
    where: { id: 1 },
    data: { author: { delete: true } },
  });
  client.Post.update({
    where: { id: 1 },
    data: { author: { update: { name: "Alice Updated" } } },
  });
  client.Post.update({
    where: { id: 1 },
    data: { author: { connect: { id: 2 } } },
  });
}

// oneToMany の update 文脈: delete / disconnect は where 指定のみ
// （本体 processAfterUpdate は disconnect === true を throw、delete === true を無視する）
{
  client.User.update({
    where: { id: 1 },
    data: { posts: { disconnect: { id: 1 } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { posts: { disconnect: [{ id: 1 }, { id: 2 }] } },
  });
  client.User.update({
    where: { id: 1 },
    data: { posts: { delete: { id: 1 } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { posts: { deleteMany: { published: false } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { posts: { set: [{ id: 1 }] } },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      posts: { update: { where: { id: 1 }, data: { title: "t2" } } },
    },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      posts: {
        // @ts-expect-error oneToMany の disconnect: true は本体が throw する
        disconnect: true,
      },
    },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      posts: {
        // @ts-expect-error oneToMany の delete: true は本体が無視する
        delete: true,
      },
    },
  });
}

// manyToMany の update 文脈: disconnect は where 指定のみ、set は where 配列
// （本体 processManyToManyUpdate は disconnect === true を無視する）
{
  client.Post.update({
    where: { id: 1 },
    data: { tags: { disconnect: { name: "x" }, set: [{ id: 1 }] } },
  });
  client.Post.update({
    where: { id: 1 },
    data: {
      tags: {
        // @ts-expect-error manyToMany の disconnect: true は本体が無視する
        disconnect: true,
      },
    },
  });
}

// updateMany / updateManyAndReturn は nested write 非対応
// （本体 updateManyFunc は scalar / NumberOperation のみ処理する）
{
  client.User.updateMany({
    data: {
      // @ts-expect-error updateMany の data は nested write を受け付けない
      posts: { create: { title: "t" } },
    },
  });
  client.Post.updateMany({
    data: {
      // @ts-expect-error updateMany の data は nested write を受け付けない
      author: { connect: { id: 1 } },
    },
  });
  client.User.updateManyAndReturn({
    data: {
      // @ts-expect-error updateManyAndReturn の data も nested write を受け付けない
      posts: { deleteMany: { published: false } },
    },
  });
}
