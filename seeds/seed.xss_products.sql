insert into products (
    english_name, 
    brand_id, 
    category_id, 
    product_url, 
    home_currency, 
    cost_in_home_currency, 
    cmt_country, 
    cmt_factory_notes, 
    approved_by_admin
)
values
    ('Injection post!', 1, 14, 'https://www.sezane.com/us/product/preco-automne-30-08/leon-sweaters/heather-rose', 'EUR', 100, 'RA', 'This text contains an intentionally broken image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie); alert(''you just got pretend hacked! oh noes!'');">. The image will try to load, when it fails, <strong>it executes malicious JavaScript</strong>', true);