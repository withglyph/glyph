import { namedTypes as types } from 'ast-types';
import * as recast from 'recast';
import * as parser from 'recast/parsers/typescript.js';

export const parse = (code: string) => {
  const ast = recast.parse(code, { parser });
  return ast.program as types.Program;
};

export const print = (program: types.Program) => {
  return recast.print(program);
};

export const walk = async (
  program: types.Program,
  visitor: recast.types.Visitor,
) => {
  recast.visit(program, visitor);
};

export { builders as b } from 'ast-types';
export { namedTypes as n } from 'ast-types';
