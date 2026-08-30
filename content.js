const DEFAULT_DATA = {

  site: {

    brand: "GenZ BaoThe",

    heroEyebrow:
      "GENZ BAOTHE • SMART MONEY",

    heroTitle:
      "Tìm đúng sản phẩm tài chính.",

    heroHighlight:
      "Đơn giản hơn.",

    heroDescription:
      "So sánh khoản vay, thẻ tín dụng và ngân hàng theo nhu cầu của bạn. Thông tin rõ ràng, dễ hiểu và dễ lựa chọn.",

    compareTitle:
      "Đừng chọn theo cảm tính.",

    compareDescription:
      "GenZ BaoThe giúp bạn nhìn các tiêu chí quan trọng trước khi quyết định: hạn mức, chi phí, điều kiện và quyền lợi.",

    ctaTitle:
      "Bắt đầu lựa chọn hôm nay.",

    ctaDescription:
      "Khám phá các sản phẩm tài chính được tổng hợp trên GenZ BaoThe.",

    footerDescription:
      "Nền tảng tổng hợp và so sánh thông tin tài chính.",

    stats: {

      products: "150+",
      users: "50K+",
      cities: "63",
      support: "24/7"

    }

  },

  products: []

};


function json(data, status = 200) {

  return new Response(

    JSON.stringify(data),

    {

      status,

      headers: {

        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store"

      }

    }

  );

}


export async function onRequestGet({
  env
}) {

  if (!env.DB) {

    return json(
      DEFAULT_DATA
    );

  }


  try {

    const siteRow =
      await env.DB
        .prepare(
          "SELECT value FROM settings WHERE key = 'site'"
        )
        .first();


    const productsResult =
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
          WHERE active = 1
          ORDER BY sort_order ASC
          `
        )
        .all();


    const site =
      siteRow
        ? JSON.parse(
            siteRow.value
          )
        : DEFAULT_DATA.site;


    const products =
      (productsResult.results || [])
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
            product.affiliate_url

        }));


    return json({

      site,

      products

    });

  }

  catch (error) {

    console.error(error);

    return json(
      DEFAULT_DATA
    );

  }

}
