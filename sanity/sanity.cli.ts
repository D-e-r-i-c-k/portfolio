import path from "path";
import { fileURLToPath } from "url";
import { config as loadEnv } from "dotenv";
import { defineCliConfig } from "sanity/cli";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "..", ".env.local") });
loadEnv({ path: path.resolve(__dirname, ".env") });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  server: {
    hostname: "localhost",
    port: 3333,
  },
});
