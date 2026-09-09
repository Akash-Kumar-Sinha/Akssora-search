import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { MP4, type Media } from "../type.js";
import type { MediaConfig } from "./mediaConfig.js";

interface DiskStorage {
  saveOnDisk(mediaPath: string, mediaConfig: MediaConfig): Promise<boolean>;
}
const execFileAsync = promisify(execFile);

export class MediaStorage implements DiskStorage {
  async saveOnDisk(
    mediaPath: string,
    mediaConfig: MediaConfig,
  ): Promise<boolean> {
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

      const directory = join(mediaConfig.storagePath, hash);
      const filePath = join(directory, hash);

      await mkdir(directory, {
        recursive: true,
      });

      await writeFile(filePath, media.data);

      await execFileAsync("rm", ["-f", tempPath]);

      return true;
    } catch {
      return false;
    }
  }
}
