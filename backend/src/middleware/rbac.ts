import { Request, Response, NextFunction } from 'express';

// Fine-grain permission matrix
export const PERMISSIONS: Record<string, string[]> = {
  view_invoices: ['admin', 'manager', 'accountant', 'staff'],
  create_invoice: ['admin', 'manager', 'accountant', 'staff'],
  finalize_invoice: ['admin', 'manager', 'accountant'],
  delete_invoice: ['admin'],
  issue_credit_debit_note: ['admin', 'manager', 'accountant'],
  view_audit_logs: ['admin', 'accountant'],
  manage_users: ['admin'],
  view_reports: ['admin', 'manager', 'accountant'],
  pos_sales: ['admin', 'manager', 'staff'],
  manage_products: ['admin', 'manager'],
  ai_write_actions: ['admin', 'manager'],
  backup_restore: ['admin'],
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "You don't have permission to perform this action" });
    }
    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const allowed = PERMISSIONS[permission] || [];
    if (!user || !allowed.includes(user.role)) {
      return res.status(403).json({ success: false, message: "You don't have permission to perform this action" });
    }
    next();
  };
};
