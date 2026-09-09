export class MediaConfig {
  readonly storagePath: string;
  readonly modelName: string = "Xenova/clip-vit-base-patch32";
  
  constructor(mediaStoragePath: string) {
    this.storagePath = mediaStoragePath;
  }
}
