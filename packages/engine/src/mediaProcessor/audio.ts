import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileAsync } from "../util/execFileAsync.js";

export class Audio {
  async extractAudio(mediaPath: string, metaID: string): Promise<string> {
    const directory = join("temp", metaID, "audio");
    await mkdir(directory, { recursive: true });

    const audioPath = join(directory, "audio.wav");

    await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      mediaPath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",
      "-y",
      audioPath,
    ]);

    return audioPath;
  }
}
