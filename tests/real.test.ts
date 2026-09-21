import {test, expect} from "vitest";
import {buildFetchers} from "../src";

// The API rejects anonymous POSTs from scripts, so these need an API token of the mmensch org.
const token = process.env.CODECKS_TEST_TOKEN;

const getFetchers = () => buildFetchers({token: token!});

test.skipIf(!token)("real test with public data", async () => {
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

test.skipIf(!token)("real test with exists", async () => {
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
