import type { NodeType, Schema } from '@tiptap/pm/model';

export function getTableNodeTypes(schema: Schema): Record<string, NodeType> {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes;
  }

  const roles: Record<string, NodeType> = {};

  for (const nodeType of Object.values(schema.nodes)) {
    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType;
    }
  }

  schema.cached.tableNodeTypes = roles;

  return roles;
}
