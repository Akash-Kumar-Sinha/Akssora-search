import { rm } from "node:fs/promises";
import { join } from "node:path";

import { VideoEmbeddingsClient } from "../embeddings/videoEmbeddings.js";
import { MediaConfig, MediaStorage } from "../storageClient/index.js";
import type { ProcessedMedia } from "../embeddings/type.js";
import { MetaData } from "../metadata/index.js";
import { AudioEmbeddingClient } from "../embeddings/index.js";
import { WorkerManager } from "../worker/workerManager.js";

export class MediaProcessor {
  private readonly config: MediaConfig;
  private readonly mediaStorage: MediaStorage;
  private readonly workerManager: WorkerManager;

  constructor(config: MediaConfig) {
    this.config = config;
    this.mediaStorage = new MediaStorage(config);
    this.workerManager = new WorkerManager();
  }

  async processMedia(mediaPath: string): Promise<ProcessedMedia> {
    const [path, mediaId] = await this.mediaStorage.saveOnDisk(mediaPath);

    const start = performance.now();

    try {
      const [data, videoEmbeddings, audioEmbeddings] = await Promise.all([
        this.workerManager.run<
          Awaited<ReturnType<MetaData["extractMetadata"]>>
        >({
          type: "metadata",
          path,
          mediaId,
          config: this.config,
        }),

        this.workerManager.run<
          Awaited<ReturnType<VideoEmbeddingsClient["generateVideoEmbeddings"]>>
        >({
          type: "video",
          path,
          mediaId,
          config: this.config,
        }),

        this.workerManager.run<
          Awaited<ReturnType<AudioEmbeddingClient["generateAudioEmbeddings"]>>
        >({
          type: "audio",
          path,
          mediaId,
          config: this.config,
        }),
      ]);

      const totalTime = performance.now() - start;

      const totalSeconds = totalTime / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      console.log(
        `Media Processing Timeline: ${minutes} minutes ${seconds.toFixed(1)} seconds`,
      );

      const metadata = {
        metaId: mediaId,
        ...data,
      };

      return {
        metadata,
        videoEmbeddings,
        audioEmbeddings,
      };
    } finally {
      await rm(join("temp", mediaId), {
        recursive: true,
        force: true,
      });
    }
  }
}
