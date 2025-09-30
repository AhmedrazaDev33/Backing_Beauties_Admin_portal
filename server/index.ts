// import "dotenv/config";
// import express, { type Request, Response, NextFunction } from "express";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // API request logging
// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }
//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }
//       log(logLine);
//     }
//   });

//   next();
// });

// (async () => {
//   const server = await registerRoutes(app);

//   // Global error handler
//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";
//     res.status(status).json({ message });
//     throw err;
//   });

//   // Development vs Production
//   if (app.get("env") === "development") {
//     // Run Vite dev server for hot reload
//     await setupVite(app, server);
//   } else {
//     // Serve built frontend from dist/public
//     serveStatic(app);
//   }

//   // Listen on all interfaces for VPS/cloud hosting
//   const port = parseInt(process.env.PORT || "5000", 10);
//   server.listen(port, "0.0.0.0", () => {
//     log(`✅ Server running on port ${port} (${app.get("env")})`);
//   });
// })();

import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url"; // <-- added
import { registerRoutes } from "./routes";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url); // <-- added
const __dirname = path.dirname(__filename); // <-- added

const isDev = process.env.NODE_ENV !== "production";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ------------------- API Logging Middleware -------------------
app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse)
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      console.log(logLine);
    }
  });

  next();
});

// ------------------- API Routes -------------------
(async () => {
  const server = await registerRoutes(app);

  // ------------------- Global Error Handler -------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // ------------------- Frontend Handling -------------------
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: path.resolve(__dirname, "../client"),
    });
    app.use(vite.middlewares);
  } else {
    const clientDist = path.resolve(__dirname, "../dist/public"); // works now
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(
      `✅ Server running on port ${port} (${
        isDev ? "development" : "production"
      })`
    );
  });
})();
