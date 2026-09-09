import {
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";
import type { MediaConfig } from "../storageClient/index.js";
import { readFile } from "node:fs/promises";

export class WhisperClient {
  private transcriber: AutomaticSpeechRecognitionPipeline | null = null;

  private readonly config: MediaConfig;

  constructor(config: MediaConfig) {
    this.config = config;
  }

  private async getTranscriber() {
    if (this.transcriber) {
      return this.transcriber;
    }

    this.transcriber = await pipeline(
      "automatic-speech-recognition",
      this.config.whisperModelName,
    );

    return this.transcriber;
  }

  async transcribe(audioPath: string): Promise<string> {
    const transcriber = await this.getTranscriber();

    const buffer = await readFile(audioPath);

    // WAV header is normally 44 bytes.
    const pcm = new Int16Array(
      buffer.buffer,
      buffer.byteOffset + 44,
      (buffer.length - 44) / 2,
    );

    const audio = Float32Array.from(pcm, (sample) => sample / 32768);

    // CRITICAL: Only supports English language
    const result = await transcriber(audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: "en",
      return_timestamps: true,
    });

    return result.text;
  }
}
