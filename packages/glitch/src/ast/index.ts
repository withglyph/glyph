import * as recast from 'recast';
import * as parser from 'recast/parsers/typescript.js';

const b: typeof recast.types.builders = recast.types.builders;
type Program = recast.types.namedTypes.Program;

export const parse = (code: string) => {
  const ast = recast.parse(code, { parser });
  return ast.program as Program;
};

export const print = (program: Program) => {
  return recast.print(program);
};

export const walk = async (program: Program, visitor: recast.types.Visitor) => {
  recast.visit(program, visitor);
};

export { b };
export type { Program };
