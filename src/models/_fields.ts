type TypedField<K extends string, X> = { type: K; _: X };

export const id = <T extends string>() => {
  return { type: "id" } as TypedField<"id", T>;
};

export const string = (opts: BaseOpts = {}): SimpleFieldEntry => {
  return { type: "string", ...opts };
};

export const date = (opts: BaseOpts = {}): SimpleFieldEntry => {
  return { type: "date", ...opts };
};

export const day = (opts: BaseOpts = {}): SimpleFieldEntry => {
  return { type: "day", ...opts };
};

export const obj = <T>() => {
  return { type: "obj" } as TypedField<"obj", T>;
};

type BaseOpts = { optional?: boolean };

export type SimpleFieldEntry = BaseOpts &
  (
    | { type: "string" | "date" | "day" }
    | TypedField<"id", any>
    | TypedField<"obj", any>
  );

type InferType<T extends SimpleFieldEntry> = T extends {
  type: "string";
}
  ? string
  : T extends { type: "date" }
    ? Date
    : T extends { type: "day" }
      ? { day: number; month: number; year: number }
      : T extends { type: "id"; _: infer X }
        ? X
        : T extends { type: "obj"; _: infer X }
          ? X
          : never;

type ApplyBaseOpts<T, F extends SimpleFieldEntry> = F extends {
  optional: true;
}
  ? T | null
  : T;

export type InferSimpleFieldEntry<T extends SimpleFieldEntry> = ApplyBaseOpts<
  InferType<T>,
  T
>;
