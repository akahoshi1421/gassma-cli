import { expectTypeOf } from "vitest";
import { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;
declare const clientOmit: GassmaClient<{
  User: { email: true };
  Post: { content: true };
}>;

// @ts-expect-error モデルに存在しないフィールドのみの globalOmit 設定は拒否される
declare const badOmitClient: GassmaClient<{ User: { nonexistent: true } }>;

// @ts-expect-error 既知フィールドと混在していても未知フィールドは拒否される
declare const mixedBadOmitClient: GassmaClient<{
  User: { email: true; typo: true };
}>;

// @ts-expect-error 未知モデル名は既知モデルと混在していても拒否される
declare const unknownModelOmitClient: GassmaClient<{
  User: { email: true };
  Nope: { id: true };
}>;

// 既知フィールドのみの設定は通る（true / false / 混在・複数モデル・空）
declare const okOmitTrue: GassmaClient<{ User: { email: true } }>;
declare const okOmitFalse: GassmaClient<{ User: { email: false } }>;
declare const okOmitMixed: GassmaClient<{
  User: { email: true; name: false };
}>;
declare const okOmitMultiModel: GassmaClient<{
  User: { email: true };
  Post: { content: true };
}>;
declare const okOmitEmptyModel: GassmaClient<{ User: {} }>;
declare const okOmitEmpty: GassmaClient<{}>;

// コンストラクタの型推論経路でも同様に判定される
{
  const okCtor = new GassmaClient({ omit: { User: { email: true } } });
  okCtor;
  const ngCtor = new GassmaClient({
    // @ts-expect-error コンストラクタの omit でも未知フィールドは拒否される
    omit: { User: { email: true, typo: true } },
  });
  ngCtor;
}

// 複数モデル同時指定: 各モデルへ独立に適用される
{
  const u = clientOmit.User.findFirst({ where: { id: 1 } });
  type U = NonNullable<typeof u>;
  expectTypeOf<U>().not.toHaveProperty("email");
  expectTypeOf<U["name"]>().toEqualTypeOf<string | null>();

  const p = clientOmit.Post.findFirst({ where: { id: 1 } });
  type P = NonNullable<typeof p>;
  expectTypeOf<P>().not.toHaveProperty("content");
  expectTypeOf<P["title"]>().toEqualTypeOf<string>();
}

// 指定していないモデルには影響しない
{
  const t = clientOmit.Tag.findFirst({ where: { id: 1 } });
  expectTypeOf<NonNullable<typeof t>["name"]>().toEqualTypeOf<string>();
}

// 入力側（where / data）には影響しない: 除外フィールドも条件・更新値に使える
{
  clientOmit.User.findFirst({ where: { email: "a@example.com" } });
  clientOmit.User.update({
    where: { id: 1 },
    data: { email: "b@example.com" },
  });
}

// create の戻り値に効く
{
  const r = clientOmit.User.create({
    data: { email: "a@example.com", score: 0 },
  });
  expectTypeOf<typeof r>().not.toHaveProperty("email");
  expectTypeOf<(typeof r)["name"]>().toEqualTypeOf<string | null>();
}

// update の戻り値に効く
{
  const r = clientOmit.User.update({ where: { id: 1 }, data: { name: "x" } });
  expectTypeOf<NonNullable<typeof r>>().not.toHaveProperty("email");
}

// upsert の戻り値に効く
{
  const r = clientOmit.User.upsert({
    where: { id: 1 },
    create: { email: "a@example.com", score: 0 },
    update: { name: "x" },
  });
  expectTypeOf<typeof r>().not.toHaveProperty("email");
}

// delete の戻り値に効く
{
  const r = clientOmit.User.delete({ where: { id: 1 } });
  expectTypeOf<NonNullable<typeof r>>().not.toHaveProperty("email");
}

// createManyAndReturn の戻り値に効く
{
  const r = clientOmit.User.createManyAndReturn({
    data: [{ email: "a@example.com", score: 0 }],
  });
  expectTypeOf<(typeof r)[number]>().not.toHaveProperty("email");
  expectTypeOf<(typeof r)[number]["id"]>().toEqualTypeOf<number>();
}

// updateManyAndReturn の戻り値に効く（複数モデルとも）
{
  const r = clientOmit.User.updateManyAndReturn({ data: { isActive: false } });
  expectTypeOf<typeof r>().toBeArray();
  expectTypeOf<(typeof r)[number]>().not.toHaveProperty("email");
  expectTypeOf<(typeof r)[number]["isActive"]>().toEqualTypeOf<boolean>();

  const p = clientOmit.Post.updateManyAndReturn({ data: { published: true } });
  expectTypeOf<(typeof p)[number]>().not.toHaveProperty("content");
  expectTypeOf<(typeof p)[number]["title"]>().toEqualTypeOf<string>();
}

// updateManyAndReturn: 除外フィールドへのアクセスはエラー
{
  const r = clientOmit.User.updateManyAndReturn({ data: { isActive: false } });
  // @ts-expect-error email はグローバル omit で除外される
  r[0].email;
}

// globalOmit なしの client では updateManyAndReturn は全フィールドを返す
{
  const r = client.User.updateManyAndReturn({ data: { isActive: false } });
  expectTypeOf<(typeof r)[number]["email"]>().toEqualTypeOf<string>();
}

// createMany / updateMany / deleteMany（{ count } 戻り）には影響しない
{
  const cm = clientOmit.User.createMany({
    data: [{ email: "a@example.com", score: 0 }],
  });
  expectTypeOf<typeof cm>().toEqualTypeOf<{ count: number }>();

  const um = clientOmit.User.updateMany({ data: { isActive: false } });
  expectTypeOf<typeof um>().toEqualTypeOf<{ count: number }>();

  const dm = clientOmit.User.deleteMany({ where: {} });
  expectTypeOf<typeof dm>().toEqualTypeOf<{ count: number }>();
}

// select 指定時はグローバル omit を無視（write 系）
{
  const d = clientOmit.User.delete({
    where: { id: 1 },
    select: { email: true },
  });
  expectTypeOf<NonNullable<typeof d>["email"]>().toEqualTypeOf<string>();

  const cs = clientOmit.User.createManyAndReturn({
    data: [{ email: "a@example.com", score: 0 }],
    select: { email: true },
  });
  expectTypeOf<(typeof cs)[number]["email"]>().toEqualTypeOf<string>();
}

// クエリ omit: false で解除・true で追加除外（write 系）
{
  const r = clientOmit.User.update({
    where: { id: 1 },
    data: { name: "x" },
    omit: { email: false, name: true },
  });
  type R = NonNullable<typeof r>;
  expectTypeOf<R["email"]>().toEqualTypeOf<string>();
  expectTypeOf<R>().not.toHaveProperty("name");
}

// クエリ omit: true でグローバル omit に追加除外（read 系・複数モデル）
{
  const p = clientOmit.Post.findMany({ where: {}, omit: { title: true } });
  type P = (typeof p)[number];
  expectTypeOf<P>().not.toHaveProperty("content");
  expectTypeOf<P>().not.toHaveProperty("title");
  expectTypeOf<P["id"]>().toEqualTypeOf<number>();
}

// include 先レコードにも関連モデル自身の globalOmit が効く
// （ランタイムは include 先を関連モデルの findMany で取得するため、
//   関連モデルの globalOmit がそのまま適用される）
{
  const u = clientOmit.User.findFirst({
    where: { id: 1 },
    include: { posts: true },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U>().not.toHaveProperty("email");
  expectTypeOf<U["posts"]>().toBeArray();
  type P = U["posts"][number];
  expectTypeOf<P>().not.toHaveProperty("content");
  expectTypeOf<P["title"]>().toEqualTypeOf<string>();
  expectTypeOf<P["id"]>().toEqualTypeOf<number>();
}

// 複数モデル globalOmit + include: 各 include 先へ独立に効く
{
  const p = clientOmit.Post.findFirst({
    where: { id: 1 },
    include: { author: true, tags: true },
  });
  type P = NonNullable<typeof p>;
  expectTypeOf<P>().not.toHaveProperty("content");
  type A = NonNullable<P["author"]>;
  expectTypeOf<A>().not.toHaveProperty("email");
  expectTypeOf<A["name"]>().toEqualTypeOf<string | null>();
  expectTypeOf<P["tags"][number]["name"]>().toEqualTypeOf<string>();
}

// globalOmit 未設定モデルの include 先には影響しない
{
  const u = client.User.findFirst({
    where: { id: 1 },
    include: { posts: true },
  });
  type P = NonNullable<typeof u>["posts"][number];
  expectTypeOf<P["content"]>().toEqualTypeOf<string | number | null>();
}

// ネスト include: 2段先のモデルにも各モデルの globalOmit が効く
declare const clientOmitNested: GassmaClient<{
  Post: { published: true };
  Tag: { name: true };
}>;
{
  const u = clientOmitNested.User.findFirst({
    where: { id: 1 },
    include: { posts: { include: { tags: true } } },
  });
  type U = NonNullable<typeof u>;
  expectTypeOf<U["email"]>().toEqualTypeOf<string>();
  type P = U["posts"][number];
  expectTypeOf<P>().not.toHaveProperty("published");
  expectTypeOf<P["content"]>().toEqualTypeOf<string | number | null>();
  type T = P["tags"][number];
  expectTypeOf<T>().not.toHaveProperty("name");
  expectTypeOf<T["id"]>().toEqualTypeOf<number>();
}

// include-level omit は include 先の globalOmit へ追加でマージされる
{
  const u = clientOmit.User.findFirst({
    where: { id: 1 },
    include: { posts: { omit: { title: true } } },
  });
  type P = NonNullable<typeof u>["posts"][number];
  expectTypeOf<P>().not.toHaveProperty("content");
  expectTypeOf<P>().not.toHaveProperty("title");
  expectTypeOf<P["id"]>().toEqualTypeOf<number>();
}

// aggregate / groupBy / count には効かない（本体は集計結果に omit を適用しない）
{
  const a = clientOmit.User.aggregate({ _min: { email: true } });
  expectTypeOf<(typeof a)["_min"]["email"]>().toEqualTypeOf<string | null>();

  const g = clientOmit.User.groupBy({ by: ["email"] });
  expectTypeOf<(typeof g)[number]["email"]>().toEqualTypeOf<string>();

  const c = clientOmit.User.count({});
  expectTypeOf<typeof c>().toEqualTypeOf<number>();
}
