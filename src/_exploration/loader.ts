import {queryToKey} from "../query-helpers";
import type {BaseLoader, MissingDataRequest, OnLoadedFn, BaseRequester} from "./loader-types";

const notYetLoaded = () => {
  throw new Error("Not yet loaded");
};

type DataRequestWithKey = {key: string; request: MissingDataRequest};

const augmentRequest = (req: MissingDataRequest): DataRequestWithKey => {
  const key = `${req.model}:${req.id}:${req.type === "field" ? req.field : `${req.relKey}:${queryToKey(req.query)}`}`;
  return {key, request: req};
};

export class BatchedLoader implements BaseLoader {
  private _currentBatch: Batch | null = null;
  onLoaded: OnLoadedFn = notYetLoaded;
  readonly requester: BaseRequester;
  private ongoingKeysToBatches: Map<string, Batch> = new Map();

  batchTimeoutMs: number;

  constructor(opts: {batchTimeoutMs: number; requester: BaseRequester}) {
    this.batchTimeoutMs = opts.batchTimeoutMs;
    this.requester = opts.requester;
  }

  setOnLoaded(onLoaded: OnLoadedFn) {
    this.onLoaded = onLoaded;
  }

  private getCurrentBatch() {
    if (!this._currentBatch) {
      this._currentBatch = new Batch(this, () => (this._currentBatch = null));
    }
    return this._currentBatch;
  }

  private getOngoingBatches(requests: DataRequestWithKey[]): {
    promises: Promise<void>[];
    remainingRequests: DataRequestWithKey[];
  } {
    const batches = new Set<Batch>();
    const remainingRequests: DataRequestWithKey[] = [];
    requests.forEach((req) => {
      const batch = this.ongoingKeysToBatches.get(req.key);
      if (batch) {
        batches.add(batch);
      } else {
        remainingRequests.push(req);
      }
    });

    return {promises: [...batches].map((batch) => batch.promise), remainingRequests};
  }

  async loadBatch(rawRequests: MissingDataRequest[]) {
    const requests = rawRequests.map(augmentRequest);
    const {promises, remainingRequests} = this.getOngoingBatches(requests);
    if (remainingRequests.length === 0) return Promise.all(promises);

    const batch = this.getCurrentBatch();
    batch.addRequests(remainingRequests);
    remainingRequests.forEach((req) => this.ongoingKeysToBatches.set(req.key, batch));
    promises.push(batch.promise);
    return Promise.all(promises);
  }

  onBatchCompleted(requests: DataRequestWithKey[]) {
    requests.forEach((req) => this.ongoingKeysToBatches.delete(req.key));
  }
}

class Batch {
  private requests: DataRequestWithKey[] = [];
  private onResolve: () => void = notYetLoaded;
  private onReject: (err: Error) => void = notYetLoaded;
  private timeoutId: NodeJS.Timeout | null = null;

  promise: Promise<void>;

  constructor(
    private loader: BatchedLoader,
    private onStarted: () => void
  ) {
    this.promise = new Promise((resolve, reject) => {
      this.onResolve = resolve;
      this.onReject = reject;
    });
  }

  addRequests(requests: DataRequestWithKey[]) {
    this.requests.push(...requests);
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.onStarted();
        this.loader.requester
          .request(this.requests.map((r) => r.request))
          .then(
            (results) => {
              results.forEach(({model, key, partialInstance}) => {
                this.loader.onLoaded(model, key, partialInstance);
              });
              this.onResolve();
            },
            (err) => {
              this.onReject(err);
            }
          )
          .finally(() => this.loader.onBatchCompleted(this.requests));
      }, this.loader.batchTimeoutMs);
    }
  }
}
