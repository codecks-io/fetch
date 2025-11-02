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

  if (result1.state === "pending") {
    const finalResult = await result1.promise;
    expect(finalResult.state).toBe("resolved");
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

  if (result2.state === "pending") {
    const finalResult = await result2.promise;
    expect(finalResult.state).toBe("resolved");
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
    expect(result2.value.value).toEqual({
      "1": {
        name: "myOrg",
        subdomain: "myorg",
      },
    });
  }
});
