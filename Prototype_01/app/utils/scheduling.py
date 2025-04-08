# app/utils/scheduling.py

from app import db # Import the database instance
from app.models import Employee, Shift # Import your database models
from . import forecasting # Import the forecasting module from the same directory (utils)
from .notifications import send_schedule_update_email
import datetime
import random
import pandas as pd # Need pandas to work with the forecast DataFrame
from collections import defaultdict

# --- Configuration (Simple settings for the prototype) ---
DEMAND_THRESHOLD = 175 # Arbitrary threshold based on forecast value 'yhat'
LOW_DEMAND_STAFF = 1 # Number of staff needed if below threshold
HIGH_DEMAND_STAFF = 2 # Number of staff needed if at/above threshold
SHIFT_START_TIME = datetime.time(9, 0) # 9:00 AM
SHIFT_END_TIME = datetime.time(17, 0) # 5:00 PM
# --------------------------------------------------------

def create_schedule(days_to_forecast=7):
    """
    Generates a simple schedule based on forecast, saves shifts to DB,
    and sends email notifications to assigned employees.
    """ 
    print("--- Starting Schedule Generation ---")
    employee_shifts_to_notify = defaultdict(list)
    employees_scheduled = {} 
    try:
        # 1. Get Forecast
        print(f"Generating forecast for {days_to_forecast} days...")
        forecast_df = forecasting.generate_forecast(days_to_predict=days_to_forecast)

        if forecast_df is None:
            print("ERROR: Forecast generation failed. Cannot create schedule.")
            return False

        # Filter forecast for future dates only (where scheduling is needed)
        # Assuming 'ds' is datetime objects from forecasting step
        today = pd.Timestamp.today().normalize() # Get today's date at midnight
        future_forecast = forecast_df[forecast_df['ds'] > today].copy()

        if future_forecast.empty:
            print("No future dates in forecast to schedule.")
            return True # Not an error, just nothing to do

        print(f"Forecast contains {len(future_forecast)} future days to schedule.")

        # 2. Get Employees
        employees = Employee.query.all()
        if not employees:
            print("WARNING: No employees found in the database. Cannot assign shifts.")
            return True # Not an error, but can't schedule

        employee_list = list(employees) # Create a list copy
        print(f"Found {len(employee_list)} employees.")

        # 3. Clear existing future shifts (optional, prevents duplicates if run multiple times)
        print("Clearing existing shifts starting from tomorrow...")
        tomorrow = today + pd.Timedelta(days=1)
        Shift.query.filter(Shift.start_time >= tomorrow).delete()
        # Don't commit yet, commit at the end

        # 4. Loop through forecast & Prepare Shifts (Modified)
        shifts_to_add_to_session = [] # Collect shifts before adding to session
        print("Preparing new shifts based on forecast...")
        for index, row in future_forecast.iterrows():
            forecast_date = row['ds'].date()
            predicted_demand = row['yhat']

            if predicted_demand < DEMAND_THRESHOLD:
                num_needed = LOW_DEMAND_STAFF
            else:
                num_needed = HIGH_DEMAND_STAFF
            print(f"Date: {forecast_date}, Predicted: {predicted_demand:.2f}, Staff Needed: {num_needed}")

            num_to_assign = min(num_needed, len(employee_list))

            if num_to_assign > 0:
                random.shuffle(employee_list)
                assigned_employees = employee_list[:num_to_assign]

                for emp in assigned_employees:
                    start_datetime = datetime.datetime.combine(forecast_date, SHIFT_START_TIME)
                    end_datetime = datetime.datetime.combine(forecast_date, SHIFT_END_TIME)

                    new_shift = Shift(
                        employee_id=emp.id,
                        start_time=start_datetime,
                        end_time=end_datetime
                    )
                    shifts_to_add_to_session.append(new_shift) # Collect shift object
                    # Store for notification, keyed by employee ID
                    employee_shifts_to_notify[emp.id].append(new_shift)
                    employees_scheduled[emp.id] = emp # Store employee object
                    print(f"  - Prepared shift for {emp.name} ({start_datetime.strftime('%Y-%m-%d %H:%M')} to {end_datetime.strftime('%H:%M')})")
            else:
                print(f"  - No staff assigned (needed {num_needed}, available {len(employee_list)})")


        # 5. Add all prepared shifts and commit
        if shifts_to_add_to_session:
            print(f"Attempting to add and commit {len(shifts_to_add_to_session)} new shifts...")
            db.session.add_all(shifts_to_add_to_session) # Add all shifts at once
            db.session.commit() # Commit the delete and all adds
            print("Shifts committed successfully.")

            # --- 6. Send Notifications --- <<< NEW SECTION
            print("--- Starting Email Notifications ---")
            notification_success_count = 0
            notification_fail_count = 0
            # Iterate through employees who had shifts prepared
            for emp_id, shifts_list in employee_shifts_to_notify.items():
                employee = employees_scheduled.get(emp_id) # Get the full employee object
                if employee:
                    print(f"Attempting to send notification to {employee.name} ({employee.email})...")
                    # Sort shifts by start time before sending
                    shifts_list.sort(key=lambda x: x.start_time)
                    # Call the notification function
                    if send_schedule_update_email(employee, shifts_list):
                        notification_success_count += 1
                    else:
                        notification_fail_count += 1
                else:
                     # Should not happen if logic is correct, but safety check
                     print(f"Warning: Could not find employee object for ID {emp_id} during notification.")
                     notification_fail_count += 1

            print(f"--- Email Notifications Finished: {notification_success_count} succeeded, {notification_fail_count} failed ---")
            # --- End Notifications ---

        else:
            print("No shifts were generated, skipping commit and notifications.")

        return True # Overall function success

    except Exception as e:
        db.session.rollback() # Rollback DB changes on any error
        print(f"ERROR during schedule generation or notification: {e}")
        # import traceback
        # print(traceback.format_exc()) # Uncomment for detailed errors
        return False
    finally:
        print("--- Schedule Generation Process Finished ---")


# Example of how to call it (for testing purposes if run directly - needs app context!)
if __name__ == '__main__':
    # This direct call won't work easily without setting up a Flask app context.
    # It's better to test via a Flask route or 'flask shell'.
    print("This script should be called from within a Flask application context.")
    print("Use 'flask shell' or a web route to run create_schedule().")