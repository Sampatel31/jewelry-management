const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  await knex('roles').del();
  await knex('roles').insert([
    {
      id: uuidv4(),
      name: 'admin',
      permissions: JSON.stringify({
        all: true,
        view_invoices: true, create_invoice: true, finalize_invoice: true, delete_invoice: true,
        issue_credit_debit_note: true, view_audit_logs: true, manage_users: true,
        view_reports: true, pos_sales: true, manage_products: true, ai_write_actions: true, backup_restore: true,
      }),
      created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'manager',
      permissions: JSON.stringify({
        view_invoices: true, create_invoice: true, finalize_invoice: true,
        issue_credit_debit_note: true, view_reports: true, pos_sales: true,
        manage_products: true, ai_write_actions: true,
      }),
      created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'staff',
      permissions: JSON.stringify({
        view_invoices: true, create_invoice: true, pos_sales: true,
      }),
      created_at: new Date(), updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'accountant',
      permissions: JSON.stringify({
        view_invoices: true, create_invoice: true, finalize_invoice: true,
        issue_credit_debit_note: true, view_audit_logs: true, view_reports: true,
      }),
      created_at: new Date(), updated_at: new Date(),
    },
  ]);
};
