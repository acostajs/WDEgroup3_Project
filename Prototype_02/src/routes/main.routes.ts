import { Router, Request, Response, NextFunction } from 'express';
import * as schedulingService from '../services/schedulingService'; // Import the service
import { IShift } from '../models/Shift'; // Import the Shift interface if needed for typing

const mainRouter = Router();

// --- Home Route (Example) ---
mainRouter.get('/', (req: Request, res: Response) => {
  // Render home page or dashboard
  res.render('index', { // Assuming you have an index.ejs
      title: 'Home - Pozole Staffing',
      successFlash: req.flash('success'),
      errorFlash: req.flash('error')
     });
});


// --- Schedule View Route (GET /schedule) ---
// Displays the schedule for the NEXT full calendar month by default
mainRouter.get('/schedule', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // --- Calculate date range for NEXT month (Same logic as generation route) ---
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const targetMonthIndex = (currentMonth + 1) % 12;
        const targetYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const viewStartDate = new Date(Date.UTC(targetYear, targetMonthIndex, 1));
        const monthAfterTargetIndex = (targetMonthIndex + 1) % 12;
        const yearOfMonthafterTarget = targetMonthIndex === 11 ? targetYear + 1 : targetYear;
        const firstDayOfNextMonth = new Date(Date.UTC(yearOfMonthafterTarget, monthAfterTargetIndex, 1));
        const viewEndDate = new Date(firstDayOfNextMonth.getTime() - 1); // End of day UTC
        // --- End Date Calculation ---

        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        const viewMonthStr = monthFormatter.format(viewStartDate);

        console.log(`[Route /schedule] Fetching schedule view for: ${viewMonthStr}`);

        // Fetch shifts using the service function
        const shifts = await schedulingService.getShiftsForPeriod(viewStartDate, viewEndDate);

        // --- Group shifts by date for easier rendering in the template ---
        // Use Map for ordered keys (dates)
        const shiftsByDate = new Map<string, IShift[]>();
        shifts.forEach(shift => {
            // Format date as YYYY-MM-DD (use UTC date parts)
            const dateStr = shift.shift_date.toISOString().split('T')[0];
            if (!shiftsByDate.has(dateStr)) {
                shiftsByDate.set(dateStr, []);
            }
            shiftsByDate.get(dateStr)?.push(shift);
        });
        // --- End Grouping ---

        res.render('schedule_view', { // Render the schedule view template
            title: `Schedule for ${viewMonthStr}`,
            scheduleData: shiftsByDate, // Pass the grouped data
            startDate: viewStartDate,
            endDate: viewEndDate,
            viewMonthStr: viewMonthStr,
            successFlash: req.flash('success'),
            errorFlash: req.flash('error')
        });

    } catch (error: any) {
        console.error('[Route /schedule] Error fetching or rendering schedule:', error);
        req.flash('error', `Could not load schedule view: ${error.message || 'Unknown error'}`);
        // Redirect home or render an error page
        res.redirect('/');
    }
});


export default mainRouter;