import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// count: 引数なし / where のみは number のまま
{
  expectTypeOf(client.User.count()).toEqualTypeOf<number>();
  expectTypeOf(
    client.User.count({ where: { isActive: true } }),
  ).toEqualTypeOf<number>();
}

// count: select: { _all: true } は { _all: number }（number ではない）
{
  const r = client.User.count({ select: { _all: true } });
  expectTypeOf(r).toEqualTypeOf<{ _all: number }>();
}

// count: 列と _all の混在は両方のキーを持つ
{
  const r = client.User.count({ select: { name: true, _all: true } });
  expectTypeOf(r).toEqualTypeOf<{ name: number; _all: number }>();
}

// count: 列のみの select はその列のキーだけ
{
  const r = client.User.count({ select: { name: true } });
  expectTypeOf(r).toEqualTypeOf<{ name: number }>();
}

// count: select: true は number（Prisma 準拠の省略形）
{
  expectTypeOf(client.User.count({ select: true })).toEqualTypeOf<number>();
}

// count: where と select の併用でも select が優先される
{
  const r = client.User.count({
    where: { isActive: true },
    select: { _all: true },
  });
  expectTypeOf(r).toEqualTypeOf<{ _all: number }>();
}

// count: select の値は true のみ（Prisma 準拠。false は実行時エラーになるため型で拒否）
{
  // @ts-expect-error select の値に false は指定不可
  client.User.count({ select: { name: false } });
}

// count: 未知の列は指定不可
{
  // @ts-expect-error 未知キーは指定不可
  client.User.count({ select: { typo: true } });
}
