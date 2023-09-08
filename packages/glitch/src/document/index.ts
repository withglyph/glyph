import graphql from 'graphql';
import { collectArtifactSources } from './artifact';
import { hash } from './hash';
import { collectSchemaSource } from './schema';
import {
  isFragmentDocumentNode,
  isOperationDocumentNode,
  validateDocumentNode,
} from './validate';
import type { GlitchContext } from '../types';

export const refreshDocuments = async (context: GlitchContext) => {
  const schemaSource = await collectSchemaSource(context);
  const artifactSources = await collectArtifactSources(context);

  const schemaHash = hash(schemaSource);
  let schemaRefreshed = false;

  if (schemaHash !== context.state.schemaHash) {
    schemaRefreshed = true;
    context.schema = graphql.parse(schemaSource);
    context.state.schemaHash = schemaHash;
  }

  const artifactHashes = artifactSources.map(({ source }) => hash(source));

  const removedArtifactNames: string[] = [];
  const addedArtifactNames: string[] = [];

  for (const [i, artifactHash] of context.state.artifactHashes.entries()) {
    if (artifactHashes.includes(artifactHash)) {
      continue;
    }

    removedArtifactNames.push(context.artifacts[i].name);

    context.artifacts.splice(i, 1);
    context.state.artifactHashes.splice(i, 1);
  }

  for (const [i, artifactHash] of artifactHashes.entries()) {
    if (context.state.artifactHashes.includes(artifactHash)) {
      continue;
    }

    const source = artifactSources[i];
    const documentNode = graphql.parse(source.source);

    if (!validateDocumentNode(documentNode)) {
      continue;
    }

    addedArtifactNames.push(documentNode.definitions[0].name.value);

    context.state.artifactHashes.push(artifactHash);

    if (isOperationDocumentNode(documentNode)) {
      const definition = documentNode.definitions[0];

      context.artifacts.push({
        kind: definition.operation,
        name: definition.name.value,

        filePath: source.filePath,
        source: source.source,

        documentNode,
      });
    } else if (isFragmentDocumentNode(documentNode)) {
      const definition = documentNode.definitions[0];

      context.artifacts.push({
        kind: 'fragment',
        name: definition.name.value,

        filePath: source.filePath,
        source: source.source,

        documentNode,
      });
    }
  }

  // for (const name of removedArtifactNames) {
  //   if (!addedArtifactNames.includes(name)) {
  //     console.log(`📋 ${name} 🧹`);
  //   }
  // }

  // for (const name of addedArtifactNames) {
  //   if (removedArtifactNames.includes(name)) {
  //     console.log(`📋 ${name} 💫`);
  //   } else {
  //     console.log(`📋 ${name} ✨`);
  //   }
  // }

  return (
    schemaRefreshed ||
    removedArtifactNames.length > 0 ||
    addedArtifactNames.length > 0
  );
};
