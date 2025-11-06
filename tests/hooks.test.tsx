/**
 * @vitest-environment happy-dom
 */
import {test, expect, beforeAll, afterEach, afterAll} from "vitest";
import {render, screen, cleanup} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React, {Suspense} from "react";
import {server} from "./mocks/node";
import {Store} from "../src/_exploration/store";
import {BatchedLoader} from "../src/_exploration/loader";
import {ApiRequester} from "../src/_exploration/api-requester";
import {createHooks} from "../src/_exploration/create-hooks";

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function getStore() {
  const batchedLoader = new BatchedLoader({
    batchTimeoutMs: 0,
    requester: new ApiRequester({
      baseUrl: "https://api.example.com/",
    }),
  });
  const store = new Store(batchedLoader);
  return store;
}

test("useFetch returns unwrapped single item (not wrapped with value/partKeys)", async () => {
  const store = getStore();
  const {useFetch} = createHooks(store);

  // Pre-load the data so it's available immediately
  const result = store.loadData("account", ["1"], {fields: ["name", "subdomain"]});
  if (result.state === "pending") await result.promise;

  function TestComponent() {
    const account = useFetch("account", "1", {fields: ["name", "subdomain"]});

    return <div data-testid="output">{JSON.stringify(account)}</div>;
  }

  render(
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
      <TestComponent />
    </Suspense>
  );
  expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  expect(screen.getByTestId("output").textContent).toBe(
    JSON.stringify({name: "myOrg", subdomain: "myorg"})
  );
});

test("useFetchFromRoot returns unwrapped relation data (not wrapped with value/partKeys)", async () => {
  const store = getStore();
  const {useFetchFromRoot} = createHooks(store);

  // Pre-load the data
  const result = store.loadData("_root", [""], {relations: {account: {fields: ["name"]}}});
  if (result.state === "pending") await result.promise;

  function TestComponent() {
    const data = useFetchFromRoot({
      account: {fields: ["name"]},
    });

    return <div data-testid="output">{JSON.stringify(data)}</div>;
  }

  render(
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
      <TestComponent />
    </Suspense>
  );

  expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  expect(screen.getByTestId("output").textContent).toBe(JSON.stringify({account: {name: "myOrg"}}));
});
