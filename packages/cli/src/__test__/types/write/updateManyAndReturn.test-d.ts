import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// select: 指定したキーだけが要素型に出る
{
  const r = client.User.updateManyAndReturn({
    where: { isActive: true },
    data: { name: "a" },
    select: { id: true, name: true },
  });
  type E = (typeof r)[number];
  expectTypeOf<E["id"]>().toEqualTypeOf<number>();
  expectTypeOf<E>().toHaveProperty("name");
  expectTypeOf<E>().not.toHaveProperty("email");
}

// omit: 指定したキーが要素型から消える
{
  const r = client.User.updateManyAndReturn({
    data: { name: "a" },
    omit: { email: true },
  });
  type E = (typeof r)[number];
  expectTypeOf<E>().not.toHaveProperty("email");
  expectTypeOf<E["id"]>().toEqualTypeOf<number>();
}

// include: リレーションが要素型に付く（FK 非保有側も従来どおり指定可能）
{
  const r = client.User.updateManyAndReturn({
    data: { name: "a" },
    include: { posts: true },
  });
  type E = (typeof r)[number];
  expectTypeOf<E["posts"]>().toBeArray();
  expectTypeOf<E["posts"][number]["title"]>().toEqualTypeOf<string>();
  expectTypeOf<E["email"]>().toEqualTypeOf<string>();
}

// select / omit なしは従来どおり全スカラー
{
  const r = client.User.updateManyAndReturn({ data: { name: "a" } });
  type E = (typeof r)[number];
  expectTypeOf<E["email"]>().toEqualTypeOf<string>();
  expectTypeOf<E["id"]>().toEqualTypeOf<number>();
}

// where / limit と select の併用
{
  const r = client.User.updateManyAndReturn({
    where: { id: 1 },
    data: { name: "a" },
    limit: 2,
    select: { id: true },
  });
  expectTypeOf<(typeof r)[number]["id"]>().toEqualTypeOf<number>();
}

// select と omit の併用は拒否
{
  // @ts-expect-error select と omit は併用不可
  client.User.updateManyAndReturn({
    data: { name: "a" },
    select: { id: true },
    omit: { email: true },
  });
}

// data は必須のまま
{
  // @ts-expect-error data は必須
  client.User.updateManyAndReturn({ where: { id: 1 } });
}

// 余分キーは拒否（回帰ガード）
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.updateManyAndReturn({ data: { name: "a" }, typo: true });
}
