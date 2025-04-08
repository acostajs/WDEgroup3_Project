# app/utils/scheduling.py

from app import db # Import the database instance
from app.models import Employee, Shift # Import your database models
from . import forecasting # Import the forecasting module from the same directory (utils)
import datetime
import random
import pandas as pd # Need pandas to work with the forecast DataFrame

# --- Configuration (Simple settings for the prototype) ---
DEMAND_THRESHOLD = 175 # Arbitrary threshold based on forecast value 'yhat'
LOW_DEMAND_STAFF = 1 # Number of staff needed if below threshold
HIGH_DEMAND_STAFF = 2 # Number of staff needed if at/above threshold
SHIFT_START_TIME = datetime.time(9, 0) # 9:00 AM
SHIFT_END_TIME = datetime.time(17, 0) # 5:00 PM
# --------------------------------------------------------

def create_schedule(days_to_forecast=7):
    """
    Generates a simple schedule based on forecast and saves shifts to DB.

    Args:
        days_to_forecast (int): How many days out to generate the forecast for.

    Returns:
        bool: True if schedule generation was attempted successfully (even if no shifts created),
              False if a major error occurred (e.g., forecast failed).
    """
    print("--- Starting Schedule Generation ---")
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

        # 4. Loop through forecast & Create Shifts
        shifts_created_count = 0
        for index, row in future_forecast.iterrows():
            forecast_date = row['ds'].date() # Get the date part
            predicted_demand = row['yhat'] # The predicted value

            # Apply simple rule to determine staff needed
            if predicted_demand < DEMAND_THRESHOLD:
                num_needed = LOW_DEMAND_STAFF
            else:
                num_needed = HIGH_DEMAND_STAFF

            print(f"Date: {forecast_date}, Predicted: {predicted_demand:.2f}, Staff Needed: {num_needed}")

            # Ensure we don't need more staff than available
            num_to_assign = min(num_needed, len(employee_list))

            if num_to_assign > 0:
                # Randomly select employees for this day's shifts
                random.shuffle(employee_list) # Shuffle the list in place
                assigned_employees = employee_list[:num_to_assign]

                for emp in assigned_employees:
                    start_datetime = datetime.datetime.combine(forecast_date, SHIFT_START_TIME)
                    end_datetime = datetime.datetime.combine(forecast_date, SHIFT_END_TIME)

                    new_shift = Shift(
                        employee_id=emp.id,
                        start_time=start_datetime,
                        end_time=end_datetime
                        # Add other fields like role later if needed
                    )
                    db.session.add(new_shift)
                    shifts_created_count += 1
                    print(f"  - Added shift for {emp.name} ({start_datetime} to {end_datetime})")
            else:
                print(f"  - No staff assigned (needed {num_needed}, available {len(employee_list)})")


        # 5. Commit changes to DB
        print(f"Attempting to commit {shifts_created_count} new shifts...")
        db.session.commit()
        print("Shifts committed successfully.")
        return True

    except Exception as e:
        db.session.rollback() # Rollback any changes if an error occurred
        print(f"ERROR during schedule generation: {e}")
        # import traceback
        # print(traceback.format_exc())
        return False
    finally:
        print("--- Schedule Generation Finished ---")


# Example of how to call it (for testing purposes if run directly - needs app context!)
if __name__ == '__main__':
    # This direct call won't work easily without setting up a Flask app context.
    # It's better to test via a Flask route or 'flask shell'.
    print("This script should be called from within a Flask application context.")
    print("Use 'flask shell' or a web route to run create_schedule().")