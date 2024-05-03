import type graphql from 'graphql';

export type ContextHolder = {
  context: Context | null;
};

export type Context = {
  projectDir: string;
  bifrostDir: string;

  schema: graphql.GraphQLSchema;
  operationMap: Map<string, OperationArtifact>;
  fragmentMap: Map<string, FragmentArtifact>;
  artifacts: Artifact[];
};

export type ArtifactKind = 'query' | 'mutation' | 'subscription' | 'fragment';

export type BaseArtifact = {
  name: string;
  file: string;
  source: string;
  selections: Selection[];
  meta: Record<string, string>;
};

export type OperationArtifact = BaseArtifact & {
  kind: Extract<ArtifactKind, 'query' | 'mutation' | 'subscription'>;
  node: graphql.OperationDefinitionNode;
  variables: Variable[];
};

export type FragmentArtifact = BaseArtifact & {
  kind: Extract<ArtifactKind, 'fragment'>;
  on: string;
  node: graphql.FragmentDefinitionNode;
};

export type Artifact = OperationArtifact | FragmentArtifact;

export type BaseType = {
  name: string;
  isList: boolean;
  isNonNull: boolean;
};

export type TypenameType = {
  kind: '__typename';
};

export type ScalarType = BaseType & {
  kind: 'Scalar';
};

export type EnumType = BaseType & {
  kind: 'Enum';
  values: string[];
};

export type ObjectType = BaseType & {
  kind: 'Object';
};

export type InputObjectType = BaseType & {
  kind: 'InputObject';
};

export type InterfaceType = BaseType & {
  kind: 'Interface';
  implementations: string[];
};

export type UnionType = BaseType & {
  kind: 'Union';
  members: string[];
};

export type CompositeType = ObjectType | InterfaceType | UnionType;

export type FieldSelection = {
  name: string;
  alias?: string;
  arguments: Argument[];
};

export type TypenameFieldSelection = FieldSelection & {
  kind: 'TypenameField';
  name: '__typename';
  type: TypenameType;
};

export type ScalarFieldSelection = FieldSelection & {
  kind: 'ScalarField';
  type: ScalarType;
};

export type EnumFieldSelection = FieldSelection & {
  kind: 'EnumField';
  type: EnumType;
};

export type ObjectFieldSelection = FieldSelection & {
  kind: 'ObjectField';
  type: CompositeType;
  children: Selection[];
};

export type FragmentSpreadSelection = {
  kind: 'FragmentSpread';
  name: string;
};

export type InlineFragmentSelection = {
  kind: 'InlineFragment';
  type: string;
  children: Selection[];
};

export type Selection =
  | TypenameFieldSelection
  | ScalarFieldSelection
  | EnumFieldSelection
  | ObjectFieldSelection
  | FragmentSpreadSelection
  | InlineFragmentSelection;

export type VariableValue = {
  kind: 'Variable';
  name: string;
};

export type ListValue = {
  kind: 'List';
  values: Value[];
};

export type ObjectValue = {
  kind: 'Object';
  fields: { name: string; value: Value }[];
};

export type ScalarValue = {
  kind: 'Scalar';
  value: unknown;
};

export type Value = VariableValue | ListValue | ObjectValue | ScalarValue;

export type Argument = {
  name: string;
  value: Value;
};

export type FieldVariable = {
  name: string;
};

export type ScalarFieldVariable = FieldVariable & {
  kind: 'ScalarField';
  type: ScalarType;
};

export type EnumFieldVariable = FieldVariable & {
  kind: 'EnumField';
  type: EnumType;
};

export type InputObjectFieldVariable = FieldVariable & {
  kind: 'InputObjectField';
  type: InputObjectType;
  children: Variable[];
};

export type Variable = ScalarFieldVariable | EnumFieldVariable | InputObjectFieldVariable;

export type StoreKind = ArtifactKind;

export type $StoreSchema<Kind extends StoreKind = StoreKind, Input = unknown, Output = unknown> = {
  $name: string;
  $kind: Kind;
  $input: Input;
  $output: Output;
  $meta: Record<string, unknown>;
};

export type StoreSchema<Schema extends $StoreSchema = $StoreSchema> = {
  kind: Schema['$kind'];
  name: Schema['$name'];
  source: string;
  selections: { operation: Selection[]; fragments: Record<string, Selection[]> };
  meta: Schema['$meta'];
};
