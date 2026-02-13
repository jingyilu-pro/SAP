import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 5173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  const safePath = path.normalize(urlPath).replace(/^([.][.][/\\])+/, "");
  let target = path.join(__dirname, safePath === "/" ? "index.html" : safePath);

  if (!target.startsWith(__dirname)) {
    res.statusCode = 400;
    res.end("Bad request");
    return;
  }

  fs.stat(target, (err, stats) => {
    if (!err && stats.isDirectory()) {
      target = path.join(target, "index.html");
    }
    serveFile(res, target);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
