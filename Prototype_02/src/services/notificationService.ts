// src/services/notificationService.ts

import nodemailer from 'nodemailer';
import config from '../config';
import { IShift } from '../models/Shift';
import { IEmployee } from '../models/Employee'; // Import IEmployee
import ejs from 'ejs'; // <-- Import EJS
import path from 'path'; // <-- Import Path
import mongoose from 'mongoose'; // Import Mongoose for types if needed by IShift/IEmployee

// Define the type needed by the function signature & email template
// Ensures assigned_employee is the populated object, not null or ObjectId
type PopulatedShiftForEmail = IShift & {
    assigned_employee: IEmployee & { email: string; name: string };
};

let transporter: nodemailer.Transporter | null = null;

// --- Initialize Transporter ---
try {
    if (config.emailService) {
        // Use service name (like SendGrid)
        transporter = nodemailer.createTransport({
            service: config.emailService,
            auth: {
                user: config.emailUser,
                pass: config.emailPass,
            },
        });
         console.log(`>>> Nodemailer transporter configured using service: ${config.emailService}`);
    } else if (config.emailHost && config.emailUser && config.emailPass) {
         // Use Host/Port/Auth
         transporter = nodemailer.createTransport({
            host: config.emailHost,
            port: config.emailPort,
            secure: config.emailSecure, // true for 465, false for others
            auth: {
                user: config.emailUser,
                pass: config.emailPass,
            },
        });
         console.log(`>>> Nodemailer transporter configured using host: ${config.emailHost}`);
    } else {
        console.warn('!!! Email service not configured. Transporter not created.');
    }

    // Verify connection configuration if transporter was created
    if (transporter) {
        transporter.verify((error, success) => {
            if (error) {
                console.error('!!! Nodemailer transporter verification failed:', error);
                transporter = null; // Invalidate transporter on verification failure
            } else {
                console.log('>>> Nodemailer transporter verified successfully.');
            }
        });
    }

} catch (error) {
    console.error('!!! Failed to create Nodemailer transporter:', error);
    transporter = null; // Ensure transporter is null on error
}
// --- End Initialize Transporter ---


/**
 * Sends a schedule notification email to an employee using an EJS template.
 *
 * @param employeeEmail The recipient's email address.
 * @param employeeName The recipient's name.
 * @param shifts An array of PopulatedShiftForEmail objects assigned to the employee.
 * @param targetMonthStr String representation of the month (e.g., "May 2025").
 */
export const sendScheduleNotification = async (
    employeeEmail: string,
    employeeName: string,
    shifts: PopulatedShiftForEmail[], // Use the specific type
    targetMonthStr: string
): Promise<void> => {

    if (!transporter) {
        console.error(`!!! Email transporter not available. Cannot send schedule to ${employeeEmail}.`);
        return; // Don't proceed if transporter isn't ready
    }
    if (!shifts || shifts.length === 0) {
        console.log(`No shifts to notify for ${employeeName} (${employeeEmail}). Skipping email.`);
        return;
    }

    console.log(`[Notification Service] Preparing schedule email for ${employeeName} (${employeeEmail}) for ${targetMonthStr}...`);

    try {
        // --- Render Email using EJS Template ---
        const templatePath = path.join(__dirname, '../../views/email/schedule_update.ejs');
        // Ensure the data passed matches what the template expects (name, shifts, month)
        const emailHtml = await ejs.renderFile(templatePath, {
            name: employeeName,
            shifts: shifts, // Pass the shifts array directly
            month: targetMonthStr
        });
        // --- End Render Email ---

        const mailOptions: nodemailer.SendMailOptions = {
            from: config.emailFrom, // Sender address (from .env)
            to: employeeEmail,      // Recipient address
            subject: `Your Pozole Schedule for ${targetMonthStr}`, // Subject line
            html: emailHtml,        // Use rendered HTML from EJS template
        };

        console.log(`[Notification Service] Sending email to ${employeeEmail}...`);
        let info = await transporter.sendMail(mailOptions);
        console.log(`[Notification Service] Email sent successfully to ${employeeEmail}. Message ID: ${info.messageId}`);

    } catch (error) {
        console.error(`[Notification Service] Error rendering template or sending email to ${employeeEmail}:`, error);
        // Decide how to handle errors (e.g., log, retry, notify admin)
    }
};