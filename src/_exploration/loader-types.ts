import type {SerializableRelationQuery} from "../query-type";

export type OnLoadedFn = (
  model: string,
  key: string,
  partialInstance: Record<string, unknown>
) => void;

export interface BaseLoader {
  setOnLoaded(onLoaded: OnLoadedFn): void;
  loadBatch(requests: MissingDataRequest[]): Promise<unknown>;
}

export type LoaderResult =
  | {state: "resolved"; payload: unknown}
  | {state: "pending"; promise: Promise<unknown>};

export type MissingDataRequest =
  | {
      type: "field";
      model: string;
      id: string;
      field: string;
    }
  | {
      type: "relation";
      model: string;
      id: string;
      // name: string;
      relKey: string;
      query: SerializableRelationQuery;
    };

export interface BaseRequester {
  request: (
    requests: MissingDataRequest[]
  ) => Promise<{model: string; key: string; partialInstance: Record<string, unknown>}[]>;
}
