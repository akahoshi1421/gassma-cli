import { expectTypeOf } from "vitest";
import type { GassmaClient } from "./__generated__/client";

declare const client: GassmaClient;
declare const clientOmit: GassmaClient<{ User: { email: true } }>;

// omit なし: 全フィールドにアクセス可能
{
  const r = client.User.findFirst({ where: { id: 1 } });
  type R = NonNullable<typeof r>;
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();
  expectTypeOf<R["name"]>().toEqualTypeOf<string | null>();
}

// グローバルomit: email が結果型から除外される
{
  const r = clientOmit.User.findFirst({ where: { id: 1 } });
  type R = NonNullable<typeof r>;
  expectTypeOf<R>().not.toHaveProperty("email");
  expectTypeOf<R["name"]>().toEqualTypeOf<string | null>();
}

// omit: { email: false } でグローバルomitを解除
{
  const r = clientOmit.User.findFirst({
    where: { id: 1 },
    omit: { email: false },
  });
  type R = NonNullable<typeof r>;
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();
}

// select はグローバルomitを上書きする
{
  const r = clientOmit.User.findFirst({
    where: { id: 1 },
    select: { email: true },
  });
  type R = NonNullable<typeof r>;
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();
}

// クエリomit: name が結果型から除外される
{
  const r = client.User.findFirst({ where: { id: 1 }, omit: { name: true } });
  type R = NonNullable<typeof r>;
  expectTypeOf<R>().not.toHaveProperty("name");
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();
}

// findMany でもグローバルomitが反映される
{
  const rs = clientOmit.User.findMany({ where: {} });
  expectTypeOf<(typeof rs)[number]>().not.toHaveProperty("email");
}
