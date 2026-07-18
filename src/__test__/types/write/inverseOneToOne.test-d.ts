import { expectTypeOf } from "vitest";
import type {
  GassmaClient,
  GassmaProfileUse,
  GassmaUserCreateData,
  GassmaUserUpdateSingleData,
} from "../__generated__/client";

declare const client: GassmaClient;

// inverse oneToOne(User.profile) の create 文脈: create / connect / connectOrCreate を受理する
// （本体が子の FK(reference=userId) を自動注入するため、profile.create は userId を省略できる）
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      profile: { create: { bio: "b" } },
    },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      profile: { connect: { userId: 1 } },
    },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      profile: {
        connectOrCreate: {
          where: { userId: 1 },
          create: { bio: "b" },
        },
      },
    },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      profile: {
        // @ts-expect-error delete は update 文脈専用
        delete: true,
      },
    },
  });
}

// profile.create / connectOrCreate.create の入力型は userId を Omit 済み（本体が自動注入する）
{
  type CreateOps = NonNullable<GassmaUserCreateData["data"]["profile"]>;
  expectTypeOf<NonNullable<CreateOps["create"]>>().toEqualTypeOf<
    Omit<GassmaProfileUse, "userId">
  >();
  expectTypeOf<
    NonNullable<CreateOps["connectOrCreate"]>["create"]
  >().toEqualTypeOf<Omit<GassmaProfileUse, "userId">>();

  type UpdateOps = NonNullable<GassmaUserUpdateSingleData["data"]["profile"]>;
  expectTypeOf<NonNullable<UpdateOps["create"]>>().toEqualTypeOf<
    Omit<GassmaProfileUse, "userId">
  >();
  expectTypeOf<
    NonNullable<UpdateOps["connectOrCreate"]>["create"]
  >().toEqualTypeOf<Omit<GassmaProfileUse, "userId">>();

  expectTypeOf<NonNullable<UpdateOps["update"]>>().toEqualTypeOf<
    Partial<GassmaProfileUse>
  >();
}

// inverse oneToOne(User.profile) の update 文脈: to-one op（delete / disconnect は true のみ）
// （本体 processBeforeUpdate は relation.field="id" を対象に処理し、create は FK を自動注入する）
{
  client.User.update({
    where: { id: 1 },
    data: { profile: { create: { bio: "b" } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { profile: { connect: { userId: 1 } } },
  });
  client.User.update({
    where: { id: 1 },
    data: {
      profile: {
        connectOrCreate: {
          where: { userId: 1 },
          create: { bio: "b" },
        },
      },
    },
  });
  client.User.update({
    where: { id: 1 },
    data: { profile: { update: { bio: "b2" } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { profile: { update: { userId: 2 } } },
  });
  client.User.update({
    where: { id: 1 },
    data: { profile: { delete: true } },
  });
  client.User.update({
    where: { id: 1 },
    data: { profile: { disconnect: true } },
  });
  client.User.update({
    where: { id: 1 },
    // @ts-expect-error delete は true のみ（where 指定不可）
    data: { profile: { delete: { userId: 1 } } },
  });
  client.User.update({
    where: { id: 1 },
    // @ts-expect-error disconnect は true のみ（where 指定不可）
    data: { profile: { disconnect: { userId: 1 } } },
  });
}
