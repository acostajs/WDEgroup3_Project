import PerformanceLog, { IPerformanceLog } from '../models/PerformanceLog';
import mongoose from 'mongoose';
import { IEmployee } from '../models/Employee'

// Define an interface for the data needed to create a log
// This helps type the data coming from the route/form
interface PerformanceLogData {
  employee: string | mongoose.Types.ObjectId; // Should be the employee's ObjectId string
  log_date: string | Date; // Expecting YYYY-MM-DD string from form or Date object
  rating?: number;
  notes?: string;
}

/**
 * Creates and saves a new performance log entry.
 * @param data - The performance log data from the form.
 * @returns The saved performance log document.
 * @throws Error if validation or saving fails.
 */
export const createPerformanceLog = async (data: PerformanceLogData): Promise<IPerformanceLog> => {
    console.log('[Performance Service] Received data for new log:', data);

    const logDate = new Date(data.log_date); // Ensure we have a Date object
    const employeeId = data.employee;

    // --- Check for existing log in the same calendar month ---
    try {
        const year = logDate.getUTCFullYear();
        const month = logDate.getUTCMonth(); // 0-indexed

        // Start of the month for logDate
        const startDateOfMonth = new Date(Date.UTC(year, month, 1));
        // Start of the *next* month
        const startDateOfNextMonth = new Date(Date.UTC(year, month + 1, 1));

        console.log(`[Performance Service] Checking for existing log for employee ${employeeId} between ${startDateOfMonth.toISOString()} and ${startDateOfNextMonth.toISOString()}`);

        const existingLog = await PerformanceLog.findOne({
            employee: employeeId,
            log_date: {
                $gte: startDateOfMonth,
                $lt: startDateOfNextMonth // Check logs strictly less than the start of the next month
            }
        });

        if (existingLog) {
            // Duplicate found for this month! Throw an error.
            console.warn(`[Performance Service] Duplicate log detected for employee ${employeeId} for month ${year}-${month + 1}. Existing log ID: ${existingLog._id}`);
            throw new Error(`A performance log already exists for this employee for ${startDateOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}.`);
        }
        console.log(`[Performance Service] No existing log found for employee ${employeeId} in ${year}-${month + 1}. Proceeding to save.`);

    } catch (error) {
        // Handle potential errors during the check itself, or re-throw the duplicate error
        console.error('[Performance Service] Error during duplicate check:', error);
        // If it was our specific duplicate error, re-throw it, otherwise throw a generic check error
        if (error instanceof Error && error.message.startsWith('A performance log already exists')) {
            throw error;
        }
        throw new Error(`Failed to check for existing performance logs: ${error instanceof Error ? error.message : String(error)}`);
    }
    // --- End Check ---


    // If no duplicate, proceed to create and save the new log
    const performanceLog = new PerformanceLog({
        employee: employeeId,
        log_date: logDate, // Use the Date object
        rating: data.rating,
        notes: data.notes,
    });

    try {
        const savedLog = await performanceLog.save();
        console.log('[Performance Service] Performance log saved successfully:', savedLog._id);
        return savedLog;
    } catch (error) {
        console.error('[Performance Service] Error saving performance log:', error);
        // Re-throw validation or other save errors
        throw error;
    }
};

/**
 * Fetches performance logs (implementation later).
 */
export const getPerformanceLogs = async (): Promise<IPerformanceLog[]> => {
    console.log('[Performance Service] Fetching performance logs...');
    try {
        // Find logs, populate employee name and position, sort by log date descending
        const logs = await PerformanceLog.find({})
        .populate('employee')
        .sort({ log_date: -1 }); 

        console.log(`[Performance Service] Found ${logs.length} performance logs.`);
        return logs;
    } catch (error) {
        console.error('[Performance Service] Error fetching performance logs:', error);
        throw new Error(`Error fetching performance logs: ${error instanceof Error ? error.message : String(error)}`);
    }
};
// Add other functions as needed (e.g., getLogById, updateLog, deleteLog)