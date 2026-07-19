import { expectTypeOf } from "vitest";
import { GassmaClient } from "../__generated__/client";

const client = new GassmaClient();
const omitClient = new GassmaClient({ omit: { User: { email: true } } });

// 基本: 算出フィールドがトップレベル結果に付き、既存フィールドも残る
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
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(rows[0].id).toEqualTypeOf<number>();
  expectTypeOf(rows[0].email).toEqualTypeOf<string>();
}

// compute 引数は needs で宣言したフィールドだけを持つ
{
  client.$extends({
    result: {
      User: {
        fullName: {
          needs: { email: true, age: true },
          compute: (user) => {
            expectTypeOf(user.email).toEqualTypeOf<string>();
            expectTypeOf(user.age).toEqualTypeOf<number | null>();
            // @ts-expect-error needs に無い name は参照できない
            return user.name;
          },
        },
      },
    },
  });
}

// needs にスカラー以外のキーは書けない
{
  client.$extends({
    result: {
      User: {
        bad: {
          // @ts-expect-error nope というスカラーは存在しない
          needs: { nope: true },
          compute: () => 1,
        },
      },
    },
  });
}

// 存在しないモデル名は拒否される
{
  client.$extends({
    result: {
      // @ts-expect-error Nope というモデルは存在しない
      Nope: {
        x: { compute: () => 1 },
      },
    },
  });
}

// $allModels は全モデルの結果に付く
{
  const extended = client.$extends({
    result: {
      $allModels: {
        tag: { compute: () => "t" },
      },
    },
  });
  expectTypeOf(extended.User.findMany({})[0].tag).toEqualTypeOf<string>();
  expectTypeOf(extended.Post.findMany({})[0].tag).toEqualTypeOf<string>();
}

// 同名はモデル固有が $allModels に勝つ
{
  const extended = client.$extends({
    result: {
      $allModels: {
        tag: { compute: () => "t" },
      },
      User: {
        tag: { compute: () => 123 },
      },
    },
  });
  expectTypeOf(extended.User.findMany({})[0].tag).toEqualTypeOf<number>();
  expectTypeOf(extended.Post.findMany({})[0].tag).toEqualTypeOf<string>();
}

// select: 選択した算出フィールドだけが結果に出る
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
  const withSel = extended.User.findMany({
    select: { id: true, fullName: true },
  });
  expectTypeOf(withSel[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(withSel[0].id).toEqualTypeOf<number>();
  expectTypeOf(withSel[0]).not.toHaveProperty("email");

  const noSel = extended.User.findMany({ select: { id: true } });
  expectTypeOf(noSel[0]).not.toHaveProperty("fullName");

  const onlyComputed = extended.User.findMany({ select: { fullName: true } });
  expectTypeOf(onlyComputed[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(onlyComputed[0]).not.toHaveProperty("id");
}

// omit: 算出フィールドも needs 対象の実カラムも除去できる
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
  const dropComputed = extended.User.findMany({ omit: { fullName: true } });
  expectTypeOf(dropComputed[0]).not.toHaveProperty("fullName");
  expectTypeOf(dropComputed[0].id).toEqualTypeOf<number>();

  const dropNeeded = extended.User.findMany({ omit: { email: true } });
  expectTypeOf(dropNeeded[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(dropNeeded[0]).not.toHaveProperty("email");
}

// 既存フィールドの上書き（select 経由でも算出型が勝つ）
{
  const extended = client.$extends({
    result: {
      User: {
        name: {
          needs: { id: true },
          compute: (user) => user.id,
        },
      },
    },
  });
  expectTypeOf(extended.User.findMany({})[0].name).toEqualTypeOf<number>();
  const selected = extended.User.findMany({
    select: { name: true, email: true },
  });
  expectTypeOf(selected[0].name).toEqualTypeOf<number>();
  expectTypeOf(selected[0].email).toEqualTypeOf<string>();
}

// レコードを返す全操作に算出フィールドが付く
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
  expectTypeOf(
    extended.User.create({ data: { email: "a@example.com", score: 1 } })
      .fullName,
  ).toEqualTypeOf<string>();
  expectTypeOf(
    extended.User.findFirstOrThrow({ where: { id: 1 } }).fullName,
  ).toEqualTypeOf<string>();
  const found = extended.User.findFirst({ where: { id: 1 } });
  if (found) expectTypeOf(found.fullName).toEqualTypeOf<string>();
  const updated = extended.User.update({
    where: { id: 1 },
    data: { name: "a" },
  });
  if (updated) expectTypeOf(updated.fullName).toEqualTypeOf<string>();
  expectTypeOf(
    extended.User.upsert({
      where: { id: 1 },
      update: {},
      create: { email: "a@example.com", score: 1 },
    }).fullName,
  ).toEqualTypeOf<string>();
  const deleted = extended.User.delete({ where: { id: 1 } });
  if (deleted) expectTypeOf(deleted.fullName).toEqualTypeOf<string>();
  expectTypeOf(
    extended.User.createManyAndReturn({
      data: [{ email: "a@example.com", score: 1 }],
    })[0].fullName,
  ).toEqualTypeOf<string>();
  expectTypeOf(
    extended.User.updateManyAndReturn({ data: { name: "a" } })[0].fullName,
  ).toEqualTypeOf<string>();
}

// レコードを返さない操作は非対象のまま
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
  expectTypeOf(extended.User.count({})).toEqualTypeOf<number>();
  expectTypeOf(
    extended.User.createMany({ data: [{ email: "a@example.com", score: 1 }] })
      .count,
  ).toEqualTypeOf<number>();
  expectTypeOf(
    extended.User.updateMany({ data: { name: "a" } }).count,
  ).toEqualTypeOf<number>();
  expectTypeOf(extended.User.deleteMany({}).count).toEqualTypeOf<number>();
}

// 算出フィールドはネストしたリレーション結果には出ない（Tier1）
{
  const extended = client.$extends({
    result: {
      $allModels: {
        tag: { compute: () => "t" },
      },
    },
  });
  const rows = extended.User.findMany({ include: { posts: true } });
  expectTypeOf(rows[0].tag).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0]).not.toHaveProperty("tag");
  expectTypeOf(rows[0].posts[0].title).toEqualTypeOf<string>();
}

// query と result を同一 extension で併用できる
{
  const extended = client.$extends({
    query: {
      User: {
        findMany: ({ args, query }) => query(args),
      },
    },
    result: {
      User: {
        fullName: {
          needs: { email: true },
          compute: (user) => `x${user.email}`,
        },
      },
    },
  });
  expectTypeOf(extended.User.findMany({})[0].fullName).toEqualTypeOf<string>();
}

// チェーン: 算出フィールドが累積し、同名は後勝ち
{
  const extended = client
    .$extends({
      result: {
        User: {
          fullName: {
            needs: { email: true },
            compute: (user) => `x${user.email}`,
          },
        },
      },
    })
    .$extends({
      result: {
        Post: {
          headline: {
            needs: { title: true },
            compute: (post) => `# ${post.title}`,
          },
        },
      },
    });
  expectTypeOf(extended.User.findMany({})[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(extended.Post.findMany({})[0].headline).toEqualTypeOf<string>();

  const overridden = client
    .$extends({ result: { User: { tag: { compute: () => "s" } } } })
    .$extends({ result: { User: { tag: { compute: () => 2 } } } });
  expectTypeOf(overridden.User.findMany({})[0].tag).toEqualTypeOf<number>();
}

// globalOmit は result 拡張後も維持される
{
  const extended = omitClient.$extends({
    result: {
      User: {
        fullName: {
          needs: { email: true },
          compute: (user) => `x${user.email}`,
        },
      },
    },
  });
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].fullName).toEqualTypeOf<string>();
  expectTypeOf(rows[0]).not.toHaveProperty("email");
  expectTypeOf(rows[0].id).toEqualTypeOf<number>();
}

// 拡張なしクライアントは従来どおり
{
  const rows = client.User.findMany({ where: { id: 1 } });
  expectTypeOf(rows[0].id).toEqualTypeOf<number>();
  expectTypeOf(rows[0]).not.toHaveProperty("fullName");
  // @ts-expect-error 素のクライアントの select に算出フィールドは書けない
  client.User.findMany({ select: { fullName: true } });
}

// query-only 拡張と空拡張は従来型のまま
{
  const queryOnly = client.$extends({
    query: {
      User: { findMany: ({ args, query }) => query(args) },
    },
  });
  expectTypeOf(queryOnly.User.findMany({})[0].id).toEqualTypeOf<number>();
  expectTypeOf(queryOnly.User.findMany({})[0]).not.toHaveProperty("fullName");

  const empty = client.$extends({});
  expectTypeOf(empty.User.findMany({})[0].id).toEqualTypeOf<number>();
}
