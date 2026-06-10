const https = require('https');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { messages } = req.body;
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: messages
    });

    const result = await new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(JSON.parse(data)));
      });
      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
