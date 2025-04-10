// src/services/schedulingService.ts

import Shift, { IShift } from '../models/Shift'; // Ensure IShift includes start_time, end_time
import Employee from '../models/Employee'; // We might need this later for assignments
import * as forecastingService from './forecastingService';

// --- Scheduling Configuration (Based on Prototype 01) ---

const DEMAND_THRESHOLD = 175;

const SHIFT_TIMES = {
    DAY: { start: '10:00', end: '18:00' },
    EVE: { start: '16:00', end: '00:00' }, // Using 00:00 for midnight end
};

// Base staff needs per position for each shift type
const BASE_NEEDS = {
    DAY: {
        'Manager': 1, 'Host/Hostess': 1, 'Server': 1, 'Bartender': 1,
        'Chef de Partie': 1, 'Cook': 2, 'Dishwasher': 1, 'Chef': 1,
        // 'Sous Chef': 0 // Explicitly 0 or handle missing keys
    },
    EVE: {
        'Manager': 1, 'Host/Hostess': 1, 'Server': 3, 'Bartender': 1,
        'Chef de Partie': 2, 'Cook': 4, 'Dishwasher': 2, 'Sous Chef': 1,
        // 'Chef': 0 // Explicitly 0 or handle missing keys
    },
};

// Extra staff needed *only* for EVE shift on HIGH demand days
const HIGH_DEMAND_EXTRA = {
    'Server': 2,
    'Cook': 2,
};

// Helper Type for structured needs
type StaffNeeds = { [position: string]: number }; // Position: Count

// Type for the forecast data structure (adjust if your Python output differs slightly)
interface ForecastRecord {
    ds: string; // Date string e.g., "2025-04-11"
    yhat: number; // Forecasted value
    yhat_lower: number;
    yhat_upper: number;
}

/**
 * @param targetStartDate The first day (inclusive, UTC 00:00:00) of the target month.
 * @param targetEndDate The last day (inclusive, UTC 23:59:59) of the target month.
 * @returns Promise<IShift[]> Array of the created shift documents.
 * @throws Error if forecasting fails or database operation fails.
 */
export const generateSchedule = async (targetStartDate: Date, targetEndDate: Date): Promise<IShift[]> => {
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const targetMonthStr = monthFormatter.format(targetStartDate);
    console.log(`[Scheduling Service] Requesting schedule generation for target month: ${targetMonthStr}`);
    console.log(`[Scheduling Service] Target Date Range: ${targetStartDate.toISOString()} to ${targetEndDate.toISOString()}`);

    try {
        // 1. Calculate Forecast Duration Needed
        // We need forecast data from today up to targetEndDate + buffer
        const today = new Date();
        // Ensure 'today' is set to the start of the day in UTC for consistent difference calculation
        today.setUTCHours(0, 0, 0, 0);
        const msPerDay = 1000 * 60 * 60 * 24;
        // Ensure targetEndDate includes the full last day for calculation
        const endOfDayTargetEndDate = new Date(targetEndDate);
        endOfDayTargetEndDate.setUTCHours(23, 59, 59, 999);

        // Calculate days from today to the end of the target month
        let daysToForecast = Math.ceil((endOfDayTargetEndDate.getTime() - today.getTime()) / msPerDay);

        // Add a buffer (e.g., 7 days)
        daysToForecast = Math.max(1, daysToForecast) + 7; // Ensure at least 1 day + buffer
        console.log(`[Scheduling Service] Forecasting for ${daysToForecast} days from today to cover the target month.`);


        // 2. Get Forecast Data (for the calculated duration)
        console.log(`[Scheduling Service] Fetching forecast...`);
        const fullForecast: ForecastRecord[] = await forecastingService.generateForecast(daysToForecast);
        if (!fullForecast || fullForecast.length === 0) {
            throw new Error('Failed to retrieve valid forecast data.');
        }
        console.log(`[Scheduling Service] Full forecast received for ${fullForecast.length} days.`);

        // 3. Filter Forecast to Target Month
        // Important: Compare date parts only, ignoring time, or use UTC consistently
        const relevantForecast = fullForecast.filter(record => {
            const recordDate = new Date(record.ds + 'T00:00:00Z'); // Assume ds is YYYY-MM-DD, parse as UTC
            return recordDate >= targetStartDate && recordDate <= targetEndDate;
        });

        if (relevantForecast.length === 0) {
             console.warn(`[Scheduling Service] No forecast data found within the target month range (${targetMonthStr}). No shifts will be generated.`);
             return []; // Exit early if no forecast data for the target month
        }
        console.log(`[Scheduling Service] Filtered forecast to ${relevantForecast.length} days relevant for ${targetMonthStr}.`);


        // 4. Clear Existing Shifts for the TARGET MONTH ONLY
        console.log(`[Scheduling Service] Clearing existing shifts for ${targetMonthStr} (${targetStartDate.toISOString().split('T')[0]} to ${targetEndDate.toISOString().split('T')[0]})...`);
        const deleteResult = await Shift.deleteMany({
            shift_date: {
                $gte: targetStartDate,
                $lte: targetEndDate, // Use the precise end date passed in
            },
             // assigned_employee: null // Optional: Only delete unassigned
        });
        console.log(`[Scheduling Service] ${deleteResult.deletedCount} existing shifts deleted for the target month.`);

        // 5. Generate New Shifts based on Filtered Forecast and Rules
        const shiftsToCreate: Partial<IShift>[] = [];

        // Use the RELEVANT (filtered) forecast data
        for (const dayForecast of relevantForecast) {
            const shiftDate = new Date(dayForecast.ds + 'T00:00:00Z'); // Treat date as UTC
            const demand = dayForecast.yhat;
            const isHighDemand = demand >= DEMAND_THRESHOLD;
            const dateString = shiftDate.toISOString().split('T')[0];

            // console.log(`[Scheduling Service] Processing ${dateString}: Demand=${demand.toFixed(0)}. High Demand=${isHighDemand}`); // Verbose logging

            // Loop through DAY and EVE shift types
            for (const shiftType of Object.keys(SHIFT_TIMES) as Array<keyof typeof SHIFT_TIMES>) {
                const { start, end } = SHIFT_TIMES[shiftType];
                const baseNeedsForShift = BASE_NEEDS[shiftType];
                const currentShiftNeeds: StaffNeeds = {};

                // Calculate required staff, starting with base needs
                for (const position in baseNeedsForShift) {
                    currentShiftNeeds[position] = baseNeedsForShift[position as keyof typeof baseNeedsForShift];
                }

                // Apply high demand extras ONLY for EVE shift
                if (isHighDemand && shiftType === 'EVE') {
                    // console.log(`[Scheduling Service] ---- Applying High Demand extras for EVE shift on ${dateString}.`); // Verbose
                    for (const position in HIGH_DEMAND_EXTRA) {
                        const extraCount = HIGH_DEMAND_EXTRA[position as keyof typeof HIGH_DEMAND_EXTRA];
                        currentShiftNeeds[position] = (currentShiftNeeds[position] || 0) + extraCount;
                    }
                }

                // Create shift objects
                for (const position in currentShiftNeeds) {
                    const count = currentShiftNeeds[position];
                    if (count > 0) {
                        for (let i = 0; i < count; i++) {
                            shiftsToCreate.push({
                                shift_date: new Date(shiftDate), // Use a new Date object instance
                                start_time: start,
                                end_time: end,
                                required_position: position,
                                assigned_employee: null,
                            });
                        }
                    }
                }
            } // End loop through DAY/EVE
        } // End loop through relevant forecast days

        // 6. Save Shifts to Database
        if (shiftsToCreate.length > 0) {
            console.log(`[Scheduling Service] Attempting to insert ${shiftsToCreate.length} new shifts for ${targetMonthStr}...`);
            const createdShifts = await Shift.insertMany(shiftsToCreate, { ordered: false });
            console.log(`[Scheduling Service] Successfully inserted ${createdShifts.length} shifts for ${targetMonthStr}.`);
            return createdShifts as IShift[];
        } else {
            console.log(`[Scheduling Service] No shifts needed generation for ${targetMonthStr}.`);
            return [];
        }

    } catch (error) { // error is unknown type
        console.error(`[Scheduling Service] Error generating schedule for ${targetMonthStr}:`, error);

        let detailedMessage = 'Unknown error during schedule generation';

        if (error instanceof mongoose.Error.ValidationError) {
            console.error('Mongoose Validation Errors:', error.errors);
            detailedMessage = 'Database validation failed during shift creation.';
        } else if (error instanceof Error) {
             if (error.name === 'BulkWriteError' && (error as any).writeErrors) {
                 console.error('Mongoose Bulk Write Errors:', (error as any).writeErrors);
                 detailedMessage = 'Database bulk write error during shift creation.';
             } else {
                 detailedMessage = error.message;
             }
        } else {
            detailedMessage = String(error);
        }

        // Add target month info to the error thrown
        throw new Error(`Schedule generation failed for ${targetMonthStr}: ${detailedMessage}`);
    }
};

export const getShiftsForPeriod = async (startDate: Date, endDate: Date): Promise<IShift[]> => {
    console.log(`[Scheduling Service] Fetching shifts from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    try {
        const shifts = await Shift.find({
            shift_date: {
                $gte: startDate,
                $lte: endDate,
            }
        })
        .populate<{ assigned_employee: { _id: mongoose.Types.ObjectId, name: string, position: string } | null }>('assigned_employee', 'name position') // Populate employee name and position only
        .sort({ shift_date: 1, start_time: 1 }) // Sort by date, then start time
        .lean(); // Use .lean() for potentially better performance if we don't need Mongoose documents in the view

        console.log(`[Scheduling Service] Found ${shifts.length} shifts in the period.`);
        // Cast needed because .lean() returns plain objects, but they match IShift structure
        return shifts as IShift[];
    } catch (error) {
        console.error('[Scheduling Service] Error fetching shifts:', error);
        throw new Error(`Error fetching shifts for the specified period: ${error instanceof Error ? error.message : String(error)}`);
    }
};

// Import Mongoose at the end of the file for instanceof check if not already imported globally
import mongoose from 'mongoose';