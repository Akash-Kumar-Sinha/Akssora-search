import { Worker } from "node:worker_threads";

import type { MediaConfig } from "../storageClient/index.js";

export type WorkerJob =
  | {
      type: "metadata";
      path: string;
      mediaId: string;
      config: MediaConfig;
    }
  | {
      type: "video";
      path: string;
      mediaId: string;
      config: MediaConfig;
    }
  | {
      type: "audio";
      path: string;
      mediaId: string;
      config: MediaConfig;
    };

type WorkerResponse<T> =
  | {
      success: true;
      result: T;
    }
  | {
      success: false;
      error: string;
    };

export class WorkerManager {
  private readonly workerPath: URL;

  constructor() {
    this.workerPath = new URL(
      "./worker.js",
      import.meta.url,
    );
  }

  run<T>(job: WorkerJob): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        this.workerPath,
        {
          workerData: job,
        },
      );

      let settled = false;

      const cleanup = () => {
        worker.removeAllListeners();
      };

      worker.on(
        "message",
        (message: WorkerResponse<T>) => {
          if (settled) {
            return;
          }

          settled = true;
          cleanup();

          if (message.success) {
            resolve(message.result);
          } else {
            reject(
              new Error(message.error),
            );
          }

          void worker.terminate();
        },
      );

      worker.on("error", (error) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();

        reject(error);
      });

      worker.on("exit", (code) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();

        if (code !== 0) {
          reject(
            new Error(
              `Worker stopped with exit code ${code}`,
            ),
          );
        }
      });
    });
  }
}