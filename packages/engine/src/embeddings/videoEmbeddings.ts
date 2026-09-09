import { rm } from "node:fs/promises";
import { join } from "node:path";

import type { AudioEmbeddings, VectorEmbedding } from "./type.js";
import { ImageEmbeddingClient } from "./imageEmbedding.js";
import type { MediaConfig } from "../storageClient/index.js";
import { Audio, Frames } from "../mediaProcessor/index.js";
import { AudioEmbeddingClient } from "./index.js";
import { WhisperClient } from "./index.js";
import { TextEmbeddingClient } from "./textEmbedding.js";

export class VideoEmbeddingsClient {
  private readonly frames: Frames;
  private readonly audio: Audio;

  private readonly imageEmbeddingClient: ImageEmbeddingClient;
  private readonly audioEmbeddingClient: AudioEmbeddingClient;
  private readonly whisperClient: WhisperClient;
  private readonly textEmbeddingClient: TextEmbeddingClient;

  constructor(config: MediaConfig) {
    this.frames = new Frames();
    this.audio = new Audio();
    this.imageEmbeddingClient = new ImageEmbeddingClient(config);
    this.audioEmbeddingClient = new AudioEmbeddingClient(config);
    this.whisperClient = new WhisperClient(config);
    this.textEmbeddingClient = new TextEmbeddingClient(config);
  }

  async generateVideoEmbeddings(
    mediaPath: string,
    metaID: string,
  ): Promise<VectorEmbedding[]> {
    try {
      const frames = await this.frames.extractFrames(mediaPath, metaID);

      const embeddings: VectorEmbedding[] = [];

      for (const frame of frames) {
        const vector = await this.imageEmbeddingClient.generateImageEmbedding(
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

  async generateAudioEmbeddings(
    mediaPath: string,
    metaID: string,
  ): Promise<AudioEmbeddings> {
    const audioPath = await this.audio.extractAudio(mediaPath, metaID);

    const transcript = await this.whisperClient.transcribe(audioPath);

    const textEmbedding =
      await this.textEmbeddingClient.generateTextEmbedding(transcript);

    const audioEmbeddings =
      await this.audioEmbeddingClient.generateAudioEmbedding(audioPath);

    await rm(join("temp", metaID), {
      recursive: true,
      force: true,
    });

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
