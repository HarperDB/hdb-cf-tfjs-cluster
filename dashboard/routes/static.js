import fastifyStatic from "fastify-static";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (server) => {
  server.register(fastifyStatic, {
    root: join(__dirname, "../ui/dist"),
    prefix: "/ui/",
    decorateReply: false,
  });
};
