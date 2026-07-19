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

// needs にはスカラーと同 extension 内の算出フィールド名だけが書ける
{
  client.$extends({
    result: {
      User: {
        ok: {
          needs: { email: true },
          compute: (user) => user.email,
        },
        okComputed: {
          needs: { ok: true },
          compute: () => 1,
        },
        bad: {
          // @ts-expect-error nope はスカラーでも算出フィールドでもない
          needs: { nope: true },
          compute: () => 1,
        },
      },
    },
  });
}

// 他モデルの算出フィールドは needs に書けない
{
  client.$extends({
    result: {
      User: {
        userOnly: { needs: { email: true }, compute: (user) => user.email },
      },
      Post: {
        bad: {
          // @ts-expect-error userOnly は User の算出フィールド
          needs: { userOnly: true },
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

// 算出フィールド依存: 依存先の compute 戻り型が依存元の compute 引数に現れる
{
  const extended = client.$extends({
    result: {
      User: {
        emailLen: {
          needs: { email: true },
          compute: (user: { email: string }) => user.email.length,
        },
        doubledLen: {
          needs: { emailLen: true },
          compute: (user) => {
            expectTypeOf(user.emailLen).toEqualTypeOf<number>();
            // @ts-expect-error emailLen は number なので toUpperCase は呼べない
            user.emailLen.toUpperCase();
            return user.emailLen * 2;
          },
        },
      },
    },
  });
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].emailLen).toEqualTypeOf<number>();
  expectTypeOf(rows[0].doubledLen).toEqualTypeOf<number>();
}

// 宣言順非依存: 依存元を依存先より先に宣言しても型が付く
{
  const extended = client.$extends({
    result: {
      User: {
        doubledFirst: {
          needs: { lenLater: true },
          compute: (user) => {
            expectTypeOf(user.lenLater).toEqualTypeOf<number>();
            return user.lenLater * 2;
          },
        },
        lenLater: {
          needs: { email: true },
          compute: (user: { email: string }) => user.email.length,
        },
      },
    },
  });
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].doubledFirst).toEqualTypeOf<number>();
  expectTypeOf(rows[0].lenLater).toEqualTypeOf<number>();
}

// $allModels の算出フィールドへモデル固有算出から依存できる
{
  const extended = client.$extends({
    result: {
      $allModels: {
        tag: { compute: () => "t" },
      },
      User: {
        tagged: {
          needs: { tag: true },
          compute: (user) => {
            expectTypeOf(user.tag).toEqualTypeOf<string>();
            return `#${user.tag}`;
          },
        },
      },
    },
  });
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].tagged).toEqualTypeOf<string>();
  expectTypeOf(rows[0].tag).toEqualTypeOf<string>();
}

// 未注釈（context-sensitive）な依存先: needs は通り結果型も正しい。
// compute 引数の値型のみ TS 推論の限界で never（依存先に注釈を付ければ実型になる）。
{
  const extended = client.$extends({
    result: {
      User: {
        rawLen: {
          needs: { email: true },
          compute: (user) => user.email.length,
        },
        viaRaw: {
          needs: { rawLen: true },
          compute: (user) => {
            expectTypeOf(user.rawLen).toBeNever();
            return 1;
          },
        },
      },
    },
  });
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].rawLen).toEqualTypeOf<number>();
  expectTypeOf(rows[0].viaRaw).toEqualTypeOf<number>();
}

// チェーン $extends 越しの算出フィールド依存（Prisma docs パターン）は完全に型が付く
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
        User: {
          titled: {
            needs: { fullName: true, id: true },
            compute: (user) => {
              expectTypeOf(user.fullName).toEqualTypeOf<string>();
              expectTypeOf(user.id).toEqualTypeOf<number>();
              // @ts-expect-error fullName は string なので toFixed は呼べない
              user.fullName.toFixed();
              return `${user.id}: ${user.fullName}`;
            },
          },
        },
      },
    });
  const rows = extended.User.findMany({});
  expectTypeOf(rows[0].titled).toEqualTypeOf<string>();
  expectTypeOf(rows[0].fullName).toEqualTypeOf<string>();
}

// チェーン先で無関係キーは引き続き不可
{
  client
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
        User: {
          bad: {
            // @ts-expect-error nope はスカラーでも算出フィールドでもない
            needs: { nope: true },
            compute: () => 1,
          },
        },
      },
    });
}

// 自己参照（循環）は型上は素直に許容する（ランタイムは打ち切りガード済み）
{
  const extended = client.$extends({
    result: {
      User: {
        selfy: {
          needs: { selfy: true, id: true },
          compute: (user) => user.id,
        },
      },
    },
  });
  expectTypeOf(extended.User.findMany({})[0].selfy).toEqualTypeOf<number>();
}
