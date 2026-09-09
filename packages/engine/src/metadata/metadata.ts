import { execFileAsync } from "../util/execFileAsync.js";

export class MetaData {
  async extractMetadata(filePath: string): Promise<JSON> {
    const data = await execFileAsync("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);

    const metadata = JSON.parse(data.stdout);
    return {
      savedDate: new Date().toISOString().split("T")[0],
      ...metadata,
    };
  }
}
