import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

const u = client.User.upsert({
  where: { id: 1 },
  create: { email: "x@example.com", score: 0 },
  update: { name: "y" },
  include: { posts: true },
});
expectTypeOf<(typeof u)["posts"]>().toBeArray();
expectTypeOf<(typeof u)["posts"][number]["title"]>().toEqualTypeOf<string>();

// upsert.update は update 文脈の nested write を受け付ける
// （本体 upsertFunc の update 分岐は resolveNestedUpdate を通る）
{
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: { posts: { disconnect: [{ id: 1 }] } },
  });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: {
      posts: {
        // @ts-expect-error oneToMany の disconnect: true は本体が throw する
        disconnect: true,
      },
    },
  });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: {
      posts: {
        // @ts-expect-error oneToMany の delete: true は本体が無視する
        delete: true,
      },
    },
  });
}
