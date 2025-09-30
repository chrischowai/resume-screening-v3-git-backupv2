import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SignJWT } from "https://deno.land/x/jose@v5.9.6/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async () => {
  try {
    // 解密 SA Key → 同上 ...
    const b64 = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY_BASE64")!;
    let jsonStr = atob(b64).trim();
    if (jsonStr.charCodeAt(0) === 0xFEFF) jsonStr = jsonStr.slice(1);
    const sa = JSON.parse(jsonStr);
    const pem = sa.private_key.replace(/\\n/g, "\n");
    const body = pem
      .replace("-----BEGIN PRIVATE KEY-----\n", "")
      .replace("\n-----END PRIVATE KEY-----", "");
    const der = Uint8Array.from(atob(body), c => c.charCodeAt(0)).buffer;
    const privateKey = await crypto.subtle.importKey(
      "pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false, ["sign"]
    );

    // 取得 access_token
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: sa.token_uri,
      exp: now + 3600,
      iat: now,
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .sign(privateKey);

    const tokenResp = await fetch(sa.token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    const accessToken = (await tokenResp.json()).access_token;

    // 讀取整張 Sheet
    const sheetId = "1nK6qns3GmM8ESHq-57FIbbCi8B59btU0j_iT0cGRFjs";
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/DashboardData`;
    const resp = await fetch(sheetUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Failed to fetch sheet" }), { status: 500, headers: corsHeaders });
  }
});
