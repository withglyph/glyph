import { Prisma, PrismaClient } from '@prisma/client';
import * as R from 'radash';
import { indexName, openSearch } from '$lib/server/search';
import { disassembleHangulString, InitialHangulString } from '$lib/utils';
import type { ApiResponse } from '@opensearch-project/opensearch';
import type { InteractiveTransactionClient } from '$lib/server/database';

type IndexPostParams = {
  db: InteractiveTransactionClient;
  postId: string;
};

export const indexPost = async ({ db, postId }: IndexPostParams) => {
  const post = await db.post.findUniqueOrThrow({
    include: {
      publishedRevision: {
        include: {
          tags: {
            include: { tag: true },
          },
        },
      },
    },
    where: { id: postId },
  });

  if (post.publishedRevision) {
    if (post.publishedRevision.kind === 'PUBLISHED' && post.visibility === 'PUBLIC' && post.password === null) {
      await openSearch.index({
        index: indexName('posts'),
        id: post.id,
        body: {
          title: post.publishedRevision.title,
          subtitle: post.publishedRevision.subtitle,
          publishedAt: post.publishedAt?.getTime() ?? Date.now(),
          tags: post.publishedRevision.tags.map(({ tag }) => ({ id: tag.id, name: tag.name, nameRaw: tag.name })),
          contentFilters: post.contentFilters,
          spaceId: post.spaceId,
        },
      });
    } else {
      try {
        await openSearch.delete({
          index: indexName('posts'),
          id: post.id,
        });
      } catch {
        /* empty */
      }
    }
  }
};

type IndexSpaceParams = {
  db: InteractiveTransactionClient;
  spaceId: string;
};

export const indexSpace = async ({ db, spaceId }: IndexSpaceParams) => {
  const space = await db.space.findUniqueOrThrow({
    where: { id: spaceId },
  });

  if (space.state === 'ACTIVE' && space.visibility === 'PUBLIC') {
    await openSearch.index({
      index: indexName('spaces'),
      id: space.id,
      body: {
        name: space.name,
      },
    });
  } else {
    try {
      await openSearch.delete({
        index: indexName('spaces'),
        id: space.id,
      });
    } catch {
      /* empty */
    }
  }
};

type IndexTagParams = {
  tags: {
    id: string;
    name: string;
  }[];
};

export const indexTags = async ({ tags }: IndexTagParams) => {
  if (tags.length === 0) return;

  const disassembledTags = tags.map(({ id, name }) => ({
    id,
    name: {
      raw: name,
      disassembled: disassembleHangulString(name),
      initial: InitialHangulString(name) || null,
    },
  }));

  await openSearch.bulk({
    index: indexName('tags'),
    body: disassembledTags.flatMap((tag) => [{ index: { _id: tag.id } }, { name: tag.name }]),
  });
};

type SearchResultToPrismaDataParams<T extends Uncapitalize<Prisma.ModelName>> = {
  searchResult: ApiResponse;
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
  const ids: string[] = searchResult.body.hits.hits.map((hit: { _id: string }) => hit._id);

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
