import { MediaConfig } from "./storageClient/index.js";
import { MediaStorage } from "./storageClient/index.js";

export class Akssora {
  private mediaConfig: MediaConfig;
  private mediaStorage: MediaStorage;

  constructor(mediaStoragePath: string) {
    this.mediaConfig = new MediaConfig(mediaStoragePath);
    this.mediaStorage = new MediaStorage();
  }

  async pushMedia(mediaPath: string): Promise<void> {
    try {
      this.mediaStorage.saveOnDisk(mediaPath, this.mediaConfig);
    } catch {}
  }
}
