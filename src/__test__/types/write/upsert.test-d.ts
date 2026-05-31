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
