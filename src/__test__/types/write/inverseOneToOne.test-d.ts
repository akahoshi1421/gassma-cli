import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// inverse oneToOne(User.profile) の create 文脈: create / connect / connectOrCreate を受理する
// （本体 processBeforeCreate は子を FK 注入なしで作成し relation.field="id" へ書き戻すため、
//   profile.create は userId を含む Profile の必須をすべて要求する）
{
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      profile: { create: { bio: "b", userId: 1 } },
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
          create: { bio: "b", userId: 1 },
        },
      },
    },
  });
  client.User.create({
    data: {
      email: "a@example.com",
      score: 0,
      // @ts-expect-error profile.create は userId 必須（FK 自動補完されない）
      profile: { create: { bio: "b" } },
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

// inverse oneToOne(User.profile) の update 文脈: to-one op（delete / disconnect は true のみ）
// （本体 processBeforeUpdate は relation.field="id" を対象に処理する）
{
  client.User.update({
    where: { id: 1 },
    data: { profile: { create: { bio: "b", userId: 1 } } },
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
          create: { bio: "b", userId: 1 },
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
