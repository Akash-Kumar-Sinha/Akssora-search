import { rm } from "node:fs/promises";
import { join } from "node:path";

import type { VectorEmbedding } from "./type.js";
import { ImageEmbeddingClient } from "./imageEmbedding.js";
import type { MediaConfig } from "../storageClient/index.js";
import { Frames } from "../mediaProcessor/index.js";

export class Embeddings {
  private readonly frames: Frames;

  private readonly imageEmbeddingClient: ImageEmbeddingClient;

  constructor(config: MediaConfig) {
    this.frames = new Frames();
    this.imageEmbeddingClient = new ImageEmbeddingClient(config);
  }

  async generateEmbeddings(
    mediaPath: string,
    metaID: string,
  ): Promise<VectorEmbedding[]> {
    try {
      const frames = await this.frames.extractFrames(mediaPath, metaID);

      const embeddings: VectorEmbedding[] = [];

      for (const frame of frames) {
        const vector = await this.imageEmbeddingClient.generateEmbedding(
          frame.path,
        );

        embeddings.push({
          vector,
          timestamp: frame.timestamp,
        });
      }
      await rm(join("temp", metaID), {
        recursive: true,
        force: true,
      });
      return embeddings;
    } catch (error) {
      console.error("Failed to generate embeddings:", error);
      return [];
    }
  }
}
