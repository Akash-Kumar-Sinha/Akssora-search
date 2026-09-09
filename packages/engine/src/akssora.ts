import { MediaProcessor } from "./mediaProcessor/mediaProcessor.js";
import { MediaConfig } from "./storageClient/index.js";
import type { ProcessedMedia, VectorEmbedding } from "./embeddings/index.js";

export class Akssora {
  private config: MediaConfig;
  private mediaProcessor: MediaProcessor;

  constructor(mediaStoragePath: string) {
    this.config = new MediaConfig(mediaStoragePath);
    this.mediaProcessor = new MediaProcessor(this.config);
  }

  async processMedia(mediaPath: string): Promise<ProcessedMedia> {
    try {
      return this.mediaProcessor.processMedia(mediaPath);
    } catch {
      return Promise.reject(new Error("Failed to push media"));
    }
  }
}
