// src/routes/admin.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator'; // For validation
import mongoose from 'mongoose'; // For validating ObjectId
import * as employeeService from '../services/employeeService'; // Import service functions
import { Shift, PerformanceLog } from '../models'; // Import models needed for delete check

const adminRouter = Router();

// --- Middleware for parsing form data (Make sure urlencoded is global in app.ts) ---

// --- Reusable Validation Rules ---
// Defines rules for validating incoming form data for employees
const employeeValidationRules = [
  body('name', 'Employee name is required.').notEmpty().trim().escape(),
  body('position', 'Please select a position.').notEmpty().trim().escape(),
  body('email', 'Valid email is required.').isEmail().normalizeEmail(),
  body('hourly_rate').optional({ checkFalsy: true })
                     .isFloat({ min: 0 }).withMessage('Hourly rate cannot be negative.')
                     .toFloat()
];

// --- Employee List Route (GET /admin/employees) ---
adminRouter.get('/employees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await employeeService.getAllEmployees();
    // Pass data and flash messages to the EJS template
    res.render('admin/employee_list', { // Renders views/admin/employee_list.ejs
      title: 'Manage Employees',
      employees: employees,
      successFlash: req.flash('success'),
      errorFlash: req.flash('error')
    });
  } catch (error) {
    req.flash('error', 'Error loading employee list.');
    console.error("Error in GET /admin/employees:", error);
    res.redirect('/'); // Redirect to main home on error
  }
});

// --- Add Employee Route (GET /admin/employee/add) ---
// Displays the empty form
adminRouter.get('/employee/add', (req: Request, res: Response) => {
  res.render('admin/employee_form', { // Renders views/admin/employee_form.ejs
    title: 'Add New Employee',
    employee: {}, // Pass empty object for initial render
    errors: [], // Pass empty errors array
    editMode: false, // Flag to indicate this is not edit mode
    successFlash: req.flash('success'),
    errorFlash: req.flash('error')
  });
});

// --- Add Employee Route (POST /admin/employee/add) ---
// Handles form submission
adminRouter.post(
  '/employee/add',
  employeeValidationRules, // Apply validation rules first
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Validation failed: Re-render form with errors and submitted data
      return res.status(400).render('admin/employee_form', {
        title: 'Add New Employee',
        employee: req.body, // Pass submitted data back
        errors: errors.array(),
        editMode: false,
        successFlash: req.flash('success'), 
        errorFlash: req.flash('error')
      });
    }

    // Validation passed: Try to create employee via service
    try {
      const newEmployee = await employeeService.createEmployee(req.body);
      req.flash('success', `Employee "${newEmployee.name}" added successfully!`);
      res.redirect('/admin/employees'); // Redirect to list view
    } catch (error: any) {
      // Handle errors from service (e.g., duplicate entry)
      req.flash('error', error.message || 'Error adding employee.');
      // Re-render form with submitted data and error message
      res.status(400).render('admin/employee_form', {
          title: 'Add New Employee',
          employee: req.body,
          errors: [], // No *validation* errors, but show service error via flash
          editMode: false,
          successFlash: req.flash('success'), // Likely empty, but pass it
          errorFlash: req.flash('error')
      });
    }
  }
);

// --- Edit Employee Route (GET /admin/employee/edit/:id) ---
// Displays the form pre-populated with existing data
adminRouter.get('/employee/edit/:id', async (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.params.id;
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        req.flash('error', 'Invalid Employee ID format.');
        return res.redirect('/admin/employees');
    }
    try {
        const employee = await employeeService.getEmployeeById(employeeId);
        if (!employee) {
            req.flash('error', 'Employee not found.');
            return res.redirect('/admin/employees');
        }
        // Render the SAME form template, passing employee data
        res.render('admin/employee_form', {
            title: 'Edit Employee',
            employee: employee,
            errors: [],
            editMode: true, // Flag for template (e.g., form action if needed, or title)
            successFlash: req.flash('success'),
            errorFlash: req.flash('error')
        });
    } catch (error) {
        req.flash('error', 'Error loading employee for editing.');
        console.error("Error in GET /admin/employee/edit:", error);
        res.redirect('/admin/employees');
    }
});

// --- Edit Employee Route (POST /admin/employee/edit/:id) ---
// Handles form submission for updates
adminRouter.post(
    '/employee/edit/:id',
    employeeValidationRules, // Apply same validation rules
    async (req: Request, res: Response, next: NextFunction) => {
        const employeeId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
             req.flash('error', 'Invalid Employee ID format.');
             return res.redirect('/admin/employees');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Validation failed: Re-render form with errors and MERGED data
            try {
                // Fetch original data again to avoid losing fields not in the form
                const originalEmployee = await employeeService.getEmployeeById(employeeId);
                return res.status(400).render('admin/employee_form', {
                    title: 'Edit Employee',
                    // Merge original data with submitted data for re-population
                    employee: { ...originalEmployee?.toObject(), ...req.body, _id: employeeId },
                    errors: errors.array(),
                    editMode: true,
                    successFlash: req.flash('success'), 
                    errorFlash: req.flash('error')
                });
            } catch {
                 req.flash('error', 'Error reloading form after validation error.');
                 return res.redirect('/admin/employees');
            }
        }

        // Validation passed: Try to update via service
        try {
            const updatedEmployee = await employeeService.updateEmployee(employeeId, req.body);
            if (!updatedEmployee) {
                 req.flash('error', 'Employee not found during update.');
                 return res.redirect('/admin/employees');
            }
            req.flash('success', `Employee "${updatedEmployee.name}" updated successfully!`);
            res.redirect('/admin/employees'); // Redirect to list
        } catch (error: any) {
             // Handle errors from service (e.g., duplicate check)
            req.flash('error', error.message || 'Error updating employee.');
             // Re-render form with submitted data and error flash
             res.status(400).render('admin/employee_form', {
                title: 'Edit Employee',
                employee: { _id: employeeId, ...req.body }, // Show submitted values
                errors: [],
                editMode: true,
                successFlash: req.flash('success'), 
                errorFlash: req.flash('error')
            });
        }
    }
);

// --- Delete Employee Route (POST /admin/employee/delete/:id) ---
adminRouter.post('/employee/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.params.id;
     if (!mongoose.Types.ObjectId.isValid(employeeId)) {
             req.flash('error', 'Invalid Employee ID format.');
             return res.redirect('/admin/employees');
     }
    try {
        // Check for related records before allowing deletion
        const hasShifts = await Shift.exists({ employee: employeeId });
        const hasLogs = await PerformanceLog.exists({ employee: employeeId });

        if (hasShifts || hasLogs) {
             const relations = [];
             if (hasShifts) relations.push("shifts");
             if (hasLogs) relations.push("performance logs");
             req.flash('error', `Cannot delete employee. They have existing ${relations.join(' and ')}.`)
        } else {
            // No dependencies, attempt deletion via service
            const success = await employeeService.deleteEmployee(employeeId);
            if (success) {
                req.flash('success', 'Employee deleted successfully.');
            } else {
                req.flash('error', 'Employee not found for deletion.');
            }
        }
    } catch (error: any) {
        req.flash('error', error.message || 'Error deleting employee.');
        console.error("Error in POST /admin/employee/delete:", error);
    }
    res.redirect('/admin/employees'); // Redirect back to list
});


export default adminRouter; // Export the router