import graphql from 'graphql';
import type { Client } from '@urql/core';
import type { Readable } from 'svelte/store';

export type ValidOperationDocumentNode = {
  kind: graphql.Kind.DOCUMENT;
  definitions: [graphql.OperationDefinitionNode & { name: graphql.NameNode }];
};

export type ValidFragmentDocumentNode = {
  kind: graphql.Kind.DOCUMENT;
  definitions: [graphql.FragmentDefinitionNode & { name: graphql.NameNode }];
};

export type ValidDocumentNode =
  | ValidOperationDocumentNode
  | ValidFragmentDocumentNode;

type OperationArtifact = {
  kind: 'query' | 'mutation' | 'subscription';
  documentNode: ValidOperationDocumentNode;
};

type FragmentArtifact = {
  kind: 'fragment';
  documentNode: ValidFragmentDocumentNode;
};

export type Artifact = {
  name: string;
  filePath: string;
  source: string;
} & (OperationArtifact | FragmentArtifact);

export type GlitchContext = {
  root: string;
  codegenRoot: string;

  schema: graphql.DocumentNode | undefined;
  artifacts: Artifact[];

  state: {
    fakePaths: string[];

    schemaHash: number;
    artifactHashes: number[];
  };
};

export type GlitchClient = {
  client: Client;
  errorHandler: (error: unknown) => Error;
};

export type QueryStore<D> = Readable<D> & {
  refetch: () => void;
};

export type MutationStore<D, V> = Readable<{
  inflight: boolean;
}> &
  (V extends Record<string, never>
    ? () => Promise<D[keyof D]>
    : V extends { input: infer I }
    ? (input: I) => Promise<D[keyof D]>
    : never);

export type FragmentStore<D> = Readable<D>;
