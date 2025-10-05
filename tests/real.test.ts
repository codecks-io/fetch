import {test, expect} from "vitest";
import {setup} from "../src";
import {createSimpleLoader} from "../src/simple-loader";

const getFetchers = () =>
  setup(
    createSimpleLoader({
      baseUrl: "https://api.codecks.io/",
      subdomain: "mmensch",
    })
  );

test("real test with public data", async () => {
  const {fetchFromRoot} = getFetchers();
  const response = await fetchFromRoot({
    account: {
      fields: ["subdomain"],
    },
  });
  expect(response).toEqual({
    account: {
      "~model": "account",
      "~key": "14c3021c-95ad-11e9-b939-5368e19a8f5e",
      id: "14c3021c-95ad-11e9-b939-5368e19a8f5e",
      subdomain: "mmensch",
    },
    "~account": "14c3021c-95ad-11e9-b939-5368e19a8f5e",
  });
});

test("real test with count", async () => {
  const {fetchFromRoot} = getFetchers();
  const response = await fetchFromRoot({
    releases: {
      type: "exists",
      as: "hasReleases",
    },
  });
  expect(response).toEqual({
    hasReleases: true,
  });
});
