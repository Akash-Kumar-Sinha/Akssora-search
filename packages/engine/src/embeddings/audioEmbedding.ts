import {
  AutoProcessor,
  ClapAudioModelWithProjection,
} from "@huggingface/transformers";
import { readFile } from "node:fs/promises";
import type { MediaConfig } from "../storageClient/mediaConfig.js";

export class AudioEmbeddingClient {
  private readonly config: MediaConfig;
  private extractor: ClapAudioModelWithProjection | null = null;
  private processor: any = null;

  constructor(config: MediaConfig) {
    this.config = config;
  }

  private async getExtractor(): Promise<ClapAudioModelWithProjection> {
    if (this.extractor) {
      return this.extractor;
    }

    this.processor = await AutoProcessor.from_pretrained(
      this.config.audioModelName,
    );

    this.extractor = await ClapAudioModelWithProjection.from_pretrained(
      this.config.audioModelName,
    );

    return this.extractor;
  }

  async generateAudioEmbedding(audioPath: string): Promise<number[]> {
    const extractor = await this.getExtractor();

    const buffer = await readFile(audioPath);

    const pcm = new Int16Array(
      buffer.buffer,
      buffer.byteOffset + 44,
      (buffer.byteLength - 44) / 2,
    );

    const audio = Float32Array.from(pcm, (sample) => sample / 32768);

    const inputs = await this.processor(audio);

    const output = await extractor(inputs);

    return Array.from(output.audio_embeds.data);
  }
}
