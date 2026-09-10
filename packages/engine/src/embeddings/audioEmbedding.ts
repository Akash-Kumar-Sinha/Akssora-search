import {
  AutoProcessor,
  ClapAudioModelWithProjection,
} from "@huggingface/transformers";
import { readFile } from "node:fs/promises";

import type { AudioEmbeddings } from "./type.js";
import type { MediaConfig } from "../storageClient/index.js";
import { Audio } from "../mediaProcessor/index.js";
import { WhisperClient } from "./whisper.js";
import { TextEmbeddingClient } from "./textEmbedding.js";

export class AudioEmbeddingClient {
  readonly config: MediaConfig;
  private readonly audio: Audio;
  private extractor: ClapAudioModelWithProjection | null = null;
  private processor: any = null;
  private readonly whisperClient: WhisperClient;
  private readonly textEmbeddingClient: TextEmbeddingClient;

  constructor(config: MediaConfig) {
    this.config = config;
    this.audio = new Audio();
    this.whisperClient = new WhisperClient(config);
    this.textEmbeddingClient = new TextEmbeddingClient(config);
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

  async generateEmbedding(audioPath: string): Promise<number[]> {
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

  async generateAudioEmbeddings(
    mediaPath: string,
    metaID: string,
  ): Promise<AudioEmbeddings> {
    const audioPath = await this.audio.extractAudio(mediaPath, metaID);

    const transcript = await this.whisperClient.transcribe(audioPath);

    // CONCURRENTLY: Generate text embedding and audio embedding to optimize performance
    const [textEmbedding, audioEmbeddings] = await Promise.all([
      this.textEmbeddingClient.generateTextEmbedding(transcript),
      this.generateEmbedding(audioPath),
    ]);

    return {
      text: {
        vector: textEmbedding,
        timestamp: 0,
      },
      audio: {
        vector: audioEmbeddings,
        timestamp: 0,
      },
      transcript,
    };
  }
}
