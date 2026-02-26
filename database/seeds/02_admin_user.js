const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  await knex('users').del();
  const adminRole = await knex('roles').where({ name: 'admin' }).first();
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await knex('users').insert([
    {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@jewelry.com',
      password_hash: passwordHash,
      role_id: adminRole.id,
      phone: '+91 98765 43210',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]);
};
