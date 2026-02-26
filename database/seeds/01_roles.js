const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  await knex('roles').del();
  await knex('roles').insert([
    { id: uuidv4(), name: 'admin', permissions: JSON.stringify({ all: true }), created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'manager', permissions: JSON.stringify({ inventory: true, billing: true, reports: true }), created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'staff', permissions: JSON.stringify({ pos: true, inventory: true }), created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'accountant', permissions: JSON.stringify({ billing: true, reports: true }), created_at: new Date(), updated_at: new Date() },
  ]);
};
