import type { AnyDesc, InferFieldType } from "./models/_desc";
type ModelMap = Record<string, AnyDesc>;

type OneOrArray<T> = T | T[];
// type NormalAndNegatedKeys<T> = T & { [K in keyof T & string as `!${K}`]: T[K] };

type OrderString<T extends string> = `${T}` | `-${T}`;

type OrderExpr<T> = { field: T; dir: "asc" | "desc" };

export type Order<T extends AnyDesc> =
  | OneOrArray<
      OrderString<keyof T["fields"] extends string ? keyof T["fields"] : never>
    >
  | OneOrArray<OrderExpr<T["fields"]>>;

type Operators<T> =
  // TODO: Extend!
  | { op: "lt" | "lte" | "gt" | "gte"; value: T }
  | { op: "eq" | "neq"; value: T | null }
  | { op: "in" | "notIn"; value: T[] }
  | (T extends string ? { op: "contains"; value: string } : never)
  | (T extends Array<infer El>
      ? { op: "has"; value: El } | { op: "overlaps"; value: El[] }
      : never);

type FieldQuery<T extends AnyDesc> = {
  [K in keyof T["fields"]]?:
    | null
    | OneOrArray<InferFieldType<T["fields"][K]>>
    | Operators<InferFieldType<T["fields"][K]>>;
};

export type Filter<T extends AnyDesc, TMap extends ModelMap> = FieldQuery<T>;
