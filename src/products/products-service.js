const ProductsService = {
    // Products
    getAllProducts(knex) {
        return knex('products')
            .join('brands', {'products.brand_id': 'brands.id'})
            .select(
                'products.id',
                'products.english_name',
                'products.brand_id',
                'brands.english_name as brand_name',
                'brands.home_currency as brand_currency',
                'products.category_id',
                'products.feature_image_url',
                'products.multiple_color_options',
                'brands.home_currency',
                'products.cost_in_home_currency',
                'products.product_url',
                'products.wash_id',
                'products.dry_id',
                'products.cmt_sew_country',
                'products.cmt_cut_country',
                'products.cmt_notes',
                'products.featured',
                'products.approved_by_admin',
                'products.created_at',
                'products.updated_at'
            )
    },

    getFeaturedProducts(knex) {
        return knex('products')
            .join('brands', {'products.brand_id': 'brands.id'})
            .select(
                'products.id',
                'products.english_name',
                'products.brand_id',
                'brands.english_name as brand_name',
                'brands.home_currency as brand_currency',
                'products.category_id',
                'products.feature_image_url',
                'products.multiple_color_options',
                'brands.home_currency',
                'products.cost_in_home_currency',
                'products.product_url',
                'products.wash_id',
                'products.dry_id',
                'products.cmt_sew_country',
                'products.cmt_cut_country',
                'products.cmt_notes',
                'products.featured',
                'products.approved_by_admin',
                'products.created_at',
                'products.updated_at'
            )
            .where('products.featured', true)
    },

    getProductById(knex, id) {
        return knex('products')
            .join('brands', {'products.brand_id': 'brands.id'})
            .select(
                'products.id',
                'products.english_name',
                'products.brand_id',
                'brands.english_name as brand_name',
                'brands.home_currency as brand_currency',
                'products.category_id',
                'products.feature_image_url',
                'products.multiple_color_options',
                'products.cost_in_home_currency',
                'products.product_url',
                'products.wash_id',
                'products.dry_id',
                'products.cmt_sew_country',
                'products.cmt_cut_country',
                'products.cmt_notes',
                'products.featured',
                'products.approved_by_admin',
                'products.created_at',
                'products.updated_at'
            )
            .where('products.id', id)
            .first()
    },

    insertProduct(knex, newProduct) {
        return knex
            .insert(newProduct)
            .into('products')
            .returning('*')
            .then(response => {
                return response[0]
            })
    },

    deleteProduct(knex, id) {
        return knex('products')
            .where({ id })
            .delete()
    },

    updateProduct(knex, id, newProductFields) {
        return knex('products')
            .where({ id })
            .update(newProductFields)
    },

    //Certifications
    getProdCerts(knex, productId) {
        return knex('product_cmts_to_certifications')
            .join('certifications', {'product_cmts_to_certifications.certification_id': 'certifications.id'})
            .select(
                'product_cmts_to_certifications.certification_id',
                'certifications.english_name',
                'certifications.website',
                'certifications.approved_by_admin as cert_approved_by_admin',
                'product_cmts_to_certifications.approved_by_admin as pair_approved_by_admin',
                'product_cmts_to_certifications.created_at as pair_created_at',
                'product_cmts_to_certifications.updated_at as pair_updated_at'
            )
            .where('product_cmts_to_certifications.product_id', productId)
    },

    insertProdCert(knex, newPair) {
        return knex
            .insert(newPair)
            .into('product_cmts_to_certifications')
            .returning('*')
            .then(response => {
                return response[0]
            })
    },

    // Colors
    getColorsForProduct(knex, productId) {
        return knex('product_colors')
            .select('*')
            .where('product_colors.product_id', productId)
    },

    insertProductColor(knex, newProductColor) {
        return knex
            .insert(newProductColor)
            .into('product_colors')
            .returning('*')
            .then(response => {
                return response[0]
            })
    },

    // COLORS AND IMAGES COMBINED
    getColorsImages(knex, productId) {
        return knex('product_colors')
            .join('product_images', {'product_colors.id': 'product_images.color_id'})
            .select(
                'product_colors.id as color_id',
                'product_colors.color_description_id',
                'product_colors.color_english_name',
                'product_colors.swatch_image_url',
                'product_images.product_image_url',
                'product_images.id as image_id',
                'product_images.primary_image_for_color'
            )
            .where('product_colors.product_id', productId)
    },

    // Images
    getImagesForProduct(knex, productId) {
        return knex('product_images')
            .select('*').where('product_id', productId)
    },

    insertImages(knex, newImage) {
        return knex
            .insert(newImage)
            .into('product_images')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    // Fabrics
    getFabricsForProduct(knex, productId) {
        return knex('fabrics')
            .join('fabrics_to_products', {'fabrics.id': 'fabrics_to_products.fabric_id'})
            .select(
                'fabrics.id',
                'fabrics.brand_id',
                'fabrics_to_products.relationship',
                'fabrics.fabric_mill_country',
                'fabrics.fabric_mill_id',
                'fabrics.fabric_mill_notes',
                'fabrics.dye_print_finish_country',
                'fabrics.dye_print_finish_id',
                'fabrics.dye_print_finish_notes',
                'fabrics.approved_by_admin as fab_approved_by_admin',
                'fabrics_to_products.approved_by_admin as pair_approved_by_admin',
                'fabrics_to_products.created_at as pair_created_at',
                'fabrics_to_products.updated_at as pair_updated_at'
            )
            .where('product_id', productId)
    },

    insertProductFabric(knex, newSet) {
        return knex
            .insert(newSet)
            .into('fabrics_to_products')
            .returning('*')
            .then(response => {
                return response[0]
            })
    },

    // Factories
    getFactoriesForProduct(knex, productId) {
        return knex('factories')
            .join('product_cmts_to_factories', {'factories.id': 'product_cmts_to_factories.factory_id'})
            .select(
                'factories.id',
                'factories.english_name',
                'factories.country',
                'factories.website',
                'factories.notes',
                'product_cmts_to_factories.stage',
                'factories.approved_by_admin as fact_approved_by_admin',
                'product_cmts_to_factories.approved_by_admin as pair_approved_by_admin',
                'product_cmts_to_factories.created_at as pair_created_at',
                'product_cmts_to_factories.updated_at as pair_updated_at'
            )
            .where('product_id', productId)
    },

    insertProductFactory(knex, newGroup) {
        return knex
            .insert(newGroup)
            .into('product_cmts_to_factories')
            .returning('*')
            .then(response => response[0])
    },

    // Fibers
    getFibersForProduct(knex, productId) {
        return knex('fibers_and_materials')
            .join('fibers_to_products', {'fibers_and_materials.id': 'fibers_to_products.fiber_or_material_id'})
            .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types.id'})
            .join('factories', {'fibers_and_materials.producer_id': 'factories.id'})
            .select(
                'fibers_and_materials.id',
                'fibers_and_materials.fiber_or_material_type_id',
                'fiber_and_material_types.english_name as fiber_type',
                'fiber_and_material_types.fiber_type_class as class',
                'fibers_and_materials.brand_id',
                'fibers_and_materials.producer_country',
                'fibers_and_materials.producer_id',
                'fibers_and_materials.production_notes',
                'factories.english_name as producer',
                'factories.website as producer_website',
                'fibers_and_materials.production_notes',
                'factories.notes as producer_notes',
                'fibers_and_materials.approved_by_admin as fib_approved_by_admin',
                'fibers_to_products.approved_by_admin as pair_approved_by_admin',
                'fibers_to_products.created_at as pair_created_at',
                'fibers_to_products.updated_at as pair_updated_at'

            )
            .where('product_id', productId)
    },

    insertProductFiber(knex, newPair) {
        return knex
            .insert(newPair)
            .into('fibers_to_products')
            .returning('*')
            .then(response => response[0])
    },

    // Notions
    getNotionsForProduct(knex, productId) {
        return knex('notions')
            .join('notion_types', {'notions.notion_type_id': 'notion_types.id'})
            .join('notions_to_products', {'notions.id': 'notions_to_products.notion_id'})
            .join('products', {'notions_to_products.product_id': 'products.id'})
            .join('factories', {'notions.manufacturer_id': 'factories.id'})
            .join('fiber_and_material_types', {'notions.material_type_id': 'fiber_and_material_types.id'})
            .select(
                'notions.id',
                'notions.notion_type_id',
                'notion_types.english_name as notion_type',
                'notions.brand_id',
                'notions.manufacturer_country',
                'notions.manufacturer_id',
                'notions.manufacturer_notes',
                'notions.material_type_id',
                'fiber_and_material_types.english_name as material_type',
                'notions.material_origin_id',
                'notions.material_producer_id',
                'notions.material_notes',
                'notions.approved_by_admin as notion_approved_by_admin',
                'notions_to_products.approved_by_admin as pair_approved_by_admin',
                'notions_to_products.created_at as pair_created_at',
                'notions_to_products.updated_at as pair_updated_at'
            )
            .where('notions_to_products.product_id', productId)
    },

    insertProductNotion(knex, newPair) {
        return knex
            .insert(newPair)
            .into('notions_to_products')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    // Sizes
    getSizesForProduct(knex, productId) {
        return knex('sizes')
            .join('sizes_to_products', {'sizes.id': 'sizes_to_products.size_id'})
            .select(
                'sizes.id',
                'sizes.country_system',
                'sizes.size_text',
                'sizes.size_category',
                'sizes.size_class',
                'sizes.us_size',
                'sizes_to_products.approved_by_admin as pair_approved_by_admin',
                'sizes_to_products.created_at as pair_created_at',
                'sizes_to_products.updated_at as pair_updated_at'
            )
            .where('product_id', productId)
    },

    insertProductSizes(knex, newPair) {
        return knex
            .insert(newPair)
            .into('sizes_to_products')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
}

module.exports = ProductsService