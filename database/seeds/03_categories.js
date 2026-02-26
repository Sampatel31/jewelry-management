const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  await knex('categories').del();
  await knex('categories').insert([
    { id: uuidv4(), name: 'Rings', description: 'All types of rings', created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'Necklaces', description: 'All types of necklaces', created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'Earrings', description: 'All types of earrings', created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'Bracelets', description: 'All types of bracelets', created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'Bangles', description: 'All types of bangles', created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'Pendants', description: 'All types of pendants', created_at: new Date(), updated_at: new Date() },
    { id: uuidv4(), name: 'Chains', description: 'All types of chains', created_at: new Date(), updated_at: new Date() },
  ]);
};
