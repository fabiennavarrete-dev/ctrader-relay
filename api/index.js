import https from 'https';

export default async function handler(req, res) {
  const target = req.url.replace('/api', 'https://demo.ctraderapi.com/api');
  console.log('[PROXY] Request →', target);

  const agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    timeout: 10000, // 10s
  });

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method === 'GET' ? undefined : req.body,
      agent,
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error('[PROXY ERROR]', err.message);
    res
      .status(500)
      .json({ error: 'Proxy fetch failed', details: err.message || err.toString() });
  }
}
