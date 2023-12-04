import fs from 'node:fs/promises';
import graphql from 'graphql';
import { version } from '../version';
import { collectArtifactSources } from './artifact';
import { hash } from './hash';
import { collectSchemaSource } from './schema';
import type {
  Artifact,
  GlitchContext,
  ValidDocumentNode,
  ValidFragmentDocumentNode,
  ValidOperationDocumentNode,
} from '../types';

export const collectDocuments = async (context: GlitchContext): Promise<{ success: boolean; refreshed: boolean }> => {
  const schemaSource = await collectSchemaSource(context);
  const artifactSources = await collectArtifactSources(context);

  try {
    context.schema = graphql.parse(schemaSource);
  } catch (err) {
    console.error(`💥 GraphQL schema error`);
    if (err instanceof Error) {
      console.error(`💥 ${err.message}`);
    } else {
      console.error(`💥 ${err}`);
    }

    return {
      success: false,
      refreshed: false,
    };
  }

  const schemaHash = hash(schemaSource);
  const schemaRefreshed = schemaHash !== context.state.schemaHash;
  context.state.schemaHash = schemaHash;

  const oldArtifactHashes = { ...context.state.artifactHashes };
  const newArtifactHashes: Record<string, number> = {};

  let errored = false;
  const artifacts: Artifact[] = [];

  for (const { filePath, source } of artifactSources) {
    try {
      const documentNode = graphql.parse(source);

      if (documentNode.definitions.length !== 1) {
        throw new Error('Document must have only one definition');
      }

      const definition = documentNode.definitions[0];
      if (definition.kind !== 'OperationDefinition' && definition.kind !== 'FragmentDefinition') {
        throw new Error('Document must be an operation or fragment');
      }

      if (!definition.name) {
        throw new Error('Document must have a name');
      }

      const validDocumentNode = documentNode as ValidDocumentNode;
      const artifactHash = hash(source);

      if (isOperationDocumentNode(validDocumentNode)) {
        const definition = validDocumentNode.definitions[0];

        if (definition.operation === 'query') {
          const isRoute = /\+(page|layout)(@.*)?\.svelte$/.test(filePath);

          if (isRoute) {
            try {
              await fs.stat(filePath.replace(/(@.*)?\.svelte$/, '.ts'));
            } catch {
              throw new Error('Query document within route file must have a accompanying .ts file');
            }
          } else {
            throw new Error('Query document must be in a route file');
          }
        }

        artifacts.push({
          kind: definition.operation,
          name: definition.name.value,

          filePath,
          source,
          hash: artifactHash,

          documentNode: validDocumentNode,
        });
      } else if (isFragmentDocumentNode(validDocumentNode)) {
        const definition = validDocumentNode.definitions[0];

        artifacts.push({
          kind: 'fragment',
          name: definition.name.value,

          filePath,
          source,
          hash: artifactHash,

          documentNode: validDocumentNode,
        });
      }

      newArtifactHashes[definition.name.value] = artifactHash;
    } catch (err) {
      errored = true;
      console.error(`💥 GraphQL document error: ${err}`);
      console.error(`💥 - Path: ${filePath}`);
    }
  }

  if (errored) {
    return {
      success: false,
      refreshed: false,
    };
  }

  const names = artifacts.map(({ name }) => name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

  if (duplicates.length > 0) {
    console.error('💥 Documents must have unique names');
    for (const name of duplicates) {
      console.error(`💥 - Multiple occurrence of ${name} on following paths:`);
      for (const artifact of artifacts.filter((artifact) => artifact.name === name)) {
        console.error(`💥   - ${artifact.filePath}`);
      }
    }

    return {
      success: false,
      refreshed: false,
    };
  }

  let artifactRefreshed = false;

  for (const [artifactName, oldArtifactHash] of Object.entries(oldArtifactHashes)) {
    if (newArtifactHashes[artifactName]) {
      if (newArtifactHashes[artifactName] !== oldArtifactHash) {
        artifactRefreshed = true;
        console.log(`📋 ${artifactName} 💫`);
      }
    } else {
      artifactRefreshed = true;
      console.log(`📋 ${artifactName} 🧹`);
    }
  }

  for (const artifactName of Object.keys(newArtifactHashes)) {
    if (!oldArtifactHashes[artifactName]) {
      artifactRefreshed = true;
      console.log(`📋 ${artifactName} ✨`);
    }
  }

  context.artifacts = artifacts;
  context.state.artifactHashes = newArtifactHashes;

  const versionMismatch = context.state.version !== version;

  return {
    success: true,
    refreshed: schemaRefreshed || artifactRefreshed || versionMismatch,
  };
};

const isOperationDocumentNode = (documentNode: ValidDocumentNode): documentNode is ValidOperationDocumentNode => {
  return documentNode.definitions[0].kind === 'OperationDefinition';
};

const isFragmentDocumentNode = (documentNode: ValidDocumentNode): documentNode is ValidFragmentDocumentNode => {
  return documentNode.definitions[0].kind === 'FragmentDefinition';
};
