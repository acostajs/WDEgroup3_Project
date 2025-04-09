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

def create_schedule(target_date=None):
    """
    Generates a schedule for a specific calendar month based on forecast
    and saves shifts to DB, then sends notifications.

    Args:
        target_date (datetime.date, optional): A date within the month to generate for.
                                              Defaults to today's date (current month).
    """
    print("--- Starting Schedule Generation ---")
    employee_shifts_to_notify = defaultdict(list)
    employees_scheduled = {}

    try:
        # Determine target month
        if target_date is None:
            target_date = datetime.date.today()
        start_of_month = target_date.replace(day=1)
        # Calculate number of days in the target month
        days_in_month = calendar.monthrange(start_of_month.year, start_of_month.month)[1]
        # Calculate end of the month (exclusive for filtering)
        end_of_month = start_of_month + timedelta(days=days_in_month)
        month_name_str = start_of_month.strftime("%B %Y")
        print(f"Targeting schedule generation for: {month_name_str}")


        # 1. Get Forecast (Forecast further ahead to ensure coverage)
        #    Let's forecast ~60 days - adjust if needed for edge cases
        days_to_forecast = 60
        print(f"Generating forecast for {days_to_forecast} days...")
        forecast_df = forecasting.generate_forecast(days_to_predict=days_to_forecast)
        if forecast_df is None:
            print("ERROR: Forecast generation failed.")
            return False

        # Filter forecast for ONLY the dates within the target month
        target_month_forecast = forecast_df[
            (forecast_df['ds'] >= pd.Timestamp(start_of_month)) &
            (forecast_df['ds'] < pd.Timestamp(end_of_month))
        ].copy()

        if target_month_forecast.empty:
            print(f"No forecast data available for the target month ({month_name_str}).")
            # Might still want to clear shifts for this month
        else:
             print(f"Using {len(target_month_forecast)} forecast days within {month_name_str}.")


        # 2. Get Employees (No change needed)
        employees = Employee.query.all()
        if not employees:
            print("WARNING: No employees found.")
            # Still proceed to clear shifts for the month
        else:
            employee_list = list(employees)
            print(f"Found {len(employee_list)} employees.")


        # 3. Clear existing shifts *for the target month only*
        print(f"Clearing existing shifts for {month_name_str}...")
        num_deleted = Shift.query.filter(
            Shift.start_time >= start_of_month,
            Shift.start_time < end_of_month
        ).delete(synchronize_session='fetch')
        print(f"{num_deleted} existing shifts cleared from session (pending commit).")


        # 4. Loop through TARGET MONTH forecast & Prepare Shifts
        shifts_to_add_to_session = []
        print(f"Preparing new shifts for {month_name_str}...")
        # Iterate only over the days within the target month's forecast
        for index, row in target_month_forecast.iterrows():
            forecast_date = row['ds'].date() # Date is already within the target month
            predicted_demand = row['yhat']

            # --- Keep staffing rule, assignment, shift creation logic ---
            if predicted_demand < DEMAND_THRESHOLD: num_needed = LOW_DEMAND_STAFF
            else: num_needed = HIGH_DEMAND_STAFF
            print(f"Date: {forecast_date}, Predicted: {predicted_demand:.2f}, Staff Needed: {num_needed}")

            num_to_assign = min(num_needed, len(employee_list))
            if num_to_assign > 0:
                random.shuffle(employee_list)
                assigned_employees = employee_list[:num_to_assign]
                for emp in assigned_employees:
                    start_datetime = datetime.datetime.combine(forecast_date, SHIFT_START_TIME)
                    end_datetime = datetime.datetime.combine(forecast_date, SHIFT_END_TIME)
                    new_shift = Shift(employee_id=emp.id, start_time=start_datetime, end_time=end_datetime)
                    shifts_to_add_to_session.append(new_shift)
                    employee_shifts_to_notify[emp.id].append(new_shift)
                    employees_scheduled[emp.id] = emp
                    print(f"  - Prepared shift for {emp.name} ({start_datetime.strftime('%Y-%m-%d %H:%M')} to {end_datetime.strftime('%H:%M')})")
            else:
                 print(f"  - No staff assigned (needed {num_needed}, available {len(employee_list)})")
            # --- End of inner assignment loop ---
        # --- End of loop through forecast days ---


        # 5. Add all prepared shifts and commit (No change needed)
        if shifts_to_add_to_session:
            print(f"Attempting to add and commit {len(shifts_to_add_to_session)} new shifts for {month_name_str}...")
            db.session.add_all(shifts_to_add_to_session)
            db.session.commit() # Commit delete and all adds
            print("Shifts committed successfully.")

            # 6. Send Notifications (No change needed - uses committed shifts)
            print("--- Starting Email Notifications ---")
            # ... (keep existing notification loop) ...
            print(f"--- Email Notifications Finished: ... ---")

        else:
            # Commit the delete even if no new shifts are added
            db.session.commit()
            print(f"No new shifts generated for {month_name_str}. Existing shifts for month cleared.")

        return True # Overall function success

    except Exception as e:
        db.session.rollback()
        print(f"ERROR during schedule generation for {target_date.strftime('%B %Y') if target_date else 'current month'}: {e}")
        # import traceback # Uncomment for detailed errors
        # print(traceback.format_exc())
        return False
    finally:
        print("--- Schedule Generation Process Finished ---")


# Example of how to call it (for testing purposes if run directly - needs app context!)
if __name__ == '__main__':
    # This direct call won't work easily without setting up a Flask app context.
    # It's better to test via a Flask route or 'flask shell'.
    print("This script should be called from within a Flask application context.")
    print("Use 'flask shell' or a web route to run create_schedule().")