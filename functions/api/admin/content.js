function json(
  data,
  status = 200
) {

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
   SIGN
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
   VERIFY TOKEN
========================= */

async function verifyToken(
  token,
  secret
) {

  try {

    const parts =
      token.split(".");


    if (
      parts.length !== 2
    ) {

      return false;

    }


    const payload =
      parts[0];


    const signature =
      parts[1];


    const expected =
      await sign(
        payload,
        secret
      );


    if (
      signature !== expected
    ) {

      return false;

    }


    const decoded =
      JSON.parse(
        atob(payload)
      );


    return (
      decoded.exp
      >
      Date.now()
    );

  }

  catch (error) {

    return false;

  }

}


/* =========================
   AUTH
========================= */

async function authorized(
  request,
  env
) {

  const header =
    request.headers.get(
      "Authorization"
    );


  if (
    !header ||
    !header.startsWith(
      "Bearer "
    )
  ) {

    return false;

  }


  const token =
    header.substring(7);


  return verifyToken(
    token,
    env.ADMIN_SECRET
  );

}


/* =========================
   GET
========================= */

export async function onRequestGet({
  request,
  env
}) {

  if (
    !(await authorized(
      request,
      env
    ))
  ) {

    return json({

      error:
        "Unauthorized"

    }, 401);

  }


  const siteRow =
    await env.DB
      .prepare(
        "SELECT value FROM settings WHERE key = 'site'"
      )
      .first();


  const products =
    await env.DB
      .prepare(
        `
        SELECT
          id,
          bank,
          name,
          category,
          icon,
          badge,
          description,
          limit_value,
          term,
          affiliate_url,
          active,
          sort_order
        FROM products
        ORDER BY sort_order ASC
        `
      )
      .all();


  const site =
    siteRow
      ? JSON.parse(
          siteRow.value
        )
      : {

          brand:
            "GenZ BaoThe",

          heroEyebrow:
            "GENZ BAOTHE • SMART MONEY",

          heroTitle:
            "Tìm đúng sản phẩm tài chính.",

          heroHighlight:
            "Đơn giản hơn.",

          heroDescription:
            "",

          compareTitle:
            "",

          compareDescription:
            "",

          ctaTitle:
            "",

          ctaDescription:
            "",

          footerDescription:
            "",

          stats: {

            products:
              "150+",

            users:
              "50K+",

            cities:
              "63",

            support:
              "24/7"

          }

        };


  return json({

    site,

    products:
      (products.results || [])
        .map(product => ({

          id:
            product.id,

          bank:
            product.bank,

          name:
            product.name,

          category:
            product.category,

          icon:
            product.icon,

          badge:
            product.badge,

          description:
            product.description,

          limit:
            product.limit_value,

          term:
            product.term,

          affiliateUrl:
            product.affiliate_url,

          active:
            Boolean(
              product.active
            )

        }))

  });

}


/* =========================
   PUT / SAVE
========================= */

export async function onRequestPut({
  request,
  env
}) {

  if (
    !(await authorized(
      request,
      env
    ))
  ) {

    return json({

      error:
        "Unauthorized"

    }, 401);

  }


  const data =
    await request.json();


  if (
    !data.site ||
    !Array.isArray(
      data.products
    )
  ) {

    return json({

      error:
        "Dữ liệu không hợp lệ."

    }, 400);

  }


  const now =
    new Date()
      .toISOString();


  /* =========================
     SAVE SITE
  ========================= */

  await env.DB
    .prepare(

      `
      INSERT INTO settings
      (
        key,
        value,
        updated_at
      )

      VALUES
      (
        'site',
        ?,
        ?
      )

      ON CONFLICT(key)

      DO UPDATE SET

        value =
          excluded.value,

        updated_at =
          excluded.updated_at
      `

    )

    .bind(

      JSON.stringify(
        data.site
      ),

      now

    )

    .run();


  /* =========================
     DELETE OLD PRODUCTS
  ========================= */

  await env.DB
    .prepare(
      "DELETE FROM products"
    )
    .run();


  /* =========================
     INSERT NEW PRODUCTS
  ========================= */

  const statements =
    data.products.map(
      (product, index) =>

        env.DB
          .prepare(

            `
            INSERT INTO products
            (
              id,
              bank,
              name,
              category,
              icon,
              badge,
              description,
              limit_value,
              term,
              affiliate_url,
              active,
              sort_order
            )

            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
            `

          )

          .bind(

            product.id
              ||
              "campaign-" + Date.now() + "-" + index,

            product.bank || "",

            product.name || "",

            product.category || "",

            product.icon || "",

            product.badge || "",

            product.description || "",

            product.limit || "",

            product.term || "",

            product.affiliateUrl || "",

            product.active === false
              ? 0
              : 1,

            index

          )

    );


  if (
    statements.length
  ) {

    await env.DB.batch(
      statements
    );

  }


  return json({

    success:
      true,

    message:
      "Đã lưu thành công."

  });

}
