import { expectTypeOf } from "vitest";
import { GassmaClient } from "../__generated__/client";

const client = new GassmaClient();

// Tier2: nested include(default)の子モデル computed が正しい戻り型で出る
{
  const extended = client.$extends({
    result: {
      Post: {
        headline: {
          needs: { title: true },
          compute: (post) => `# ${post.title}`,
        },
      },
    },
  });
  const rows = extended.User.findMany({ include: { posts: true } });
  expectTypeOf(rows[0].posts[0].headline).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0].title).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0].id).toEqualTypeOf<number>();
}

// Tier2: nested computed の戻り型が number でも保たれる
{
  const extended = client.$extends({
    result: {
      Post: {
        doubleId: {
          needs: { id: true },
          compute: (post) => post.id * 2,
        },
      },
    },
  });
  const rows = extended.User.findMany({ include: { posts: true } });
  expectTypeOf(rows[0].posts[0].doubleId).toEqualTypeOf<number>();
}

// Tier2: oneToOne(nullable)の nested computed
{
  const extended = client.$extends({
    result: {
      Profile: {
        bioLen: {
          needs: { bio: true },
          compute: (profile) => profile.bio.length,
        },
      },
    },
  });
  const rows = extended.User.findMany({ include: { profile: true } });
  const profile = rows[0].profile;
  if (profile) expectTypeOf(profile.bioLen).toEqualTypeOf<number>();
}

// Tier2: manyToOne(nullable)の nested computed
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
  const rows = extended.Post.findMany({ include: { author: true } });
  const author = rows[0].author;
  if (author) expectTypeOf(author.fullName).toEqualTypeOf<string>();
}

// Tier2: 深いネスト(User→posts→tags)で各階層の computed
{
  const extended = client.$extends({
    result: {
      Post: {
        headline: {
          needs: { title: true },
          compute: (post) => `# ${post.title}`,
        },
      },
      Tag: {
        upper: {
          needs: { name: true },
          compute: (tag) => tag.name.toUpperCase(),
        },
      },
    },
  });
  const rows = extended.User.findMany({
    include: { posts: { include: { tags: true } } },
  });
  expectTypeOf(rows[0].posts[0].headline).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0].tags[0].upper).toEqualTypeOf<string>();
}

// Tier2: $allModels が nested にも付く
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
  expectTypeOf(rows[0].posts[0].tag).toEqualTypeOf<string>();
}

// Tier2: nested でもモデル固有が $allModels に勝つ
{
  const extended = client.$extends({
    result: {
      $allModels: { tag: { compute: () => "t" } },
      Post: { tag: { compute: () => 123 } },
    },
  });
  const rows = extended.User.findMany({ include: { posts: true } });
  expectTypeOf(rows[0].tag).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0].tag).toEqualTypeOf<number>();
}

// Tier2: 自己リレーション(Category tree)の nested computed
{
  const extended = client.$extends({
    result: {
      Category: {
        label: {
          needs: { name: true },
          compute: (category) => category.name,
        },
      },
    },
  });
  const rows = extended.Category.findMany({ include: { children: true } });
  expectTypeOf(rows[0].label).toEqualTypeOf<string>();
  expectTypeOf(rows[0].children[0].label).toEqualTypeOf<string>();
}

// Tier2: チェーン $extends の computed が nested にも累積する
{
  const extended = client
    .$extends({
      result: {
        Post: {
          headline: {
            needs: { title: true },
            compute: (post) => `# ${post.title}`,
          },
        },
      },
    })
    .$extends({
      result: {
        Tag: {
          upper: {
            needs: { name: true },
            compute: (tag) => tag.name.toUpperCase(),
          },
        },
      },
    });
  const rows = extended.User.findMany({
    include: { posts: { include: { tags: true } } },
  });
  expectTypeOf(rows[0].posts[0].headline).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0].tags[0].upper).toEqualTypeOf<string>();
}

// Tier2: nested select は computed を選ばなければ computed を出さない
{
  const extended = client.$extends({
    result: {
      Post: {
        headline: {
          needs: { title: true },
          compute: (post) => `# ${post.title}`,
        },
      },
    },
  });
  const rows = extended.User.findMany({
    include: { posts: { select: { title: true } } },
  });
  expectTypeOf(rows[0].posts[0].title).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0]).not.toHaveProperty("headline");
  expectTypeOf(rows[0].posts[0]).not.toHaveProperty("id");
}

// Tier2: nested omit はスカラーを落としつつ computed を残す
{
  const extended = client.$extends({
    result: {
      Post: {
        headline: {
          needs: { title: true },
          compute: (post) => `# ${post.title}`,
        },
      },
    },
  });
  const rows = extended.User.findMany({
    include: { posts: { omit: { content: true } } },
  });
  expectTypeOf(rows[0].posts[0].headline).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0].title).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0]).not.toHaveProperty("content");
}

// Tier2 後方互換: 拡張なしなら nested に computed は出ない
{
  const rows = client.User.findMany({ include: { posts: true } });
  expectTypeOf(rows[0].posts[0].title).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0]).not.toHaveProperty("headline");
}

// Tier2 後方互換: query-only 拡張は nested も従来型
{
  const queryOnly = client.$extends({
    query: { User: { findMany: ({ args, query }) => query(args) } },
  });
  const rows = queryOnly.User.findMany({ include: { posts: true } });
  expectTypeOf(rows[0].posts[0].title).toEqualTypeOf<string>();
  expectTypeOf(rows[0].posts[0]).not.toHaveProperty("headline");
}
