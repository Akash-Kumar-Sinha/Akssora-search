import { Embeddings } from "../embeddings/embeddings.js";
import { MediaConfig, MediaStorage } from "../storageClient/index.js";
import type { VectorEmbedding } from "../embeddings/type.js";
import { MetaData } from "../metadata/index.js";

export class MediaProcessor {
  private metadata: MetaData;
  private embeddings: Embeddings;
  private mediaStorage: MediaStorage;

  constructor(config: MediaConfig) {
    this.metadata = new MetaData();
    this.embeddings = new Embeddings(config);
    this.mediaStorage = new MediaStorage(config);
  }

  async processMedia(mediaPath: string): Promise<[JSON, VectorEmbedding[]]> {
    const [path, mediaId] = await this.mediaStorage.saveOnDisk(mediaPath);

    // METADATA
    const data = await this.metadata.extractMetadata(path);
    const metadata = {
      metaId: mediaId,
      ...data,
    };

    // EMBEDDINGS
    const embeddings = await this.embeddings.generateEmbeddings(path, mediaId);
    // Audo extract()

    return [metadata, embeddings];
  }
}
