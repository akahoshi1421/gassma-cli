import { expectTypeOf } from "vitest";
import type {
  GassmaCategoryCreateData,
  GassmaCategoryUpdateSingleData,
  GassmaCategoryUpsertSingleData,
  GassmaClient,
  GassmaPostCreateData,
  GassmaPostUpdateSingleData,
  GassmaPostUpsertSingleData,
  GassmaProfileCreateData,
  GassmaProfileUpdateSingleData,
  GassmaProfileUpsertSingleData,
  GassmaUserCreateData,
  GassmaUserUpdateSingleData,
  GassmaUserUpsertSingleData,
} from "../__generated__/client";

declare const client: GassmaClient;

const u = client.User.upsert({
  where: { id: 1 },
  create: { email: "x@example.com", score: 0 },
  update: { name: "y" },
  include: { posts: true },
});
expectTypeOf<(typeof u)["posts"]>().toBeArray();
expectTypeOf<(typeof u)["posts"][number]["title"]>().toEqualTypeOf<string>();

// upsert.update は update 文脈の nested write を受け付ける
// （本体 upsertFunc の update 分岐は resolveNestedUpdate を通る）
{
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: { posts: { disconnect: [{ id: 1 }] } },
  });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: {
      posts: {
        // @ts-expect-error oneToMany の disconnect: true は本体が throw する
        disconnect: true,
      },
    },
  });
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: {
      posts: {
        // @ts-expect-error oneToMany の delete: true は本体が無視する
        delete: true,
      },
    },
  });
}

// upsert.create は create 文脈の nested write を受け付ける
// （本体 upsertFunc の create 分岐は resolveNestedCreate を通る）
{
  client.Post.upsert({
    where: { id: 1 },
    create: { title: "t", author: { connect: { id: 1 } } },
    update: { title: "u" },
  });
  client.Post.upsert({
    where: { id: 1 },
    create: { title: "t", authorId: 1 },
    update: {},
  });
  client.User.upsert({
    where: { id: 1 },
    create: {
      email: "x@example.com",
      score: 0,
      posts: { createMany: { data: [{ title: "t" }] } },
    },
    update: {},
  });
  client.Post.upsert({
    where: { id: 1 },
    // @ts-expect-error create に author も authorId も無いとエラー
    create: { title: "t" },
    update: {},
  });
  client.User.upsert({
    where: { id: 1 },
    create: {
      email: "x@example.com",
      score: 0,
      posts: {
        // @ts-expect-error upsert.create は create 文脈のみ（deleteMany は update 専用）
        deleteMany: { published: false },
      },
    },
    update: {},
  });
}

// upsert.update の oneToMany は createMany を受け付ける
// （本体 resolveNestedUpdate は processAfterCreate を呼ぶ）
{
  client.User.upsert({
    where: { id: 1 },
    create: { email: "x@example.com", score: 0 },
    update: { posts: { createMany: { data: [{ title: "t" }] } } },
  });
}

// upsert.create ≡ create の data、upsert.update ≡ update の data（文脈恒等）
// （本体 upsertFunc は create 分岐 / update 分岐で本体処理をそのまま通す）
{
  expectTypeOf<GassmaUserUpsertSingleData["create"]>().toEqualTypeOf<
    GassmaUserCreateData["data"]
  >();
  expectTypeOf<GassmaUserUpsertSingleData["update"]>().toEqualTypeOf<
    GassmaUserUpdateSingleData["data"]
  >();
  expectTypeOf<GassmaPostUpsertSingleData["create"]>().toEqualTypeOf<
    GassmaPostCreateData["data"]
  >();
  expectTypeOf<GassmaPostUpsertSingleData["update"]>().toEqualTypeOf<
    GassmaPostUpdateSingleData["data"]
  >();
  expectTypeOf<GassmaProfileUpsertSingleData["create"]>().toEqualTypeOf<
    GassmaProfileCreateData["data"]
  >();
  expectTypeOf<GassmaProfileUpsertSingleData["update"]>().toEqualTypeOf<
    GassmaProfileUpdateSingleData["data"]
  >();
  expectTypeOf<GassmaCategoryUpsertSingleData["create"]>().toEqualTypeOf<
    GassmaCategoryCreateData["data"]
  >();
  expectTypeOf<GassmaCategoryUpsertSingleData["update"]>().toEqualTypeOf<
    GassmaCategoryUpdateSingleData["data"]
  >();
}
