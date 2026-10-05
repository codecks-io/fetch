import type {AnyDesc, InferFieldType} from "./models/_desc";
type ModelMap = Record<string, AnyDesc>;

type OneOrArray<T> = T | T[];
type NormalAndNegatedKeys<T> = T & {[K in keyof T & string as `!${K}`]: T[K]};

type OrderString<T extends string> = `${T}` | `-${T}`;

type OrderExpr<T> = {field: T; dir: "asc" | "desc"};

// `& string` rather than a conditional: for `AnyDesc` (`EnsureModelQuery`'s check) it yields
// `string`, where `keyof any extends string` is false and would reject every order string.
type FieldName<T extends AnyDesc> = keyof T["fields"] & string;

export type Order<T extends AnyDesc> =
  | OneOrArray<OrderString<FieldName<T>>>
  | OneOrArray<OrderExpr<FieldName<T>>>;

type Operators<T> =
  // TODO: Extend!
  | {op: "lt" | "lte" | "gt" | "gte"; value: T}
  | {op: "eq" | "neq"; value: T | null}
  | {op: "in" | "notIn"; value: T[]}
  | (T extends string ? {op: "contains"; value: string} : never)
  | (T extends Array<infer El> ? {op: "has"; value: El} | {op: "overlaps"; value: El[]} : never);

type FieldQuery<T extends AnyDesc> = {
  [K in keyof T["fields"]]?:
    | null
    | OneOrArray<InferFieldType<T["fields"][K]>>
    | Operators<InferFieldType<T["fields"][K]>>;
};

type RelationQuery<T extends AnyDesc, TMap extends ModelMap> = NormalAndNegatedKeys<{
  [K in keyof T["relations"]]?: SimpleFilter<TMap[T["relations"][K]["relName"]], TMap>;
}>;

type SimpleFilter<T extends AnyDesc, TMap extends ModelMap> =
  | FieldQuery<T>
  | RelationQuery<T, TMap>;

export type Filter<T extends AnyDesc, TMap extends ModelMap> = SimpleFilter<T, TMap> & {
  $and?: Filter<T, TMap>[];
  $or?: Filter<T, TMap>[];
};
