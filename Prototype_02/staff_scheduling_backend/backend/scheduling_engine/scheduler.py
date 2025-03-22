import sys
import os

# Force reload (if needed)
if "backend.database.models" in sys.modules:
    del sys.modules["backend.database.models"]

# Add the parent directory of 'backend' to sys.path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Verify sys.path
print(sys.path)


from backend.database.models import Employee, Schedule, Shift, session
from datetime import date, time

def generate_schedule(schedule_date: date):
    """
    Generates a work schedule for the given date.
    """
    print(f"Generating schedule for {schedule_date}")

    # 1. Retrieve Data
    employees = session.query(Employee).all()
    existing_schedule = session.query(Schedule).filter_by(schedule_date=schedule_date).first()

    # 2. Initialize Schedule
    if not existing_schedule:
        schedule = Schedule(schedule_date=schedule_date)
        session.add(schedule)
        session.commit()
    else:
        schedule = existing_schedule

    # 3. Assign Shifts (Placeholder)
    start_time = time(8, 0)  # 8:00 AM
    end_time = time(16, 0)  # 4:00 PM

    for employee in employees:
        new_shift = Shift(
            employee_id=employee.id,
            schedule_id=schedule.id,
            start_time=start_time,
            end_time=end_time
        )
        session.add(new_shift)
        session.commit()

    # 4. Optimize Schedule (Placeholder)
    # TODO: Implement schedule optimization

    # 5. Save Schedule (Placeholder)
    # TODO: Save the generated schedule to the database

    print(f"Schedule generated for {schedule_date}")
    return schedule

if __name__ == '__main__':
    # Example usage
    test_date = date(2023, 12, 27)
    generate_schedule(test_date)
