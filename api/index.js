import https from "https";

export default async function handler(req, res) {
  const path = req.url.replace(/^\/api/, "");
  const base =
    path.includes("live") || req.headers["x-ctrader-env"] === "live"
      ? "https://live.ctraderapi.com"
      : "https://demo.ctraderapi.com";

  const target = `${base}${path}`;
  console.log("[PROXY] →", target);

  const agent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
  });

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      body: req.method === "GET" ? undefined : req.body,
      agent,
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error("[PROXY ERROR]", err.message);
    // === Fallback direct HTTPS ===
    const httpsRequest = https.request(
      target,
      {
        method: req.method,
        headers: req.headers,
        agent,
      },
      (r) => {
        let data = "";
        r.on("data", (chunk) => (data += chunk));
        r.on("end", () => {
          res.status(r.statusCode || 500).send(data);
        });
      }
    );

    httpsRequest.on("error", (e) => {
      console.error("[FALLBACK ERROR]", e.message);
      res
        .status(500)
        .json({ error: "Proxy connection failed", details: e.message });
    });

    if (req.method !== "GET" && req.body) httpsRequest.write(req.body);
    httpsRequest.end();
  }
}
