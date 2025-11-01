export class ConcurrencyLimiter {
  private readonly maxConcurrent: number;
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    if (maxConcurrent < 1) {
      throw new Error("maxConcurrent must be at least 1");
    }
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Run an async operation with concurrency limiting.
   * If the limit is reached, the operation will be queued until a slot becomes available.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireSlot();

    try {
      return await fn();
    } finally {
      this.releaseSlot();
    }
  }

  private async acquireSlot(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.running++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }

  getRunningCount(): number {
    return this.running;
  }

  getQueuedCount(): number {
    return this.queue.length;
  }
}
