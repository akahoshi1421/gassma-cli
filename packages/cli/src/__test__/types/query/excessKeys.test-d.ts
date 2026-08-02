import { expectTypeOf } from "vitest";
import type {
  GassmaClient,
  GassmaUserFindManyData,
} from "../__generated__/client";

declare const client: GassmaClient;

// findMany / findFirst / findFirstOrThrow: 余分なキーは有効なキーと混ぜても拒否される
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.findMany({ where: { id: 1 }, typo: true });
  // @ts-expect-error 余分キー typo は単独でも指定不可
  client.User.findMany({ typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.findFirst({ where: { id: 1 }, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.findFirstOrThrow({ where: { id: 1 }, typo: true });
}

// findMany: 正当な呼び出しの結果型は変わらない（select の絞り込み）
{
  const r = client.User.findMany({
    where: { email: { contains: "a" } },
    select: { id: true, name: true },
    take: 1,
  });
  expectTypeOf<typeof r>().branded.toEqualTypeOf<
    { id: number; name: string | null }[]
  >();
}

// findMany: orderBy の文字列リテラルは従来どおり通る（widening 回帰ガード)
{
  client.User.findMany({ orderBy: { id: "asc" } });
  client.User.findMany({ orderBy: [{ id: "asc" }, { email: "desc" }] });
}

// findFirst: 結果は単一 | null のまま
{
  const r = client.User.findFirst({ where: { id: 1 } });
  expectTypeOf<NonNullable<typeof r>["email"]>().toEqualTypeOf<string>();
  expectTypeOf<typeof r>().toBeNullable();
}

// findMany: 変数渡し（非リテラル）も従来どおり通る
{
  const args: GassmaUserFindManyData = { where: { id: 1 } };
  client.User.findMany(args);
}
