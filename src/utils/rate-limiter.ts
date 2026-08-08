// Rate Limiter for Aircall API
// Aircall has a rate limit of 60 requests per minute

interface QueuedRequest {
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

export class RateLimiter {
  private queue: QueuedRequest[] = [];
  private requestsThisMinute = 0;
  private windowStart = Date.now();
  private processing = false;

  constructor(
    private maxRequests: number = 60,
    private windowMs: number = 60000
  ) {}

  private resetWindowIfNeeded(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.requestsThisMinute = 0;
      this.windowStart = now;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      this.resetWindowIfNeeded();

      if (this.requestsThisMinute >= this.maxRequests) {
        // Wait until the window resets
        const waitTime = this.windowMs - (Date.now() - this.windowStart);
        await this.sleep(waitTime + 100); // Add 100ms buffer
        this.resetWindowIfNeeded();
      }

      const request = this.queue.shift();
      if (request) {
        this.requestsThisMinute++;
        try {
          const result = await request.execute();
          request.resolve(result);
        } catch (error) {
          request.reject(error as Error);
        }
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        execute: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.processQueue();
    });
  }

  // Get current rate limit status
  getStatus(): { requestsRemaining: number; windowResetMs: number } {
    this.resetWindowIfNeeded();
    return {
      requestsRemaining: this.maxRequests - this.requestsThisMinute,
      windowResetMs: this.windowMs - (Date.now() - this.windowStart),
    };
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Wrapper for rate-limited API calls
export async function rateLimitedRequest<T>(
  fn: () => Promise<T>
): Promise<T> {
  return rateLimiter.execute(fn);
}
