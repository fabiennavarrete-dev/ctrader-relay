export default async function handler(req, res) {
  const target = req.url.replace("/api", "https://demo.ctraderapi.com/api");
  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      body: req.method === "GET" ? undefined : req.body,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
}

