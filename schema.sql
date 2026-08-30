CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS products (

    id TEXT PRIMARY KEY,

    bank TEXT NOT NULL,

    name TEXT NOT NULL,

    category TEXT NOT NULL,

    icon TEXT,

    badge TEXT,

    description TEXT,

    limit_value TEXT,

    term TEXT,

    affiliate_url TEXT,

    active INTEGER DEFAULT 1,

    sort_order INTEGER DEFAULT 0

);


INSERT OR IGNORE INTO settings (
    key,
    value,
    updated_at
)

VALUES (

    'site',

    '{
      "brand":"GenZ BaoThe",
      "heroEyebrow":"GENZ BAOTHE • SMART MONEY",
      "heroTitle":"Tìm đúng sản phẩm tài chính.",
      "heroHighlight":"Đơn giản hơn.",
      "heroDescription":"So sánh khoản vay, thẻ tín dụng và ngân hàng theo nhu cầu của bạn. Thông tin rõ ràng, dễ hiểu và dễ lựa chọn.",
      "compareTitle":"Đừng chọn theo cảm tính.",
      "compareDescription":"GenZ BaoThe giúp bạn nhìn các tiêu chí quan trọng trước khi quyết định: hạn mức, chi phí, điều kiện và quyền lợi.",
      "ctaTitle":"Bắt đầu lựa chọn hôm nay.",
      "ctaDescription":"Khám phá các sản phẩm tài chính được tổng hợp trên GenZ BaoThe.",
      "footerDescription":"Nền tảng tổng hợp và so sánh thông tin tài chính.",
      "stats":{
        "products":"150+",
        "users":"50K+",
        "cities":"63",
        "support":"24/7"
      }
    }',

    datetime('now')

);


INSERT OR IGNORE INTO products (

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

VALUES (

    'vpbank-vay',

    'VPBank',

    'Khoản vay tiêu dùng',

    'Khoản vay',

    '💰',

    'Nổi bật',

    'Giải pháp vay tiêu dùng linh hoạt, phù hợp nhiều nhu cầu tài chính.',

    'Đến 250 triệu',

    '6 - 60 tháng',

    'https://example.com',

    1,

    1

);


INSERT OR IGNORE INTO products (

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

VALUES (

    'tpbank-card',

    'TPBank',

    'Thẻ tín dụng quốc tế',

    'Thẻ tín dụng',

    '💳',

    'Ưu đãi',

    'Nhiều lựa chọn ưu đãi, phù hợp nhu cầu chi tiêu và mua sắm.',

    'Đến 500 triệu',

    'Đến 55 ngày',

    'https://example.com',

    1,

    2

);


INSERT OR IGNORE INTO products (

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

VALUES (

    'cake-bank',

    'Cake',

    'Tài khoản ngân hàng số',

    'Ngân hàng',

    '🏦',

    'Digital',

    'Trải nghiệm ngân hàng số, mở tài khoản trực tuyến tiện lợi.',

    'Online',

    '24/7',

    'https://example.com',

    1,

    3

);
