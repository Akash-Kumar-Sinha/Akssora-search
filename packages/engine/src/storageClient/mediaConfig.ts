export interface MediaConfigOptions {
  readonly storagePath: string;
  videoModelName?: string;
  audioModelName?: string;
  whisperModelName?: string;
  transcriptModelName?: string;
}

export class MediaConfig implements MediaConfigOptions {
  readonly storagePath: string;
  videoModelName: string = "Xenova/clip-vit-base-patch32";
  audioModelName: string = "Xenova/clap-htsat-unfused";
  whisperModelName: string = "Xenova/whisper-base";
  transcriptModelName: string = "Xenova/all-MiniLM-L6-v2";

  constructor(mediaStoragePath: string) {
    this.storagePath = mediaStoragePath;
  }

  setVideoModelName(modelName: string): void {
    this.videoModelName = modelName;
  }

  setAudioModelName(modelName: string): void {
    this.audioModelName = modelName;
  }

  setWhisperModelName(modelName: string): void {
    this.whisperModelName = modelName;
  }

  setTranscriptModelName(modelName: string): void {
    this.transcriptModelName = modelName;
  }
}
