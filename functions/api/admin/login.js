function json(data, status = 200) {

  return new Response(

    JSON.stringify(data),

    {

      status,

      headers: {
        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store"

      }

    }

  );

}


/* =========================
   CREATE HMAC
========================= */

async function sign(
  value,
  secret
) {

  const key =
    await crypto.subtle.importKey(

      "raw",

      new TextEncoder()
        .encode(secret),

      {
        name: "HMAC",
        hash: "SHA-256"
      },

      false,

      ["sign"]

    );


  const signature =
    await crypto.subtle.sign(

      "HMAC",

      key,

      new TextEncoder()
        .encode(value)

    );


  return btoa(

    String.fromCharCode(
      ...new Uint8Array(
        signature
      )
    )

  )

    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

}


/* =========================
   CREATE TOKEN
========================= */

async function createToken(
  secret
) {

  const payload = {

    exp:
      Date.now()
      +
      24 * 60 * 60 * 1000

  };


  const payloadString =
    btoa(
      JSON.stringify(
        payload
      )
    );


  const signature =
    await sign(
      payloadString,
      secret
    );


  return (
    payloadString
    +
    "."
    +
    signature
  );

}


/* =========================
   POST LOGIN
========================= */

export async function onRequestPost({
  request,
  env
}) {

  if (!env.ADMIN_PASSWORD) {

    return json({

      error:
        "ADMIN_PASSWORD chưa được cấu hình."

    }, 500);

  }


  if (!env.ADMIN_SECRET) {

    return json({

      error:
        "ADMIN_SECRET chưa được cấu hình."

    }, 500);

  }


  const body =
    await request
      .json()
      .catch(
        () => ({})
      );


  console.log("PASSWORD LENGTH:", body.password?.length);
console.log("ENV PASSWORD LENGTH:", env.ADMIN_PASSWORD?.length);

if (
  body.password
  !==
  env.ADMIN_PASSWORD
) {

    return json({

      error:
        "Sai mật khẩu."

    }, 401);

  }


  const token =
    await createToken(
      env.ADMIN_SECRET
    );


  return json({

    token

  });

}
