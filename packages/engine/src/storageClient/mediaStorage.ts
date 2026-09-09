import { createHash } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { MP4, type Media } from "../type.js";
import type { MediaConfig } from "./mediaConfig.js";
import { execFileAsync } from "../util/execFileAsync.js";

interface DiskStorage {
  saveOnDisk(
    mediaPath: string,
    mediaConfig: MediaConfig,
  ): Promise<[string, string]>;
}

export class MediaStorage implements DiskStorage {
  public readonly config: MediaConfig;

  constructor(config: MediaConfig) {
    this.config = config;
  }

  async saveOnDisk(mediaPath: string): Promise<[string, string]> {
    try {
      const tempPath = `${mediaPath}.faststart.mp4`;
      await execFileAsync("ffmpeg", [
        "-i",
        mediaPath,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        "-y",
        tempPath,
      ]);
      const data = await readFile(tempPath);

      const media: Media = {
        data,
        mimeType: MP4,
      };

      const mediaId = `${crypto.randomUUID()}-${Date.now()}`;
      const hash = `${createHash("sha256", { outputLength: 32 })
        .update(mediaId)
        .digest("hex")}-${Date.now()}.mp4`;

      const directory = join(this.config.storagePath, hash);
      const filePath = join(directory, hash);

      await mkdir(directory, {
        recursive: true,
      });

      await writeFile(filePath, media.data);

      await execFileAsync("rm", ["-f", tempPath]);

      return [filePath, hash.split(".", 1)[0] as string];
    } catch {
      return Promise.reject(new Error("Failed to save media on disk"));
    }
  }
}
