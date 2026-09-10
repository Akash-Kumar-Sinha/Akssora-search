import { writeFile } from "node:fs/promises";

import { Akssora } from "@akssora/search-engine";

const akssora = new Akssora("../../storage");

const metadata = await akssora.processMedia("../../videos/vegeta.mp4");

await writeFile(
  "temp/metadata.json",
  JSON.stringify(metadata, null, 2),
  "utf-8",
);
