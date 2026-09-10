import { rm } from "node:fs/promises";
import { join } from "node:path";

import { VideoEmbeddingsClient } from "../embeddings/videoEmbeddings.js";
import { MediaConfig, MediaStorage } from "../storageClient/index.js";
import type { ProcessedMedia } from "../embeddings/type.js";
import { MetaData } from "../metadata/index.js";
import { AudioEmbeddingClient } from "../embeddings/audioEmbedding.js";

export class MediaProcessor {
  private metadata: MetaData;
  private mediaStorage: MediaStorage;
  private videoEmbeddingClient: VideoEmbeddingsClient;
  private audioEmbeddingClient: AudioEmbeddingClient;

  constructor(config: MediaConfig) {
    this.metadata = new MetaData();
    this.videoEmbeddingClient = new VideoEmbeddingsClient(config);
    this.audioEmbeddingClient = new AudioEmbeddingClient(config);
    this.mediaStorage = new MediaStorage(config);
  }

  async processMedia(mediaPath: string): Promise<ProcessedMedia> {
    const [path, mediaId] = await this.mediaStorage.saveOnDisk(mediaPath);

    const start = performance.now();

    // CONCURRENTLY
    const [data, videoEmbeddings, audioEmbeddings] = await Promise.all([
      this.metadata.extractMetadata(path),

      this.videoEmbeddingClient.generateVideoEmbeddings(path, mediaId),

      this.audioEmbeddingClient.generateAudioEmbeddings(path, mediaId),
    ]);

    const totalTime = performance.now() - start;
    const totalMinutes = totalTime / 60_000;

    console.log(`
      Media Processing Timeline: ${totalMinutes.toFixed(2)} minutes
    `);

    await rm(join("temp", mediaId), {
      recursive: true,
      force: true,
    });
    const metadata = {
      metaId: mediaId,
      ...data,
    };
    return {
      metadata,
      videoEmbeddings,
      audioEmbeddings,
    };
  }
}
