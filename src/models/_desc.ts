import type {FieldEntry, InferSimpleFieldEntry} from "./_fields";

/** What the Codecks API promises; the models only hold `stable` and `preview` items. */
export type Stability = "stable" | "preview";

/** Dates are `YYYY-MM-DD`. `use` names what to read instead. */
export type Deprecation = {since: string; removeAfter: string; use?: string};

/** Left out for `stable` items that aren't deprecated. */
export type TierOpts = {stability?: Stability; deprecated?: Deprecation};

export type ModelDesc<
  TName extends string,
  TFields extends FieldDesc,
  TRelations extends RelationsDesc,
  TKey extends (keyof TFields & string)[],
> = {
  name: TName;
  keys: TKey;
  fields: TFields;
  relations: TRelations;
} & TierOpts;

// don't ask me why the TName works... but it does, otherwise circular references do not work...

export type AnyDesc = ModelDesc<any, any, any, any[]>;
export type FieldDesc = Record<string, FieldEntry>;

export type HasManyEntry<TGetModel extends () => AnyDesc> = {
  getModel: TGetModel;
  isSingleton: false;
};

/** Without an `fk` the relation is its own field, like `resolvable.closedBy`. */
export type BelongsToOpts<TFk extends string> = {
  type: "belongsTo";
  fk?: TFk;
  optional?: boolean;
} & TierOpts;
type HasManyOpts = {type: "hasMany"; fkAsArray?: boolean} & TierOpts;
type HasOneOpts = {type: "hasOne"} & TierOpts;

export type RelationOpts = BelongsToOpts<any> | HasManyOpts | HasOneOpts;

export type RelationEntry<TRelName extends string, TOpts extends RelationOpts> = {
  relName: TRelName;
  options: TOpts;
};
type RelationsDesc = Record<string, RelationEntry<any, any>>;

export const makeModel = <
  TName extends string,
  TFields extends FieldDesc,
  THasMany extends RelationsDesc,
  const TKey extends (keyof FieldDesc & string)[],
>(
  opts: {
    name: TName;
    fields: TFields;
    relations: THasMany;
    keys: TKey;
  } & TierOpts
): ModelDesc<TName, TFields, THasMany, TKey> => {
  return opts;
};

export const relation = <RelName extends string, const Opts extends RelationOpts>(
  relName: RelName,
  options: Opts
): RelationEntry<RelName, Opts> => {
  return {relName, options};
};

export type InferFieldType<T extends FieldEntry> = T extends FieldEntry
  ? InferSimpleFieldEntry<T>
  : never;
