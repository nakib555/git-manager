export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    const path = url.pathname.replace(/\/$/, '');
    
    if (path === '/api/auth/url') {
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        return new Response(JSON.stringify({ 
          error: "GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing. Please add them as Secrets in your Cloudflare Workers dashboard." 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // We use the request's origin to determine redirect URI
      const redirectUri = `${url.protocol}//${url.host}/auth/callback`;
      
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'repo read:user user:email',
      });

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path === '/auth/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        const fallbackHtml = `
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
        `;
        return new Response(fallbackHtml, { status: 400, headers: { 'Content-Type': 'text/html' } });
      }

      try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code
          })
        });

        const tokenData: any = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
          throw new Error("Failed to get access token");
        }

        const html = `
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. This window should close automatically.</p>
            </body>
          </html>
        `;
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('OAuth error:', error);
        return new Response("Authentication failed", { status: 500 });
      }
    }

    // Serve static assets for all other requests
    // (Requires wrangler.toml to have [assets] section)
    return env.ASSETS.fetch(request);
  }
};
