declare const __nominal__type: unique symbol;
export type FilterNeverKeys<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type Nominal<Type, Identifier> = Type & {
  readonly [__nominal__type]: Identifier;
};
