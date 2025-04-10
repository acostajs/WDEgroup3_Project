// src/routes/admin.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import * as employeeService from '../services/employeeService';
import { Shift, PerformanceLog } from '../models'; // Assuming models/index.ts exports these
import * as forecastingService from '../services/forecastingService';
import * as schedulingService from '../services/schedulingService'; // <-- Added Import

const adminRouter = Router();

// --- Middleware for parsing form data (Make sure urlencoded is global in app.ts) ---

// --- Reusable Validation Rules ---
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
    res.render('admin/employee_list', {
      title: 'Manage Employees',
      employees: employees,
      successFlash: req.flash('success'),
      errorFlash: req.flash('error')
    });
  } catch (error) {
    req.flash('error', 'Error loading employee list.');
    console.error("Error in GET /admin/employees:", error);
    res.redirect('/'); // Redirect to home or a dashboard on error
  }
});

// --- Add Employee Route (GET /admin/employee/add) ---
adminRouter.get('/employee/add', (req: Request, res: Response) => {
  res.render('admin/employee_form', {
    title: 'Add New Employee',
    employee: {}, // Provide an empty object for the form template
    errors: [], // Initialize errors array
    editMode: false, // Flag for the template
    successFlash: req.flash('success'), // Pass flash messages
    errorFlash: req.flash('error')
  });
});

// --- Add Employee Route (POST /admin/employee/add) ---
adminRouter.post(
  '/employee/add',
  employeeValidationRules, // Apply validation rules
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Validation failed
      return res.status(400).render('admin/employee_form', {
        title: 'Add New Employee',
        employee: req.body, // Send back submitted data
        errors: errors.array(), // Send validation errors
        editMode: false,
        successFlash: req.flash('success'), // Pass flash messages
        errorFlash: req.flash('error')
      });
    }

    // Validation passed
    try {
      const newEmployee = await employeeService.createEmployee(req.body);
      req.flash('success', `Employee "${newEmployee.name}" added successfully!`);
      res.redirect('/admin/employees');
    } catch (error: any) {
       // Handle potential errors from the service (e.g., duplicate email)
       req.flash('error', error.message || 'Error adding employee.');
       // It might be better to log the full error on the server side
       console.error("Error in POST /admin/employee/add:", error);
       // Re-render form with error
       res.status(400).render('admin/employee_form', {
          title: 'Add New Employee',
          employee: req.body, // Send back submitted data
          errors: [{ msg: error.message }], // Show service error message
          editMode: false,
          successFlash: req.flash('success'), // Pass flash messages
          errorFlash: req.flash('error')
      });
    }
  }
);

// --- Edit Employee Route (GET /admin/employee/edit/:id) ---
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
        res.render('admin/employee_form', {
            title: 'Edit Employee',
            employee: employee, // Pass employee data to the template
            errors: [],
            editMode: true, // Set edit mode flag
            successFlash: req.flash('success'), // Pass flash messages
            errorFlash: req.flash('error')
        });
    } catch (error) {
        req.flash('error', 'Error loading employee for editing.');
        console.error("Error in GET /admin/employee/edit:", error);
        res.redirect('/admin/employees');
    }
});

// --- Edit Employee Route (POST /admin/employee/edit/:id) ---
adminRouter.post(
    '/employee/edit/:id',
    employeeValidationRules, // Apply validation rules
    async (req: Request, res: Response, next: NextFunction) => {
        const employeeId = req.params.id;
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
             req.flash('error', 'Invalid Employee ID format.');
             return res.redirect('/admin/employees');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Validation failed, re-render form with errors and existing data
            // Fetch original employee again only if needed to populate fields not in req.body
             const submittedData = { ...req.body, _id: employeeId }; // Ensure _id is preserved if needed by form
             return res.status(400).render('admin/employee_form', {
                 title: 'Edit Employee',
                 employee: submittedData, // Use submitted data to repopulate
                 errors: errors.array(), // Send validation errors
                 editMode: true,
                 successFlash: req.flash('success'), // Pass flash messages
                 errorFlash: req.flash('error')
             });
        }

        // Validation passed
        try {
            const updatedEmployee = await employeeService.updateEmployee(employeeId, req.body);
            if (!updatedEmployee) {
                 // Should ideally not happen if ID was valid, but handle defensively
                 req.flash('error', 'Employee not found during update.');
                 return res.redirect('/admin/employees');
            }
            req.flash('success', `Employee "${updatedEmployee.name}" updated successfully!`);
            res.redirect('/admin/employees');
        } catch (error: any) {
            // Handle potential errors from the service (e.g., duplicate email on update)
            req.flash('error', error.message || 'Error updating employee.');
            // Log the full error on the server side
            console.error("Error in POST /admin/employee/edit:", error);
             // Re-render form with error
             res.status(400).render('admin/employee_form', {
                title: 'Edit Employee',
                employee: { _id: employeeId, ...req.body }, // Repopulate with submitted data
                errors: [{ msg: error.message }], // Show service error message
                editMode: true,
                successFlash: req.flash('success'), // Pass flash messages
                errorFlash: req.flash('error')
            });
        }
    }
);

// --- Delete Employee Route (POST /admin/employee/delete/:id) ---
adminRouter.post('/employee/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.params.id;
    // Validate ID format
     if (!mongoose.Types.ObjectId.isValid(employeeId)) {
             req.flash('error', 'Invalid Employee ID format.');
             return res.redirect('/admin/employees');
     }
    try {
        // Check for related data before deleting (optional but good practice)
        const hasShifts = await Shift.exists({ assigned_employee: employeeId }); // Ensure field name is correct
        const hasLogs = await PerformanceLog.exists({ employee: employeeId }); // Ensure field name is correct

        if (hasShifts || hasLogs) {
             const relations = [];
             if (hasShifts) relations.push("shifts");
             if (hasLogs) relations.push("performance logs");
             req.flash('error', `Cannot delete employee. They have existing ${relations.join(' and ')}.`)
             return res.redirect('/admin/employees'); // Stop deletion
        }

        // Proceed with deletion
        const success = await employeeService.deleteEmployee(employeeId);
        if (success) {
            req.flash('success', 'Employee deleted successfully.');
        } else {
            // Should ideally not happen if ID was valid, but handle defensively
            req.flash('error', 'Employee not found for deletion.');
        }
    } catch (error: any) {
        req.flash('error', error.message || 'Error deleting employee.');
        console.error("Error in POST /admin/employee/delete:", error);
    }
    // Redirect back to the list in all cases (success, not found, error)
    res.redirect('/admin/employees');
});


// --- Test Forecast Route (GET /admin/test-forecast) ---
// Note: forecastingService.generateForecast likely needs implementation or adjustment
adminRouter.get('/test-forecast', async (req: Request, res: Response, next: NextFunction) => {
  const daysToPredict = 14; // Or get from query: req.query.days
  console.log(`Accessed /admin/test-forecast route, predicting ${daysToPredict} days.`);
  try {
      // Assuming forecastingService.getForecast exists and returns parsed data
      const forecastData = await forecastingService.generateForecast(daysToPredict);
      console.log("[Route] Forecast service call successful.");
      res.json(forecastData); // Send the forecast data as JSON response
  } catch (error: any) {
      console.error("[Route] Error in /admin/test-forecast:", error);
      res.status(500).json({
           message: "Error generating or retrieving forecast.",
           error: error.message || String(error) // Provide error message
      });
  }
});


// --- Generate Schedule Route (POST /admin/generate-schedule) --- // <-- Added Route
adminRouter.post('/generate-schedule', async (req: Request, res: Response, next: NextFunction) => {

  try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); 

      const targetMonthIndex = (currentMonth + 1) % 12; 
      const targetYear = currentMonth === 11 ? currentYear + 1 : currentYear; 
      const targetMonthStartDate = new Date(Date.UTC(targetYear, targetMonthIndex, 1));

      const monthAfterTargetIndex = (targetMonthIndex + 1) % 12;
      const yearOfMonthafterTarget = targetMonthIndex === 11 ? targetYear + 1 : targetYear;
      const firstDayOfNextMonth = new Date(Date.UTC(yearOfMonthafterTarget, monthAfterTargetIndex, 1));

      const targetMonthEndDate = new Date(firstDayOfNextMonth.getTime() - 1); 

      const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      const targetMonthStr = monthFormatter.format(targetMonthStartDate);

      console.log(`[Route /admin/generate-schedule] Request received to generate schedule for: ${targetMonthStr}`);
      console.log(`[Route /admin/generate-schedule] Target Date Range (UTC): ${targetMonthStartDate.toISOString()} to ${targetMonthEndDate.toISOString()}`);

      const createdShifts = await schedulingService.generateSchedule(targetMonthStartDate, targetMonthEndDate);

      req.flash('success', `Successfully generated ${createdShifts.length} shifts for ${targetMonthStr}.`);
      res.redirect('/admin/employees'); // Redirecting to employee list for now

  } catch (error: any) {
      // Error: Redirect back with an error message
      console.error('[Route /admin/generate-schedule] Error:', error);
      req.flash('error', `Failed to generate schedule: ${error.message || 'Unknown error'}`);
      res.redirect('/admin/employees'); // Redirecting to employee list for now
  }
});

export default adminRouter;