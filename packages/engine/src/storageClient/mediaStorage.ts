import { createHash } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { MP4, type Media } from "../type.js";
import type { MediaConfig } from "./mediaConfig.js";

interface DiskStorage {
  saveOnDisk(mediaPath: string, mediaConfig: MediaConfig): Promise<boolean>;
}

export class MediaStorage implements DiskStorage {
  async saveOnDisk(
    mediaPath: string,
    mediaConfig: MediaConfig,
  ): Promise<boolean> {
    try {
      const data = await readFile(mediaPath);

      const media: Media = {
        data,
        mimeType: MP4,
      };

      const mediaId = `${crypto.randomUUID()}-${Date.now()}`;
      const hash = createHash("sha256", { outputLength: 32 })
        .update(mediaId)
        .digest("hex");

      const directory = join(mediaConfig.storagePath, hash);
      const filePath = join(directory, hash);

      await mkdir(directory, {
        recursive: true,
      });

      await writeFile(filePath, media.data);

      return true;
    } catch {
      return false;
    }
  }
}
