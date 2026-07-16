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
