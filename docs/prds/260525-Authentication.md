# PRD: User Authentication – LogMeUp

## Overview

**Feature**: User Authentication  
**Status**: Draft  

## Objective

Allow users to securely authenticate via the **LogMeUp web application**, using Google and GitHub identity providers managed through **Auth0**, to access and synchronize their personal notes and action items.

## Background & Context

LogMeUp is a note-taking and productivity tool that identifies action items (TODOs) from daily logs. To ensure users can securely access their personal data across sessions and devices, authentication is required.

To simplify identity management and improve security, LogMeUp integrates **Auth0** for handling all authentication flows, initially supporting **Google** and **GitHub** as external IDPs.

## Goals

- Enable secure user authentication in the LogMeUp web app via Auth0.
- Support Google and GitHub login methods.
- Establish user identity and session for use across web app features.
- Make the system easily extensible to support more identity providers later.

## Out of Scope

- Multi-factor authentication (MFA)
- Enterprise or SSO support
- Account management (e.g., password reset, profile editing)

## Requirements

### Functional Requirements

1. **Auth0 Integration**
   - Use the [`@auth0/auth0-react`](https://www.npmjs.com/package/@auth0/auth0-react) SDK for authentication in the web frontend.
   - Leverage the **React context provider (`Auth0Provider`)** to manage authentication state.
   - Use **`useAuth0()` hook** to access login, logout, and user information within components.

2. **React Router v7 Compatibility**
   - Wrap the app in `Auth0Provider` and use `useNavigate` from React Router to handle redirects after login.
   - Protect routes using higher-order components or conditional rendering based on `isAuthenticated` from `useAuth0()`.

     Example:
     ```jsx
     const ProtectedRoute = ({ children }) => {
       const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
       const navigate = useNavigate();

       useEffect(() => {
         if (!isLoading && !isAuthenticated) {
           loginWithRedirect();
         }
       }, [isLoading, isAuthenticated]);

       return isAuthenticated ? children : null;
     };
     ```

3. **Identity Providers**
   - Enable login via **Google** and **GitHub** only.
   - Display these as options on the login page (via Auth0’s hosted UI or custom UI that calls `loginWithRedirect()`).

4. **Session Handling**
   - Maintain a secure session in the frontend (managed by the SDK).
   - Tokens are auto-refreshed silently using `getAccessTokenSilently()`.

5. **User Context Propagation**
   - Include access tokens in requests to backend APIs.
   - Backend must validate JWTs using Auth0’s public keys (RS256 algorithm).

6. **Logout Flow**
   - Implement logout using `logout()` from `useAuth0()` and redirect to the Auth0 logout endpoint.
   - Clear local session state on logout.

7. **Access Control**
   - Users must be authenticated to access any private user data (notes, actions).
   - Public routes (e.g., landing page, marketing) remain accessible without auth.

### Non-Functional Requirements

- **Security**: Ensure token security by avoiding localStorage when possible; use in-memory storage or `httpOnly` cookies if SSR is used later.
- **Performance**: Authentication should complete within 3–5 seconds in most cases.
- **Resilience**: Graceful error handling for failed logins, session expiration, or token issues.

## User Stories

- As a new user, I want to sign in with my Google or GitHub account so I can start using the app without creating a new password.
- As a returning user, I want my session to persist across browser refreshes so I don’t need to log in every time.
- As a developer, I want authentication integrated in a way that makes backend token validation easy and secure.

## Success Metrics

- >95% login success rate for first-time users.
- <2% session-related errors reported by users.
- >98% of users return with a valid session without re-login (within token lifetime).
- Median login flow completion time <5s.

## Future Considerations

- Add support for additional IDPs (e.g., Microsoft, Apple).
- CLI authentication (future release).
- MFA and/or device trust.
- User profile customization and account settings page.