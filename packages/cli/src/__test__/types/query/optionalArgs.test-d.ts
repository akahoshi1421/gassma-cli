import { expectTypeOf } from "vitest";
import { GassmaClient } from "../__generated__/client";
import type { GassmaClient as GassmaStrictClient } from "../__generated__/clientStrict";

declare const client: GassmaClient;
declare const strictClient: GassmaStrictClient;

// findMany / findFirst / findFirstOrThrow / count / deleteMany は引数なしで呼べ、
// 戻り値は {} を渡した場合と同一
{
  expectTypeOf(client.User.findMany()).toEqualTypeOf(client.User.findMany({}));
  expectTypeOf(client.User.findFirst()).toEqualTypeOf(
    client.User.findFirst({}),
  );
  expectTypeOf(client.User.findFirstOrThrow()).toEqualTypeOf(
    client.User.findFirstOrThrow({}),
  );
  expectTypeOf(client.User.count()).toEqualTypeOf(client.User.count({}));
  expectTypeOf(client.User.deleteMany()).toEqualTypeOf(
    client.User.deleteMany({}),
  );
  expectTypeOf(client.User.count()).toEqualTypeOf<number>();
  expectTypeOf(client.User.deleteMany().count).toEqualTypeOf<number>();
}

// 引数なし findMany の行は全フィールドを持つ(結果型が退化しない)
{
  const rows = client.User.findMany();
  expectTypeOf(rows[0].id).toEqualTypeOf<number>();
  expectTypeOf(rows[0].email).toEqualTypeOf<string>();
  const found = client.User.findFirstOrThrow();
  expectTypeOf(found.age).toEqualTypeOf<number | null>();
}

// globalOmit は引数なし呼び出しにも効く
{
  const omitClient = new GassmaClient({ omit: { User: { email: true } } });
  const rows = omitClient.User.findMany();
  expectTypeOf(rows).toEqualTypeOf(omitClient.User.findMany({}));
  expectTypeOf(rows[0]).not.toHaveProperty("email");
  expectTypeOf(rows[0].id).toEqualTypeOf<number>();
}

// $extends の result 拡張後(CMap が非空)でも引数なしで呼べ、算出フィールドも付く
{
  const extended = client.$extends({
    result: {
      User: {
        fullName: {
          needs: { email: true },
          compute: (user) => `x${user.email}`,
        },
      },
    },
  });
  const rows = extended.User.findMany();
  expectTypeOf(rows).toEqualTypeOf(extended.User.findMany({}));
  expectTypeOf(rows[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(extended.User.findFirst()).toEqualTypeOf(
    extended.User.findFirst({}),
  );
  expectTypeOf(extended.User.count()).toEqualTypeOf<number>();
  expectTypeOf(extended.User.deleteMany().count).toEqualTypeOf<number>();
}

// $transaction のトランザクションクライアントでも引数なしで呼べる
{
  client.$transaction((tx) => {
    expectTypeOf(tx.User.findMany()).toEqualTypeOf(tx.User.findMany({}));
    expectTypeOf(tx.User.findFirst()).toEqualTypeOf(tx.User.findFirst({}));
    return tx.User.count();
  });
}

// strictUndefinedChecks 有効時のクライアントでも5操作は引数なしで呼べる
{
  expectTypeOf(strictClient.User.findMany()).toEqualTypeOf(
    strictClient.User.findMany({}),
  );
  expectTypeOf(strictClient.User.findFirst()).toEqualTypeOf(
    strictClient.User.findFirst({}),
  );
  expectTypeOf(strictClient.User.findFirstOrThrow()).toEqualTypeOf(
    strictClient.User.findFirstOrThrow({}),
  );
  expectTypeOf(strictClient.User.count()).toEqualTypeOf<number>();
  expectTypeOf(strictClient.User.deleteMany().count).toEqualTypeOf<number>();
}

// 上記5操作以外は引数なしでは呼べない
{
  // @ts-expect-error create は data 必須
  client.User.create();
  // @ts-expect-error createMany は data 必須
  client.User.createMany();
  // @ts-expect-error createManyAndReturn は data 必須
  client.User.createManyAndReturn();
  // @ts-expect-error update は data 必須
  client.User.update();
  // @ts-expect-error updateMany は data 必須
  client.User.updateMany();
  // @ts-expect-error updateManyAndReturn は data 必須
  client.User.updateManyAndReturn();
  // @ts-expect-error upsert は where / create / update 必須
  client.User.upsert();
  // @ts-expect-error delete は where 必須
  client.User.delete();
  // @ts-expect-error aggregate は引数必須
  client.User.aggregate();
  // @ts-expect-error groupBy は by 必須
  client.User.groupBy();
}
