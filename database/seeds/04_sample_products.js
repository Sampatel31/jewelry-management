const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  await knex('products').del();
  const categories = await knex('categories').select('id', 'name');
  const catMap = {};
  categories.forEach(c => catMap[c.name] = c.id);

  await knex('products').insert([
    {
      id: uuidv4(), sku: 'GR-001', name: 'Gold Solitaire Ring',
      category_id: catMap['Rings'], metal_type: 'gold', metal_purity: '22k',
      metal_weight_gm: 5.5, making_charges: 2500, base_price: 28000,
      selling_price: 32000, stock_qty: 10, min_stock_qty: 3,
      barcode: 'BAR001', hsn_code: '7113', cgst_rate: 1.5, sgst_rate: 1.5,
      is_active: true, created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(), sku: 'GN-001', name: 'Gold Mangalsutra Necklace',
      category_id: catMap['Necklaces'], metal_type: 'gold', metal_purity: '22k',
      metal_weight_gm: 12.3, making_charges: 5500, base_price: 65000,
      selling_price: 72000, stock_qty: 5, min_stock_qty: 2,
      barcode: 'BAR002', hsn_code: '7113', cgst_rate: 1.5, sgst_rate: 1.5,
      is_active: true, created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(), sku: 'SE-001', name: 'Silver Jhumka Earrings',
      category_id: catMap['Earrings'], metal_type: 'silver', metal_purity: '925',
      metal_weight_gm: 8.0, making_charges: 800, base_price: 2500,
      selling_price: 3500, stock_qty: 20, min_stock_qty: 5,
      barcode: 'BAR003', hsn_code: '7113', cgst_rate: 1.5, sgst_rate: 1.5,
      is_active: true, created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(), sku: 'GB-001', name: 'Gold Kada Bangle',
      category_id: catMap['Bangles'], metal_type: 'gold', metal_purity: '22k',
      metal_weight_gm: 18.5, making_charges: 7500, base_price: 98000,
      selling_price: 110000, stock_qty: 4, min_stock_qty: 2,
      barcode: 'BAR004', hsn_code: '7113', cgst_rate: 1.5, sgst_rate: 1.5,
      is_active: true, created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(), sku: 'GP-001', name: 'Gold Diamond Pendant',
      category_id: catMap['Pendants'], metal_type: 'gold', metal_purity: '18k',
      metal_weight_gm: 3.2, stone_type: 'diamond', stone_weight_ct: 0.5,
      stone_quality: 'SI1', making_charges: 3000, base_price: 25000,
      selling_price: 30000, stock_qty: 8, min_stock_qty: 3,
      barcode: 'BAR005', hsn_code: '7113', cgst_rate: 1.5, sgst_rate: 1.5,
      is_active: true, created_at: new Date(), updated_at: new Date(),
    },
  ]);
};
