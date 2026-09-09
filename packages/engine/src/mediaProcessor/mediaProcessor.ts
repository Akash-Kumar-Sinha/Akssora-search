import { VideoEmbeddingsClient } from "../embeddings/videoEmbeddings.js";
import { MediaConfig, MediaStorage } from "../storageClient/index.js";
import type { ProcessedMedia } from "../embeddings/type.js";
import { MetaData } from "../metadata/index.js";

export class MediaProcessor {
  private metadata: MetaData;
  private mediaStorage: MediaStorage;
  private videoEmbeddingClient: VideoEmbeddingsClient;

  constructor(config: MediaConfig) {
    this.metadata = new MetaData();
    this.videoEmbeddingClient = new VideoEmbeddingsClient(config);
    this.mediaStorage = new MediaStorage(config);
  }

  async processMedia(mediaPath: string): Promise<ProcessedMedia> {
    const [path, mediaId] = await this.mediaStorage.saveOnDisk(mediaPath);

    // METADATA
    const data = await this.metadata.extractMetadata(path);
    const metadata = {
      metaId: mediaId,
      ...data,
    };

    const videoEmbeddings =
      await this.videoEmbeddingClient.generateVideoEmbeddings(path, mediaId);

    const audioEmbeddings =
      await this.videoEmbeddingClient.generateAudioEmbeddings(path, mediaId);

    console.log("audioEmbeddings.transcript: ", audioEmbeddings.transcript);

    return {
      metadata,
      videoEmbeddings,
      audioEmbeddings,
    };
  }
}
