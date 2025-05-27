import type { Route } from "./+types/api.auth-config";

export async function loader({ request }: Route.LoaderArgs) {
  // Get the origin from the request for dynamic redirect_uri
  const url = new URL(request.url);
  const origin = url.origin;

  // Server-side environment variables (not exposed to client)
  const authConfig = {
    domain: process.env.AUTH0_DOMAIN || '',
    clientId: process.env.AUTH0_CLIENT_ID || '',
    authorizationParams: {
      redirect_uri: `${origin}/callback`,
      audience: process.env.AUTH0_AUDIENCE || '',
      scope: 'openid profile email',
    },
    cacheLocation: 'memory' as const,
    useRefreshTokens: true,
  };

  // Validate required configuration
  if (!authConfig.domain || !authConfig.clientId) {
    throw new Response('Auth0 configuration is incomplete', { status: 500 });
  }

  return Response.json(authConfig);
} 