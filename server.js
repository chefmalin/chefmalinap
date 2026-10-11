const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const mimeTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".ico": "image/x-icon" };

http.createServer((request, response) => {
  const relativePath = request.url === "/" ? "index.html" : decodeURIComponent(request.url).replace(/^[/\\]+/, "");
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root)) { response.writeHead(403); response.end("Accès refusé"); return; }
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(error.code === "ENOENT" ? 404 : 500); response.end("Introuvable"); return; }
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  });
}).listen(4173, () => console.log("ChefMalin ouvert sur http://localhost:4173"));

