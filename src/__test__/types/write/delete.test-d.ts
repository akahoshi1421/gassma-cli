import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

const u = client.User.delete({
  where: { id: 1 },
  include: { posts: true },
});
type U = NonNullable<typeof u>;
expectTypeOf<U["posts"]>().toBeArray();
expectTypeOf<U["posts"][number]["title"]>().toEqualTypeOf<string>();
