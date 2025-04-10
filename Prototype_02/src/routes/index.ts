import { Router, Request, Response } from 'express';
import adminRoutes from './admin.routes'; // Import admin routes

const router = Router();

// --- CORRECTED Placeholder route ---
// Using a proper function body for clarity
router.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1>Prototype 02 - Homepage Placeholder</h1><p><a href="/admin/employees">Manage Employees</a></p>'
  );
});
// ---------------------------------

// Mount admin routes under the /admin prefix
router.use('/admin', adminRoutes);

export default router;