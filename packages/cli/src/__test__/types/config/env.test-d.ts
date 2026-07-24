import { expectTypeOf } from "vitest";
import { env } from "../../../config/env";

type Env = {
  DATABASE_URL: string;
  OPTIONAL_URL?: string;
  PORT: number;
};

expectTypeOf(env("ANY_NAME")).toEqualTypeOf<string>();

expectTypeOf(env<Env>("DATABASE_URL")).toEqualTypeOf<string>();

expectTypeOf(env<Env>("OPTIONAL_URL")).toEqualTypeOf<string>();

// @ts-expect-error Env に無いキーは受け付けない
env<Env>("NOT_A_KEY");

// @ts-expect-error 値が string | undefined でないキーは受け付けない
env<Env>("PORT");
