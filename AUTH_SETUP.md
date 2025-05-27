# Auth0 Authentication Setup Guide

This guide will help you set up Auth0 authentication for LogMeUp following the PRD specifications.

## Prerequisites

- Auth0 account (free tier is sufficient)
- Node.js and npm installed

## Auth0 Configuration

### 1. Create Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Go to **Applications** > **Create Application**
3. Choose **Single Page Application** and click **Create**
4. Note down your **Domain** and **Client ID**

### 2. Configure Application Settings

In your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:5173, https://your-production-domain.com
```

**Allowed Logout URLs:**
```
http://localhost:5173, https://your-production-domain.com
```

**Allowed Web Origins:**
```
http://localhost:5173, https://your-production-domain.com
```

### 3. Configure Identity Providers

#### Google OAuth2
1. Go to **Authentication** > **Social** in Auth0 Dashboard
2. Click on **Google** and enable it
3. Configure with your Google OAuth credentials

#### GitHub
1. Go to **Authentication** > **Social** in Auth0 Dashboard
2. Click on **GitHub** and enable it
3. Configure with your GitHub OAuth app credentials

### 4. Create API (Optional but Recommended)

1. Go to **Applications** > **APIs** > **Create API**
2. Set an identifier (e.g., `https://api.logmeup.com`)
3. Choose **RS256** algorithm
4. Note down the **API Identifier** for the audience

## Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Fill in your Auth0 credentials:
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=https://api.logmeup.com  # Optional: Your API identifier
```

**Important:** These environment variables are now server-side only and are not exposed to the browser. The configuration is securely fetched from the server at runtime.

## Architecture

The new authentication system uses a server-side configuration approach:

1. **Server-side Config**: Auth0 credentials are stored as server environment variables
2. **API Endpoint**: `/api/auth-config` provides configuration to the client
3. **Dynamic Loading**: Configuration is fetched at runtime, not build time
4. **Security**: Sensitive data never reaches the browser bundle

## Backend JWT Validation (for API)

If you're using the LogMeUp API, ensure it validates JWT tokens:

1. Use Auth0's public keys for RS256 verification
2. Validate the `aud` (audience) claim matches your API identifier
3. Validate the `iss` (issuer) claim matches your Auth0 domain

Example validation endpoint: `https://your-domain.auth0.com/.well-known/jwks.json`

## Testing Authentication

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:5173`
3. You should see a loading screen while configuration loads
4. Then you'll see the landing page with login options
5. Click "Get started for free" or "Sign in"
6. Choose Google or GitHub to authenticate
7. After successful login, you'll be redirected to the dashboard

## Features Implemented

✅ Auth0 React SDK integration  
✅ Google and GitHub OAuth providers  
✅ Protected routes with automatic redirects  
✅ Session management with token refresh  
✅ Logout functionality  
✅ User profile display  
✅ Token-based API authentication utilities  
✅ Landing page for unauthenticated users  
✅ Dashboard for authenticated users  
✅ **Server-side configuration loading**  
✅ **Secure environment variable handling**  

## Security Features

- **Server-side configuration** - Auth0 credentials never exposed to browser
- **Memory-based token storage** for enhanced security
- **Automatic token refresh** using `getAccessTokenSilently()`
- **Protected routes** that require authentication
- **Secure logout** with Auth0 logout endpoint
- **JWT validation** ready for backend APIs
- **Runtime configuration loading** with error handling

## Troubleshooting

### Common Issues

1. **"Invalid state" error**: Check that your callback URLs are correctly configured in Auth0
2. **CORS errors**: Ensure your domain is added to Allowed Web Origins
3. **Token validation fails**: Verify your API audience configuration
4. **Social login not working**: Check that Google/GitHub apps are properly configured in Auth0
5. **Configuration loading fails**: Check server environment variables and restart the server
6. **"Configuration Error" screen**: Verify AUTH0_DOMAIN and AUTH0_CLIENT_ID are set correctly

### Debug Mode

Set `AUTH0_DEBUG=true` in your server environment to enable Auth0 debug logging.

### Configuration Loading

If you see the "Loading authentication..." screen for too long:
1. Check browser network tab for `/api/auth-config` request
2. Verify server environment variables are set
3. Check server logs for configuration errors

## Next Steps

- Configure additional identity providers as needed
- Implement MFA (Multi-Factor Authentication) if required
- Set up user roles and permissions
- Configure Auth0 Rules or Actions for custom logic
- Implement account management features 