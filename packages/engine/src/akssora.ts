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

  setVideoModelName(modelName: string): void {
    this.config.setVideoModelName(modelName);
  }

  setAudioModelName(modelName: string): void {
    this.config.setAudioModelName(modelName);
  }

  setWhisperModelName(modelName: string): void {
    this.config.setWhisperModelName(modelName);
  }

  setTranscriptModelName(modelName: string): void {
    this.config.setTranscriptModelName(modelName);
  }
}
