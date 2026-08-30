function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}


/* =========================
   HMAC SHA-256
========================= */

async function sign(value, secret) {

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(signature)
    )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


/* =========================
   CREATE TOKEN
========================= */

async function createToken(secret) {

  const payload = {
    exp:
      Date.now() +
      24 * 60 * 60 * 1000
  };

  const payloadString = btoa(
    JSON.stringify(payload)
  );

  const signature = await sign(
    payloadString,
    secret
  );

  return (
    payloadString +
    "." +
    signature
  );
}


/* =========================
   POST /api/admin/login
========================= */

export async function onRequestPost({
  request,
  env
}) {

  /* -------------------------
     CHECK CONFIG
  ------------------------- */

  if (!env.ADMIN_PASSWORD) {

    return json(
      {
        error:
          "ADMIN_PASSWORD chưa được cấu hình trên Cloudflare."
      },
      500
    );

  }


  if (!env.ADMIN_SECRET) {

    return json(
      {
        error:
          "ADMIN_SECRET chưa được cấu hình trên Cloudflare."
      },
      500
    );

  }


  /* -------------------------
     READ BODY
  ------------------------- */

  let body;

  try {

    body = await request.json();

  } catch {

    return json(
      {
        error:
          "Dữ liệu đăng nhập không hợp lệ."
      },
      400
    );

  }


  /* -------------------------
     READ PASSWORD
  ------------------------- */

  const password =
    typeof body?.password === "string"
      ? body.password
      : "";


  if (!password) {

    return json(
      {
        error:
          "Vui lòng nhập mật khẩu."
      },
      400
    );

  }


  /* -------------------------
     CHECK PASSWORD
  ------------------------- */

  if (
    password !==
    env.ADMIN_PASSWORD
  ) {

    return json(
      {
        error:
          "Mật khẩu không chính xác."
      },
      401
    );

  }


  /* -------------------------
     CREATE TOKEN
  ------------------------- */

  const token =
    await createToken(
      env.ADMIN_SECRET
    );


  /* -------------------------
     SUCCESS
  ------------------------- */

  return json(
    {
      success: true,
      token
    },
    200
  );

}
