import { expectTypeOf } from "vitest";
import type {
  GassmaClient,
  GassmaUserAggregateData,
} from "../__generated__/client";

declare const client: GassmaClient;

// aggregate: 余分なキーは有効なキーと混ぜても拒否される（Prisma の Subset 準拠）
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.aggregate({ where: {}, typo: true });
  // @ts-expect-error 余分キー typo は単独でも指定不可
  client.User.aggregate({ typo: true });
  // @ts-expect-error _count 内の未知キーは指定不可
  client.User.aggregate({ _count: { typo: true } });
}

// groupBy: 余分なキーは有効なキーと混ぜても拒否される
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.groupBy({ by: ["id"], typo: true });
  // @ts-expect-error where と併用しても余分キーは指定不可
  client.User.groupBy({ by: ["id"], where: { id: 1 }, typo: true });
}

// count: 余分なキーは拒否される（回帰ガード）
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.count({ where: { id: 1 }, typo: true });
}

// aggregate: 正当な呼び出しの結果型は変わらない
{
  const r = client.User.aggregate({
    where: { id: 1 },
    _count: { id: true },
    _avg: { age: true },
  });
  expectTypeOf<typeof r>().branded.toEqualTypeOf<{
    _count: { id: number };
    _avg: { age: number | null };
  }>();
}

// aggregate: 変数渡し（非リテラル）も従来どおり通る
{
  const args: GassmaUserAggregateData = { _count: true };
  client.User.aggregate(args);
}

// groupBy: 正当な呼び出しの結果型は変わらない
{
  const r = client.User.groupBy({ by: ["isActive"], _count: { id: true } });
  expectTypeOf<keyof (typeof r)[number]>().toEqualTypeOf<
    "isActive" | "_count"
  >();
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
  expectTypeOf<(typeof r)[number]["_count"]["id"]>().toEqualTypeOf<number>();
}
