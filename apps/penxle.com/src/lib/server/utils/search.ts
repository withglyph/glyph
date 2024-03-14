import * as R from 'radash';
import { elasticSearch, indexName } from '$lib/server/search';
import { getPostViewCount, getTagUsageCount } from '$lib/server/utils';
import { disassembleHangulString, InitialHangulString } from '$lib/utils';
import { Prisma, PrismaClient } from '$prisma';
import { redis } from '../cache';
import type { estypes } from '@elastic/elasticsearch';
import type { InteractiveTransactionClient } from '$lib/server/database';

type IndexPostParam = Prisma.PostGetPayload<{
  select: {
    id: true;
    visibility: true;
    password: true;
    publishedAt: true;
    ageRating: true;
    space: {
      select: {
        id: true;
        state: true;
        visibility: true;
      };
    };
    tags: {
      select: {
        kind: true;
        tag: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
    publishedRevision: {
      select: {
        kind: true;
        title: true;
        subtitle: true;
      };
    };
  };
}>;

export const indexPost = async (post: IndexPostParam) => {
  if (post.publishedRevision) {
    if (
      post.publishedRevision.kind === 'PUBLISHED' &&
      post.visibility === 'PUBLIC' &&
      post.password === null &&
      post.space?.state === 'ACTIVE' &&
      post.space?.visibility === 'PUBLIC'
    ) {
      await elasticSearch.index({
        index: indexName('posts'),
        id: post.id,
        document: {
          title: post.publishedRevision.title,
          subtitle: post.publishedRevision.subtitle,
          publishedAt: post.publishedAt?.getTime() ?? Date.now(),
          tags: post.tags.map(({ kind, tag }) => ({ id: tag.id, name: tag.name, nameRaw: tag.name, kind })),
          ageRating: post.ageRating,
          spaceId: post.space.id,
        },
      });

      indexTags(post.tags.map(({ tag }) => ({ id: tag.id, name: tag.name })));
    } else {
      try {
        await elasticSearch.delete({
          index: indexName('posts'),
          id: post.id,
        });
      } catch {
        /* empty */
      }
    }
  }
};

type IndexPostByQueryParams = {
  db: InteractiveTransactionClient;
  where: Prisma.PostWhereInput;
};

export const indexPostByQuery = async ({ db, where }: IndexPostByQueryParams) => {
  const posts = await db.post.findMany({
    where,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      publishedRevision: true,
      space: true,
    },
  });

  for (const post of posts) {
    await indexPost(post);
  }
};

type IndexSpaceParam = Prisma.SpaceGetPayload<{
  select: {
    id: true;
    name: true;
    state: true;
    visibility: true;
  };
}>;

export const indexSpace = async (space: IndexSpaceParam) => {
  if (space.state === 'ACTIVE' && space.visibility === 'PUBLIC') {
    await elasticSearch.index({
      index: indexName('spaces'),
      id: space.id,
      document: {
        name: space.name,
      },
    });
  } else {
    try {
      await elasticSearch.delete({
        index: indexName('spaces'),
        id: space.id,
      });
    } catch {
      /* empty */
    }
  }
};

type IndexTagsParam = Prisma.TagGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>[];

export const indexTags = async (tags: IndexTagsParam) => {
  if (tags.length === 0) return;

  const disassembledTags = await Promise.all(
    tags.map(async ({ id, name }) => ({
      id,
      name: {
        raw: name,
        disassembled: disassembleHangulString(name),
        initial: InitialHangulString(name) || null,
      },
      usageCount: await getTagUsageCount(id),
    })),
  );

  await elasticSearch.bulk({
    index: indexName('tags'),
    operations: disassembledTags.flatMap((tag) => [{ index: { _id: tag.id } }, { name: tag.name }]),
  });
};

type SearchResultToPrismaDataParams<T extends Uncapitalize<Prisma.ModelName>> = {
  searchResult: estypes.SearchResponse;
  db: InteractiveTransactionClient;
  tableName: T;
  queryArgs: Prisma.Args<PrismaClient[T], 'findMany'>;
};

export const searchResultToPrismaData = async <T extends Uncapitalize<Prisma.ModelName>>({
  searchResult,
  db,
  tableName,
  queryArgs,
}: SearchResultToPrismaDataParams<T>): Promise<Prisma.Result<PrismaClient[T], typeof queryArgs, 'findMany'>> => {
  const ids: string[] = searchResult.hits.hits.map((hit: { _id: string }) => hit._id);

  // @ts-expect-error 중간에 임시로 id만 있는 객체로 캐스팅
  const prismaData: { id: string }[] = await db[tableName].findMany({
    ...queryArgs,
    where: {
      ...queryArgs.where,
      id: { in: ids },
    },
  });

  const posts = R.objectify(prismaData, (post) => post.id);

  // @ts-expect-error id만 있는 객체를 다시 원본 객체로 캐스팅 (함수 리턴 시그니처에 정의되어 있음)
  return R.sift(ids.map((id) => posts[id]));
};

type RawQueryContainer = {
  query: estypes.QueryDslQueryContainer;
  condition?: boolean;
};

export const makeQueryContainers = (containers: RawQueryContainer[]): estypes.QueryDslQueryContainer[] | undefined => {
  const result: estypes.QueryDslQueryContainer[] = containers
    .map(({ query, condition }) => {
      return condition === false ? undefined : query;
    })
    .filter((container): container is estypes.QueryDslQueryContainer => container !== undefined);

  return result.length > 0 ? result : undefined;
};

export type SearchResponse = estypes.SearchResponse;

type IndexPostTrendingScoreParams = {
  db: InteractiveTransactionClient;
  postId: string;
};

export const indexPostTrendingScore = async ({ db, postId }: IndexPostTrendingScoreParams) => {
  const trendingScoreCache = await redis.get(`Post:${postId}:trendingScore`);
  if (!trendingScoreCache) {
    const viewCount = await getPostViewCount({ db, postId });
    // 앞으로 점수에 영향을 미치는 요소들을 추가할지도?
    const score = viewCount;

    await elasticSearch.update({
      index: indexName('posts'),
      id: postId,
      doc: { trendingScore: score },
    });

    await redis.setex(`Post:${postId}:trendingScore`, 3600, score);
  }
};
