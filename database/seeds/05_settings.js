const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  await knex('settings').del();
  const settings = [
    { key: 'store_name', value: 'JewelMS Jewelry Store', description: 'Store name' },
    { key: 'store_address', value: '123 Gold Street, Mumbai, Maharashtra - 400001', description: 'Store address' },
    { key: 'store_gst', value: '27AABCU9603R1ZX', description: 'GST number' },
    { key: 'store_phone', value: '+91 98765 43210', description: 'Store phone' },
    { key: 'store_email', value: 'info@jewelms.com', description: 'Store email' },
    { key: 'currency', value: 'INR', description: 'Currency' },
    { key: 'default_cgst_rate', value: '1.5', description: 'Default CGST rate' },
    { key: 'default_sgst_rate', value: '1.5', description: 'Default SGST rate' },
  ];
  await knex('settings').insert(settings.map(s => ({ id: uuidv4(), ...s })));
};
