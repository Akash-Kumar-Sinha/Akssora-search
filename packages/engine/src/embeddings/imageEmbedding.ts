import {
  pipeline,
  type ImageFeatureExtractionPipeline,
} from "@huggingface/transformers";
import type { MediaConfig } from "../storageClient/mediaConfig.js";

export class ImageEmbeddingClient {
  private extractor: ImageFeatureExtractionPipeline | null = null;
  private readonly config: MediaConfig;

  constructor(config: MediaConfig) {
    this.config = config;
  }

  private async getExtractor(): Promise<ImageFeatureExtractionPipeline> {
    if (this.extractor) {
      return this.extractor;
    }

    this.extractor = await pipeline(
      "image-feature-extraction",
      this.config.modelName,
    );

    return this.extractor;
  }

  async generateEmbedding(imagePath: string): Promise<number[]> {
    const extractor = await this.getExtractor();

    const output = await extractor(imagePath);

    return Array.from(output.data);
  }
}
