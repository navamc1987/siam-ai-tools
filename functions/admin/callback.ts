/**
 * Cloudflare Pages Function: GitHub OAuth Callback Handler
 * Exchanges authorization code for access token and redirects back to CMS
 */

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return new Response("Missing authorization code", { status: 400 });
    }

    // Verify state parameter (basic CSRF protection)
    const cookies = request.headers.get("cookie") || "";
    const storedState = cookies
      .split(";")
      .find((c) => c.trim().startsWith("oauth_state="))
      ?.split("=")[1];

    if (state !== storedState) {
      return new Response("State mismatch - possible CSRF attack", { status: 403 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.DECAP_CMS_CLIENT_ID,
        client_secret: env.DECAP_CMS_CLIENT_SECRET,
        code: code,
        redirect_uri: `${new URL(request.url).origin}/admin/callback`,
      }),
    });

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (tokenData.error) {
      return new Response(`OAuth error: ${tokenData.error_description}`, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Redirect back to CMS with token
    const redirectUrl = new URL(url.origin);
    redirectUrl.pathname = "/admin/";
    redirectUrl.searchParams.set("access_token", accessToken || "");

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        "Set-Cookie": `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`, // Clear state cookie
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
