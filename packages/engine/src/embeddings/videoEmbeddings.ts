import type { VectorEmbedding } from "./type.js";
import { ImageEmbeddingClient } from "./imageEmbedding.js";
import type { MediaConfig } from "../storageClient/index.js";
import { Frames } from "../mediaProcessor/index.js";

const BATCH_SIZE = 8;

export class VideoEmbeddingsClient {
  private readonly frames: Frames;

  private readonly imageEmbeddingClient: ImageEmbeddingClient;

  constructor(config: MediaConfig) {
    this.frames = new Frames();
    this.imageEmbeddingClient = new ImageEmbeddingClient(config);
  }

  async generateVideoEmbeddings(
    mediaPath: string,
    metaID: string,
  ): Promise<VectorEmbedding[]> {
    try {
      const frames = await this.frames.extractFrames(mediaPath, metaID);

      const embeddings: VectorEmbedding[] = [];

      // CONCURRENTLY process frames in batches to avoid overwhelming the embedding service
      // BATCH_SIZE is set to 8, but you can adjust it based on your system's capabilities and the embedding service's rate limits.
      for (let i = 0; i < frames.length; i += BATCH_SIZE) {
        const batch = frames.slice(i, i + BATCH_SIZE);

        const batchEmbeddings = await Promise.all(
          batch.map(async (frame) => {
            const vector =
              await this.imageEmbeddingClient.generateImageEmbedding(
                frame.path,
              );

            return {
              vector,
              timestamp: frame.timestamp,
            };
          }),
        );

        embeddings.push(...batchEmbeddings);
      }

      return embeddings;
    } catch (error) {
      console.error("Failed to generate embeddings:", error);
      return [];
    }
  }
}
