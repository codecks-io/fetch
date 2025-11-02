import {Store} from "./store";
import {BatchedLoader} from "./loader";
import {ApiRequester} from "./api-requester";
import {createHooks} from "./create-hooks";

const loader = new BatchedLoader({
  batchTimeoutMs: 0,
  requester: new ApiRequester({
    baseUrl: "https://api.example.com/",
  }),
});

const store = new Store(loader);

export const {useFetch, useFetchFromRoot} = createHooks(store);
