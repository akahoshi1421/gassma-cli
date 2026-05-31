import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

const us = client.User.createManyAndReturn({
  data: [{ email: "x@example.com", score: 0 }],
  include: { posts: true },
});
expectTypeOf<(typeof us)[number]["posts"]>().toBeArray();
expectTypeOf<
  (typeof us)[number]["posts"][number]["title"]
>().toEqualTypeOf<string>();
