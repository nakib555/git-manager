import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Set to hold SSE clients
const clients = new Set<express.Response>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing with a larger limit for GitHub webhook payloads
  app.use(express.json({ limit: '50mb' }));

  // SSE endpoint for real-time updates
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE

    // Tell the client we are connected
    res.write('event: connected\ndata: {}\n\n');

    clients.add(res);

    req.on('close', () => {
      clients.delete(res);
    });
  });

  // Webhook receiver endpoint
  app.post('/api/webhooks/github', (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`Received GitHub Webhook: ${event}`);

    // Broadcast the event to all connected SSE clients
    const message = JSON.stringify({ event, payload });
    for (const client of clients) {
      client.write(`event: github\ndata: ${message}\n\n`);
    }

    res.status(200).send('OK');
  });

  // Proxy GitHub repository download (zipball) to avoid browser CORS redirect blocks
  app.get('/api/github/download', async (req, res) => {
    const { owner, repo, ref = 'main', token } = req.query as { owner?: string; repo?: string; ref?: string; token?: string };
    if (!owner || !repo) {
      res.status(400).json({ error: "Missing owner or repo parameter" });
      return;
    }

    const authHeader = req.headers.authorization || (token ? `Bearer ${token}` : undefined);
    const targetUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${ref}`;

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'GitManager-App',
        'Accept': 'application/vnd.github.v3+json',
      };
      if (authHeader) {
        headers['Authorization'] = authHeader.startsWith('ghp_') || authHeader.startsWith('github_pat_') || authHeader.startsWith('gho_') || authHeader.startsWith('Bearer ') || authHeader.startsWith('token ')
          ? (authHeader.startsWith('Bearer ') || authHeader.startsWith('token ') ? authHeader : `Bearer ${authHeader}`)
          : `token ${authHeader}`;
      }

      const ghRes = await fetch(targetUrl, {
        headers,
        redirect: 'follow',
      });

      if (!ghRes.ok) {
        const errorText = await ghRes.text();
        res.status(ghRes.status).json({ error: `GitHub API error (${ghRes.status}): ${errorText}` });
        return;
      }

      res.setHeader('Content-Type', ghRes.headers.get('content-type') || 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${repo}-${ref}.zip"`);
      res.setHeader('Access-Control-Allow-Origin', '*');

      const arrayBuffer = await ghRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Proxy download error:', err);
      res.status(500).json({ error: err.message || 'Failed to download repository zip' });
    }
  });

  // OAuth endpoints
  app.get('/api/auth/url', (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      res.status(400).json({ 
        error: "GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing. Please configure them in your settings/environment." 
      });
      return;
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    // We use the client's origin or the request's origin to determine redirect URI
    const redirectUri = `${protocol}://${host}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'repo read:user user:email',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    if (!code) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Git Manager - OAuth Callback</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              h2 { margin-top: 0; color: #38bdf8; font-size: 20px; }
              p { color: #94a3b8; line-height: 1.5; font-size: 14px; margin-bottom: 24px; }
              a { display: inline-block; background: #0284c7; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; }
              a:hover { background: #0369a1; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>OAuth Authentication Callback</h2>
              <p>This endpoint receives authorization codes during GitHub OAuth login. To log in, please open the app and click <strong>Connect GitHub</strong>.</p>
              <a href="/">Open Git Manager App</a>
            </div>
          </body>
        </html>
      `);
      return;
    }

    try {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        })
      });

      const tokenData = await tokenResponse.json();
      console.log('GitHub Token Exchange Response:', tokenData);
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        console.error('GitHub token exchange failed. No access_token returned. Response:', tokenData);
        throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
      }

      res.send(`
        <html>
          <body>
            <script>
              localStorage.setItem('githubToken', '${accessToken}');
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. Redirecting...</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send("Authentication failed");
    }
  });

  // Proxy GitHub API requests to avoid CORS or exposing token unnecessarily if we wanted, 
  // but since we send token to client, client can use it. Wait, GitHub REST API supports CORS.
  // We can just let the client call GitHub API directly.

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
