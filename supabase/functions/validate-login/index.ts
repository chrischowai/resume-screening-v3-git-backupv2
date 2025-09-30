import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SignJWT } from "https://deno.land/x/jose@v5.9.6/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. 解析請求 body
    const { loginName, password } = await req.json();

    // 2. 讀 env 取 Base64 字串
    const keyB64 = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY_BASE64");
    if (!keyB64) {
      console.error("Missing env: GOOGLE_SERVICE_ACCOUNT_KEY_BASE64");
      return new Response(
        JSON.stringify({ error: "Service Account configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Base64 → 字串，移除 BOM 並 trim
    let jsonStr = atob(keyB64).trim();
    if (jsonStr.charCodeAt(0) === 0xFEFF) {
      jsonStr = jsonStr.slice(1);
    }

    let sa: any;
    try {
      sa = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Invalid Service Account JSON:", e, jsonStr.slice(0,50));
      return new Response(
        JSON.stringify({ error: "Invalid Service Account key format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. PEM → DER，importKey
    const pem = sa.private_key.replace(/\\n/g, "\n");
    const pemBody = pem
      .replace("-----BEGIN PRIVATE KEY-----\n", "")
      .replace("\n-----END PRIVATE KEY-----", "");
    const der = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0)).buffer;

    let accessToken: string;
    try {
      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        der,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );

      // 5. 建 JWT 並換取 access_token
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

      if (!tokenResp.ok) {
        const txt = await tokenResp.text();
        console.error("Token request failed:", tokenResp.status, txt);
        throw new Error("Token exchange failed");
      }

      accessToken = (await tokenResp.json()).access_token;
    } catch (e) {
      console.error("Auth error:", e);
      return new Response(
        JSON.stringify({ error: "Service Account auth failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. 呼叫 Sheets API
    const sheetId = "1Mmtpb52khJDiWMOBZe556R_1EGq8x0LYXFP12BBcZYk";
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1`;
    const resp = await fetch(sheetUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Sheets API error:", resp.status, txt);
      return new Response(
        JSON.stringify({
          error: resp.status === 403
            ? "Access denied. Confirm SA has sheet access & API enabled."
            : "Failed to fetch sheet data",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    if (!data.values || data.values.length < 2) {
      return new Response(
        JSON.stringify({ valid: false, message: "No credentials data found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. 驗證使用者
    const hdrs = data.values[0].map((h: string) => h.toLowerCase().trim());
    const lnIdx = hdrs.indexOf("login name");
    const pwIdx = hdrs.indexOf("password");
    if (lnIdx < 0 || pwIdx < 0) {
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid sheet format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (let i = 1; i < data.values.length; i++) {
      const row = data.values[i];
      if (
        row[lnIdx]?.trim() === loginName &&
        row[pwIdx]?.trim() === password
      ) {
        return new Response(
          JSON.stringify({ valid: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ valid: false, message: "Wrong Login Name or Password." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
