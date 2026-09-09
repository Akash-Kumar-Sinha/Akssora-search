import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileAsync } from "../util/execFileAsync.js";
import type { FrameType } from "./index.js";

export class Frames {
  async extractFrames(mediaPath: string, metaID: string): Promise<FrameType[]> {
    const directory = join("temp", metaID, "frames");

    await mkdir(directory, { recursive: true });

    await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      mediaPath,
      "-vf",
      "fps=5",
      "-q:v",
      "2",
      "-y",
      join(directory, "frame_%04d.jpg"),
    ]);

    const files = (await readdir(directory))
      .filter((file) => file.endsWith(".jpg"))
      .sort();

    return files.map((file, index) => ({
      path: join(directory, file),
      timestamp: index,
    }));
  }
}
