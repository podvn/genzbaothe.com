export default {
  async fetch(request, env) {

    const url = new URL(request.url);
    const path = url.pathname;


    /* =====================================================
       API: LOGIN
       ===================================================== */

    if (
      path === "/api/admin/login" &&
      request.method === "POST"
    ) {

      if (!env.ADMIN_PASSWORD) {

        return json({
          error:
            "ADMIN_PASSWORD chưa được cấu hình trên Cloudflare."
        }, 500);

      }


      if (!env.ADMIN_SECRET) {

        return json({
          error:
            "ADMIN_SECRET chưa được cấu hình trên Cloudflare."
        }, 500);

      }


      let body;

      try {

        body = await request.json();

      } catch {

        return json({
          error:
            "Dữ liệu đăng nhập không hợp lệ."
        }, 400);

      }


      if (
        body.password !==
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
        success: true,
        token
      });

    }


    /* =====================================================
       API: CONTENT
       ===================================================== */

    if (
      path === "/api/admin/content"
    ) {

      if (
        request.method === "GET"
      ) {

        return getContent(
          request,
          env
        );

      }


      if (
        request.method === "PUT"
      ) {

        return saveContent(
          request,
          env
        );

      }


      return json({
        error:
          "Method Not Allowed"
      }, 405);

    }


    /* =====================================================
       WEBSITE / ADMIN HTML
       ===================================================== */

    if (env.ASSETS) {

      return env.ASSETS.fetch(
        request
      );

    }


    return new Response(
      "GenZ BaoThe Worker is running."
    );

  }
};


/* =========================================================
   JSON
   ========================================================= */

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


/* =========================================================
   SIGN
   ========================================================= */

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


/* =========================================================
   CREATE TOKEN
   ========================================================= */

async function createToken(
  secret
) {

  const payload = {

    exp:
      Date.now() +
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
    payloadString +
    "." +
    signature
  );

}


/* =========================================================
   VERIFY TOKEN
   ========================================================= */

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
      decoded.exp >
      Date.now()
    );

  }

  catch {

    return false;

  }

}


/* =========================================================
   AUTH
   ========================================================= */

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


/* =========================================================
   GET CONTENT
   ========================================================= */

async function getContent(
  request,
  env
) {

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


  if (!env.DB) {

    return json({
      error:
        "D1 binding DB chưa được cấu hình."
    }, 500);

  }


  try {

    const siteRow =
      await env.DB
        .prepare(
          `
          SELECT value
          FROM settings
          WHERE key = 'site'
          `
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

  catch (error) {

    return json({
      error:
        "Không thể tải dữ liệu.",
      detail:
        error.message
    }, 500);

  }

}


/* =========================================================
   SAVE CONTENT
   ========================================================= */

async function saveContent(
  request,
  env
) {

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


  if (!env.DB) {

    return json({
      error:
        "D1 binding DB chưa được cấu hình."
    }, 500);

  }


  let data;

  try {

    data =
      await request.json();

  }

  catch {

    return json({
      error:
        "Dữ liệu không hợp lệ."
    }, 400);

  }


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


  try {

    const now =
      new Date()
        .toISOString();


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


    await env.DB
      .prepare(
        "DELETE FROM products"
      )
      .run();


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

              product.id ||
              (
                "campaign-" +
                Date.now() +
                "-" +
                index
              ),

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

  catch (error) {

    return json({
      error:
        "Không thể lưu dữ liệu.",

      detail:
        error.message
    }, 500);

  }

}
