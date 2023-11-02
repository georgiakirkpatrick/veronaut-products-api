exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del()
  await knex('categories').insert([
    {english_name: 'Activewear', category_class: 'clothing'},
    {english_name: 'Blazers', category_class: 'clothing'},
    {english_name: 'Coats and Jackets', category_class: 'clothing'},
    {english_name: 'Dresses', category_class: 'clothing'},
    {english_name: 'Facemasks', category_class: 'accessories'},
    {english_name: 'Hair Accessories and Hats', category_class: 'accessories'},
    {english_name: 'Jeans', category_class: 'clothing'},
    {english_name: 'Jumpsuits', category_class: 'clothing'},
    {english_name: 'Lingerie, Shapewear, and Loungewear', category_class: 'clothing'},
    {english_name: 'Pants', category_class: 'clothing'},
    {english_name: 'Shoes', category_class: 'shoes'},
    {english_name: 'Skirts', category_class: 'clothing'},
    {english_name: 'Socks and Tights', category_class: 'clothing'},
    {english_name: 'Sweaters', category_class: 'clothing'},
    {english_name: 'Swimwear', category_class: 'clothing'},
    {english_name: 'Tops', category_class: 'clothing'}
  ])
}