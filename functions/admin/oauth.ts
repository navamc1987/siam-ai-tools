/**
 * Cloudflare Pages Function: GitHub OAuth Login Initiator
 * Redirects user to GitHub for authentication
 */

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;

  // Get query parameters
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get("redirect_uri") || "/admin";

  // GitHub OAuth parameters
  const clientId = env.DECAP_CMS_CLIENT_ID;
  const scope = "repo,user";
  const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection

  // Store state in session/cookie for verification later
  const stateUrl = new URL("https://github.com/login/oauth/authorize");
  stateUrl.searchParams.set("client_id", clientId as string);
  // Ensure origin is strictly https://siamai.cloud for redirect_uri consistency
  const origin = new URL(request.url).origin.replace("http://", "https://");
  stateUrl.searchParams.set("redirect_uri", `${origin}/admin/callback`);
  stateUrl.searchParams.set("scope", scope);
  stateUrl.searchParams.set("state", state);

  // Store state in cookie
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: stateUrl.toString(),
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });

  return response;
};
