export const generateUtility = () => {
  return `
export type MakeRequired<T, K extends string> = T & {
  [P in keyof T as P extends (K extends \`\${infer K0}.\${string}\` ? K0 : K)
    ? P
    : never]-?: P extends K
    ? NonNullable<T[P]>
    : MakeRequired<
        T[P],
        K extends \`\${Exclude<P, symbol>}.\${infer R}\` ? R : never
      >;
};
  `;
};
