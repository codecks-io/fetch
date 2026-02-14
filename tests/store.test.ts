import {test, expect} from "vitest";
import {beforeAll, afterEach, afterAll} from "vitest";
import {server} from "./mocks/node";
import {Store} from "../src/_exploration/store";
import {BatchedLoader} from "../src/_exploration/loader";
import {ApiRequester} from "../src/_exploration/api-requester";
import type {BaseLoader, MissingDataRequest} from "../src/_exploration/loader-types";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Tracking loader to verify caching behavior
class TrackingLoader implements BaseLoader {
  private innerLoader: BaseLoader;
  public loadedRequests: MissingDataRequest[][] = [];

  constructor(innerLoader: BaseLoader) {
    this.innerLoader = innerLoader;
  }

  setOnLoaded(onLoaded: (model: string, key: string, res: Record<string, unknown>) => void): void {
    this.innerLoader.setOnLoaded(onLoaded);
  }

  async loadBatch(requests: MissingDataRequest[]): Promise<void> {
    this.loadedRequests.push([...requests]);
    await this.innerLoader.loadBatch(requests);
  }

  reset() {
    this.loadedRequests = [];
  }
}

const getStore = () => {
  const batchedLoader = new BatchedLoader({
    batchTimeoutMs: 0,
    requester: new ApiRequester({
      baseUrl: "https://api.example.com/",
    }),
  });
  const trackingLoader = new TrackingLoader(batchedLoader);
  const store = new Store(trackingLoader);
  return {store, loader: trackingLoader};
};

test("Store caching - loads data then only requests missing fields", async () => {
  const {store, loader} = getStore();

  // First load: Request account 1 with name field
  const result1 = await store.loadData("account", ["1"], {fields: ["name"]});

  expect(result1.state).toBe("pending");
  if (result1.state === "pending") {
    // The promise now resolves to the value directly (no wrapper)
    const finalResult = await result1.promise;
    expect(finalResult).toEqual({
      "1": {"~model": "account", "~key": "1", name: "myOrg"},
    });
  }

  // Verify the first request was made
  expect(loader.loadedRequests).toEqual([
    [
      {
        field: "name",
        id: "1",
        model: "account",
        type: "field",
      },
    ],
  ]);

  loader.reset();

  // Second load: Request account 1 with name (cached) and subdomain (new)
  const result2 = await store.loadData("account", ["1"], {fields: ["name", "subdomain"]});

  expect(result2.state).toBe("pending");
  if (result2.state === "pending") {
    const finalResult = await result2.promise;
    expect(finalResult).toEqual({
      "1": {
        "~model": "account",
        "~key": "1",
        name: "myOrg",
        subdomain: "myorg",
      },
    });
  }

  // Verify only the missing field (subdomain) was requested
  expect(loader.loadedRequests).toEqual([
    [
      {
        field: "subdomain",
        id: "1",
        model: "account",
        type: "field",
      },
    ],
  ]);
});

test("Store caching - returns resolved immediately when all data is cached", async () => {
  const {store, loader} = getStore();

  // First load: Request account 1 with name and subdomain
  const result1 = await store.loadData("account", ["1"], {fields: ["name", "subdomain"]});

  if (result1.state === "pending") await result1.promise;

  loader.reset();

  // Second load: Request same data (should be fully cached)
  const result2 = store.loadData("account", ["1"], {fields: ["name", "subdomain"]});

  // Should return immediately as resolved, not pending
  expect(result2.state).toBe("resolved");
  expect(loader.loadedRequests).toHaveLength(0);

  if (result2.state === "resolved") {
    expect(result2.payload).toEqual({
      "1": {
        "~model": "account",
        "~key": "1",
        name: "myOrg",
        subdomain: "myorg",
      },
    });
  }
});

test.only("Store - fetch relation with query params (limit, orderBy)", async () => {
  const {store, loader} = getStore();

  // Load releases from root with limit and orderBy
  const result = await store.loadData("_root", [""], {
    relations: {
      releases: {
        limit: 5,
        orderBy: "-createdAt" as any,
        fields: ["title"],
      },
    },
  });

  expect(result.state).toBe("pending");
  if (result.state === "pending") {
    const finalResult = await result.promise;
    expect(finalResult).toEqual({
      "": {
        "~releases": ["1", "2", "3"],
        releases: [
          {"~model": "release", "~key": "1", title: "Release v1.0"},
          {"~model": "release", "~key": "2", title: "Release v0.9"},
          {"~model": "release", "~key": "3", title: "Release v0.8"},
        ],
      },
    });
  }

  // Verify the request was made with proper query params
  expect(loader.loadedRequests).toEqual([
    [
      {
        type: "relation",
        model: "_root",
        id: "",
        relKey: 'releases({"$limit":5,"$order":"-createdAt"})',
        contents: {asField: false, fields: ["title"], relations: undefined},
      },
    ],
  ]);

  store.invalidate([`_root::releases({"$limit":5,"$order":"-createdAt"})`]);
});
