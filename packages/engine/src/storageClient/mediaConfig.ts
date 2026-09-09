export class MediaConfig {
  readonly storagePath: string;
  readonly videoModelName: string = "Xenova/clip-vit-base-patch32";
  readonly audioModelName: string = "Xenova/clap-htsat-unfused";
  readonly whisperModelName: string = "Xenova/whisper-base";
  readonly transcriptModelName: string = "Xenova/all-MiniLM-L6-v2";

  constructor(mediaStoragePath: string) {
    this.storagePath = mediaStoragePath;
  }
}
