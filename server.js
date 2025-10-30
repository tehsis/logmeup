import * as https from "https";

import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();

if (process.env.NODE_ENV == "production") {
  app.use(express.static("build/client"));
  app.use(
    createRequestHandler({
      build: await import("./build/server/index.js")
    }),
  );
} else {
  const viteDevServer = await import("vite").then(vite => 
    vite.createServer({
      server: { middlewareMode: true}
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(
    createRequestHandler({
      build: () => 
        viteDevServer.ssrLoadModule(
          "virtual:react-router/server-build",
        ),
    })
  )
}


if (process.env.NODE_ENV == "production") {
  https.createServer({
    key: process.env.TLS_KEY,
    cert: process.env.TLS_CERT
  }, app).listen(3000, () => {
    console.log("LogMeUp listening TLS in 3000");
  });
} else {
  app.listen(3000, () => {
    console.log("LogMeUp listening on port 3000");
  });
}
