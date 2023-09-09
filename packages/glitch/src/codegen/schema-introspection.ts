import graphql from 'graphql';
import type { GlitchContext } from '../types';

export const generateSchemaIntrospection = (context: GlitchContext) => {
  if (!context.schema) {
    return '';
  }

  const schema = graphql.buildASTSchema(context.schema);
  return JSON.stringify(graphql.introspectionFromSchema(schema));
};
