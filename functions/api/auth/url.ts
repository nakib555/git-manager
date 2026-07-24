export async function onRequest(context: any) {
  const { env, request } = context;
  const url = new URL(request.url);
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
