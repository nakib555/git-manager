export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    if (url.pathname === '/api/auth/url') {
      // We use the request's origin to determine redirect URI
      const redirectUri = `${url.protocol}//${url.host}/auth/callback`;
      
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID || '',
        redirect_uri: redirectUri,
        scope: 'repo read:user user:email',
      });

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/auth/callback' || url.pathname === '/auth/callback/') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response("No code provided", { status: 400 });
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
