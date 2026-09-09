import { readFile } from "node:fs/promises";

import { Akssora } from "@akssora/search-engine";

const akssora = new Akssora("../../storage");

await akssora.pushMedia("../../videos/vegeta.mp4");
