import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";
import type { MediaConfig } from "../storageClient/mediaConfig.js";

export class TextEmbeddingClient {
  private extractor: FeatureExtractionPipeline | null = null;
  private readonly config: MediaConfig;

  constructor(config: MediaConfig) {
    this.config = config;
  }

  private async getExtractor(): Promise<FeatureExtractionPipeline> {
    if (this.extractor) {
      return this.extractor;
    }

    this.extractor = await pipeline(
      "feature-extraction",
      this.config.transcriptModelName,
    );

    return this.extractor;
  }

  async generateTextEmbedding(transcript: string): Promise<number[]> {
    const extractor = await this.getExtractor();

    const output = await extractor(transcript, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  }
}
