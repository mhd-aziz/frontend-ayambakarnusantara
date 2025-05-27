// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target:
        "https://backend-ayambakarnusantara-1013559069503.asia-southeast1.run.app",
      changeOrigin: true,
      pathRewrite: (path, req) => {
        const newPath = path.replace(/^\/api/, "");
        console.log(
          `[Proxy] Rewriting path from: ${path} to: ${newPath} for host: ${req.hostname}`
        );
        return newPath;
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(
          `[Proxy] Making request to: ${proxyReq.getHeader("host")}${
            proxyReq.path
          }`
        );
      },
      onError: (err, req, res) => {
        console.error("[Proxy] Error:", err);
        // Pastikan untuk mengirim respons error agar tidak hang
        if (res && !res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Proxy error: " + err.message);
        }
      },
    })
  );
};
