import { expectTypeOf } from "vitest";
import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// create: 単一・null なし。全スカラーを持つ
{
  const r = client.User.create({
    data: { email: "a@example.com", score: 0 },
  });
  expectTypeOf<typeof r>().not.toBeNullable();
  expectTypeOf<(typeof r)["email"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof r)["isActive"]>().toEqualTypeOf<boolean>();
}

// upsert: 単一・null なし
{
  const r = client.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 0 },
    update: { name: "x" },
  });
  expectTypeOf<typeof r>().not.toBeNullable();
  expectTypeOf<(typeof r)["email"]>().toEqualTypeOf<string>();
}

// update: 単一 | null
{
  const r = client.User.update({ where: { id: 1 }, data: { name: "x" } });
  expectTypeOf<typeof r>().toBeNullable();
  expectTypeOf<NonNullable<typeof r>["email"]>().toEqualTypeOf<string>();
}

// delete: 単一 | null
{
  const r = client.User.delete({ where: { id: 1 } });
  expectTypeOf<typeof r>().toBeNullable();
  expectTypeOf<NonNullable<typeof r>["email"]>().toEqualTypeOf<string>();
}

// createMany / updateMany / deleteMany: { count: number }
{
  const cm = client.User.createMany({
    data: [{ email: "a@example.com", score: 0 }],
  });
  expectTypeOf<typeof cm>().toEqualTypeOf<{ count: number }>();

  const um = client.User.updateMany({ data: { isActive: false } });
  expectTypeOf<typeof um>().toEqualTypeOf<{ count: number }>();

  const dm = client.User.deleteMany({ where: {} });
  expectTypeOf<typeof dm>().toEqualTypeOf<{ count: number }>();
}

// createManyAndReturn: 配列。select / omit / include が効く
{
  const r = client.User.createManyAndReturn({
    data: [{ email: "a@example.com", score: 0 }],
  });
  expectTypeOf<typeof r>().toBeArray();
  expectTypeOf<(typeof r)[number]["email"]>().toEqualTypeOf<string>();

  // select が効く
  const s = client.User.createManyAndReturn({
    data: [{ email: "a@example.com", score: 0 }],
    select: { id: true },
  });
  expectTypeOf<(typeof s)[number]["id"]>().toEqualTypeOf<number>();
  expectTypeOf<(typeof s)[number]>().not.toHaveProperty("email");
}

// updateManyAndReturn: DefaultFindResult 配列（全フィールド）
{
  const r = client.User.updateManyAndReturn({ data: { isActive: false } });
  expectTypeOf<typeof r>().toBeArray();
  expectTypeOf<(typeof r)[number]["email"]>().toEqualTypeOf<string>();
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();
}

// select / omit は create / update / upsert / delete の戻り値にも効く
{
  const c = client.User.create({
    data: { email: "a@example.com", score: 0 },
    select: { id: true },
  });
  expectTypeOf<(typeof c)["id"]>().toEqualTypeOf<number>();
  expectTypeOf<typeof c>().not.toHaveProperty("email");

  const u = client.User.update({
    where: { id: 1 },
    data: { name: "x" },
    omit: { email: true },
  });
  expectTypeOf<NonNullable<typeof u>>().not.toHaveProperty("email");
}
