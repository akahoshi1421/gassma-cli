import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

const row = { email: "a@example.com", score: 0 };
const rows = [row];

// 書き込み系: 余分なキーは有効なキーと混ぜても拒否される
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.create({ data: row, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.createManyAndReturn({ data: rows, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.update({ where: { id: 1 }, data: {}, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.upsert({ where: { id: 1 }, create: row, update: {}, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.delete({ where: { id: 1 }, typo: true });
}

// 非ジェネリックな書き込み系も余分なキーを拒否する（回帰ガード）
{
  // @ts-expect-error 余分キー typo は指定不可
  client.User.createMany({ data: rows, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.updateMany({ where: { id: 1 }, data: {}, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.deleteMany({ where: { id: 1 }, typo: true });
  // @ts-expect-error 余分キー typo は指定不可
  client.User.updateManyAndReturn({ data: {}, typo: true });
}

// 正当な呼び出しの結果型は変わらない
{
  const r = client.User.create({ data: row, select: { id: true } });
  expectTypeOf<typeof r>().branded.toEqualTypeOf<{ id: number }>();
}
{
  const r = client.User.delete({ where: { id: 1 }, select: { email: true } });
  expectTypeOf<typeof r>().branded.toEqualTypeOf<{ email: string } | null>();
}
{
  const r = client.User.upsert({
    where: { id: 1 },
    create: row,
    update: { name: "x" },
  });
  expectTypeOf<(typeof r)["email"]>().toEqualTypeOf<string>();
  expectTypeOf<typeof r>().not.toBeNullable();
}
