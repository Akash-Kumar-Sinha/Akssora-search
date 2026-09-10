import { parentPort, workerData } from "node:worker_threads";

import { VideoEmbeddingsClient } from "../embeddings/index.js";
import { AudioEmbeddingClient } from "../embeddings/index.js";
import { MetaData } from "../metadata/index.js";

import type { WorkerJob } from "./workerManager.js";

type WorkerResponse =
  | {
      success: true;
      result: unknown;
    }
  | {
      success: false;
      error: string;
    };

if (!parentPort) {
  throw new Error("worker.ts must be executed inside a Worker thread");
}

const job = workerData as WorkerJob;

async function run(job: WorkerJob): Promise<unknown> {
  switch (job.type) {
    case "metadata": {
      const metadata = new MetaData();

      return metadata.extractMetadata(job.path);
    }

    case "video": {
      const video = new VideoEmbeddingsClient(job.config);

      return video.generateVideoEmbeddings(job.path, job.mediaId);
    }

    case "audio": {
      const audio = new AudioEmbeddingClient(job.config);

      return audio.generateAudioEmbeddings(job.path, job.mediaId);
    }

    default:
      throw new Error("Unknown worker job type");
  }
}

run(job)
  .then((result) => {
    const response: WorkerResponse = {
      success: true,
      result,
    };

    parentPort!.postMessage(response);
  })
  .catch((error) => {
    const response: WorkerResponse = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };

    parentPort!.postMessage(response);
  });
