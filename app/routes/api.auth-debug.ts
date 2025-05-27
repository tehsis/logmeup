import type { Route } from "./+types/api.auth-debug";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const origin = url.origin;

  const debugInfo = {
    environment: {
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ? 'SET' : 'MISSING',
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? 'SET' : 'MISSING',
      AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE ? 'SET' : 'MISSING',
    },
    values: {
      domain: process.env.AUTH0_DOMAIN || 'NOT_SET',
      clientId: process.env.AUTH0_CLIENT_ID ? `${process.env.AUTH0_CLIENT_ID.substring(0, 8)}...` : 'NOT_SET',
      audience: process.env.AUTH0_AUDIENCE || 'NOT_SET',
      redirect_uri: `${origin}/callback`,
      origin: origin,
    },
    expectedFormat: {
      domain: 'your-tenant.auth0.com',
      clientId: 'starts with letters/numbers',
      audience: 'https://api.logmeup.com or similar',
      redirect_uri: `${origin}/callback`,
    }
  };

  return Response.json(debugInfo, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 