import express from "express";
import fetch from "node-fetch";
import https from "https";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.all("*", async (req, res) => {
  const path = req.path;
  const base =
    path.includes("live") || req.headers["x-ctrader-env"] === "live"
      ? "https://live.ctraderapi.com"
      : "https://demo.ctraderapi.com";

  const target = `${base}${path}`;
  console.log("[Proxy] →", target);

  const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers,
body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
      agent,
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error("[Proxy ERROR]", err.message);
    res.status(500).json({ error: "Proxy fetch failed", details: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ cTrader Relay en ligne sur le port ${PORT}`)
);
