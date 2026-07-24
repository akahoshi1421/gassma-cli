import { expectTypeOf } from "vitest";
import type {
  CreateManyReturn,
  GassmaClient,
  GassmaModelName,
  GassmaOperationName,
  GassmaUserFindManyData,
  GassmaUserQueryHooks,
} from "../__generated__/client";

declare const client: GassmaClient;
declare function runQuery<A>(args: A): never;
declare const userHooks: Required<GassmaUserQueryHooks>;
declare const omitClient: GassmaClient<{ User: { email: true } }>;
declare function acceptUserFindManyData(args: GassmaUserFindManyData): void;

// 基本: モデル別フックが通り、model / operation / args が厳密に型づく
{
  const extended = client.$extends({
    query: {
      User: {
        findMany({ model, operation, args, query }) {
          expectTypeOf(model).toEqualTypeOf<"User">();
          expectTypeOf(operation).toEqualTypeOf<"findMany">();
          acceptUserFindManyData(args);
          return query(args);
        },
      },
    },
  });
  const rows = extended.User.findMany({ where: { id: 1 } });
  expectTypeOf(rows[0].id).toEqualTypeOf<number>();
}

// 全 15 操作 + $allOperations のフックを同時に書ける
{
  client.$extends({
    query: {
      User: {
        findFirst: ({ args, query }) => query(args),
        findFirstOrThrow: ({ args, query }) => query(args),
        findMany: ({ args, query }) => query(args),
        create: ({ args, query }) => query(args),
        createMany: ({ args, query }) => query(args),
        createManyAndReturn: ({ args, query }) => query(args),
        update: ({ args, query }) => query(args),
        updateMany: ({ args, query }) => query(args),
        updateManyAndReturn: ({ args, query }) => query(args),
        upsert: ({ args, query }) => query(args),
        delete: ({ args, query }) => query(args),
        deleteMany: ({ args, query }) => query(args),
        count: ({ args, query }) => query(args),
        aggregate: ({ args, query }) => query(args),
        groupBy: ({ args, query }) => query(args),
        $allOperations: ({ model, operation, args, query }) => {
          expectTypeOf(model).toEqualTypeOf<"User">();
          expectTypeOf(operation).toEqualTypeOf<GassmaOperationName>();
          return query(args);
        },
      },
    },
  });
}

// query(args) の結果型は controller のメソッドと同じ型に相関する
{
  const viaController = client.User.findMany({ select: { id: true } });
  const result = userHooks.findMany({
    model: "User",
    operation: "findMany",
    args: { select: { id: true } },
    query: runQuery,
  });
  expectTypeOf(result).toEqualTypeOf<typeof viaController>();
}
{
  const viaController = client.User.aggregate({ _avg: { age: true } });
  const result = userHooks.aggregate({
    model: "User",
    operation: "aggregate",
    args: { _avg: { age: true } },
    query: runQuery,
  });
  expectTypeOf(result).toEqualTypeOf<typeof viaController>();
}
{
  const result = userHooks.count({
    model: "User",
    operation: "count",
    args: { where: { isActive: true } },
    query: runQuery,
  });
  expectTypeOf(result).toEqualTypeOf<number>();
}
{
  const result = userHooks.createMany({
    model: "User",
    operation: "createMany",
    args: { data: [{ email: "a@example.com", score: 1 }] },
    query: runQuery,
  });
  expectTypeOf(result).toEqualTypeOf<CreateManyReturn>();
}

// args を加工して query に渡せる（スプレッド + 上書き）
{
  client.$extends({
    query: {
      User: {
        findMany({ args, query }) {
          return query({ ...args, take: 1 });
        },
      },
    },
  });
}

// $allModels: model はモデル名の union、operation は各操作リテラル
{
  const extended = client.$extends({
    query: {
      $allModels: {
        findMany({ model, operation, args, query }) {
          expectTypeOf(model).toEqualTypeOf<GassmaModelName>();
          expectTypeOf(operation).toEqualTypeOf<"findMany">();
          return query(args);
        },
        $allOperations({ model, operation, args, query }) {
          expectTypeOf(model).toEqualTypeOf<GassmaModelName>();
          expectTypeOf(operation).toEqualTypeOf<GassmaOperationName>();
          return query(args);
        },
      },
    },
  });
  const posts = extended.Post.findMany({ where: { published: true } });
  expectTypeOf(posts[0].title).toEqualTypeOf<string>();
}

// $extends の戻り値でチェーンできる
{
  const extended = client
    .$extends({
      query: {
        User: { findMany: ({ args, query }) => query(args) },
      },
    })
    .$extends({
      query: {
        Post: { findFirst: ({ args, query }) => query(args) },
      },
    });
  const post = extended.Post.findFirst({ where: { id: 1 } });
  expectTypeOf(post).not.toEqualTypeOf<null>();
}

// globalOmit は $extends 後も維持される
{
  const extended = omitClient.$extends({});
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0]).not.toHaveProperty("email");
  expectTypeOf(rows[0]).toHaveProperty("id");
}

// 存在しない操作名は拒否される
{
  client.$extends({
    query: {
      User: {
        // @ts-expect-error findAll という操作は存在しない
        findAll: () => [],
      },
    },
  });
}

// 存在しないモデル名は拒否される
{
  client.$extends({
    query: {
      // @ts-expect-error Nope というモデルは存在しない
      Nope: {},
    },
  });
}

// 戻り値の型を変える加工は許可されない
{
  client.$extends({
    query: {
      User: {
        // @ts-expect-error findMany フックは FindResult の配列以外を返せない
        findMany() {
          return "wrong";
        },
      },
    },
  });
}

// query には args と無関係な値を渡せない
{
  client.$extends({
    query: {
      User: {
        findMany({ query }) {
          // @ts-expect-error args 由来でないオブジェクトは query に渡せない
          return query({ where: { unknownColumn: 1 } });
        },
      },
    },
  });
}
