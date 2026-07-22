const { createServer } = require("node:http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

if (Number.isNaN(port)) {
  console.error(`Invalid PORT value: ${process.env.PORT}`);
  process.exit(1);
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception during app runtime:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection during app runtime:", error);
  process.exit(1);
});

app
  .prepare()
  .then(() => {
    createServer((request, response) => {
      handle(request, response);
    }).listen(port, hostname, () => {
      console.log(`Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Next.js app:", error);
    process.exit(1);
  });
