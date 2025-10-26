import type {BaseLoader, MissingDataRequest, OnLoadedFn, BaseRequester} from "./loader-types";

const notYetLoaded = () => {
  throw new Error("Not yet loaded");
};

export class BatchedLoader implements BaseLoader {
  private _batch: Batch | null = null;
  onLoaded: OnLoadedFn = notYetLoaded;
  readonly requester: BaseRequester;

  batchTimeoutMs: number;

  constructor(opts: {batchTimeoutMs: number; requester: BaseRequester}) {
    this.batchTimeoutMs = opts.batchTimeoutMs;
    this.requester = opts.requester;
  }

  setOnLoaded(onLoaded: OnLoadedFn) {
    this.onLoaded = onLoaded;
  }

  private getCurrentBatch() {
    if (!this._batch) {
      this._batch = new Batch(this, () => (this._batch = null));
    }
    return this._batch;
  }

  async loadBatch(requests: MissingDataRequest[]) {
    const batch = this.getCurrentBatch();
    batch.addRequests(requests);
    return batch.promise;
  }
}

class Batch {
  private requests: MissingDataRequest[] = [];
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

  addRequests(requests: MissingDataRequest[]) {
    this.requests.push(...requests);
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.onStarted();
        this.loader.requester.request(this.requests).then(
          (results) => {
            results.forEach(({model, key, partialInstance}) => {
              this.loader.onLoaded(model, key, partialInstance);
            });
            this.onResolve();
          },
          (err) => {
            this.onReject(err);
          }
        );
      }, this.loader.batchTimeoutMs);
    }
  }
}
