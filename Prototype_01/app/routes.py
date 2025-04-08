# IMPORTS

from flask import Blueprint, render_template, flash, redirect, url_for
from app.models import Employee, Shift, PerformanceLog
from app.forms import PerformanceLogForm
from app.utils import forecasting, scheduling
from sqlalchemy import desc
from app import db
from sqlalchemy.orm import joinedload 
from collections import defaultdict
from datetime import timedelta
import datetime 
# Notice: We don't need to import 'app' or 'current_app' here anymore for route definition

# Create a Blueprint object named 'main' (you can choose the name)
bp = Blueprint('main', __name__)

# Define routes using the Blueprint instance 'bp'
@bp.route('/')
@bp.route('/index')
def index():
    return render_template('index.html', title='Home')

@bp.route('/run_forecast')
def run_forecast_route():
    """Route to trigger the forecast generation and display results."""
    print("Accessed /run_forecast route")
    try:

        forecast_df = forecasting.generate_forecast()

        if forecast_df is not None:
            print("Forecast DataFrame generated successfully.")
            html_table = forecast_df.tail(10).to_html(border=1)
            return f"<h2>Forecast Results (Last 10 Periods)</h2>{html_table}"
        else:
            print("forecasting.generate_forecast() returned None.")
            return "Error during forecast generation. Check container logs for details.", 500

    except Exception as e:
        print(f"Exception in /run_forecast route: {e}")
        return f"An unexpected error occurred in the route: {e}", 500
    
@bp.route('/generate_schedule')
def generate_schedule_route():
    """Route to trigger the schedule generation."""
    print("Accessed /generate_schedule route") 
    try:
        success = scheduling.create_schedule(days_to_forecast=14) 

        if success:
            print("Scheduling function reported success.")
            flash('New schedule generated successfully based on forecast!', 'success')
        else:
            print("Scheduling function reported failure.")
            flash('Error generating schedule. Check application logs for details.', 'danger')

    except Exception as e:
        print(f"Exception in /generate_schedule route: {e}")
        flash(f'An unexpected error occurred while trying to generate the schedule: {e}', 'danger')

    return redirect(url_for('main.index'))

@bp.route('/schedule')
def schedule_view():
    """Displays the generated future schedule grouped by week with costs."""
    print("Accessed /schedule route")
    try:
        today = datetime.date.today()
        today_start = datetime.datetime.combine(today, datetime.time.min)

        shifts = db.session.query(Shift).options(joinedload(Shift.employee))\
            .join(Shift.employee)\
            .filter(Shift.start_time >= today_start)\
            .order_by(Shift.start_time, Employee.name).all()

        print(f"Found {len(shifts)} shifts to display starting from {today.strftime('%Y-%m-%d')}.")

        weekly_shifts = defaultdict(list)
        weekly_costs = defaultdict(float)
        grand_total_cost = 0.0

        for shift in shifts:
            # Calculate week start date (Monday)
            shift_date = shift.start_time.date()
            week_start = shift_date - timedelta(days=shift_date.weekday()) # weekday() is 0 for Monday

            # Group shift
            weekly_shifts[week_start].append(shift)

            if shift.employee and shift.employee.hourly_rate:
                duration_seconds = (shift.end_time - shift.start_time).total_seconds()
                duration_hours = duration_seconds / 3600
                shift_cost = duration_hours * shift.employee.hourly_rate
                weekly_costs[week_start] += shift_cost
                grand_total_cost += shift_cost

        sorted_weeks = sorted(weekly_shifts.keys())
        weekly_data = []
        for week_start_date in sorted_weeks:
            weekly_data.append(
                (week_start_date, weekly_shifts[week_start_date], weekly_costs[week_start_date])
            )

        print(f"Grouped shifts into {len(weekly_data)} weeks.")
        print(f"Calculated grand total estimated cost: {grand_total_cost:.2f}")
        
        return render_template(
            'schedule_view.html',
            title='View Schedule',
            weekly_data=weekly_data,
            grand_total_cost=grand_total_cost 
            )

    except Exception as e:
        print(f"Error querying/processing shifts: {e}")
        flash('Error loading schedule view.', 'danger')
        return redirect(url_for('main.index'))
    
@bp.route('/add_performance', methods=['GET', 'POST'])
def add_performance_log():
    """Route to display and handle the performance log input form."""
    form = PerformanceLogForm()
    if form.validate_on_submit():
        try:
            employee = form.employee.data

            new_log = PerformanceLog(
                employee_id=employee.id,
                log_date=form.log_date.data,
                tasks_completed=form.tasks_completed.data,
                rating=form.rating.data,
                notes=form.notes.data
            )
            db.session.add(new_log)
            db.session.commit()

            flash(f'Performance logged successfully for {employee.name} on {form.log_date.data}.', 'success')

            return redirect(url_for('main.add_performance_log'))
        except Exception as e:
            db.session.rollback()
            print(f"Error saving performance log: {e}")
            flash(f'Database error saving performance log: {e}', 'danger')

    return render_template('add_performance.html', title='Log Performance', form=form)

@bp.route('/performance_dashboard')
def performance_dashboard():
    """Displays recorded performance logs in a table."""
    print("Accessed /performance_dashboard route")
    try:
        logs = db.session.query(PerformanceLog).join(PerformanceLog.employee)\
            .order_by(desc(PerformanceLog.log_date), Employee.name).all()

        print(f"Found {len(logs)} performance logs.")

        return render_template(
            'performance_dashboard.html',
            title='Performance Dashboard',
            logs=logs 
        )

    except Exception as e:
        print(f"Error querying performance logs: {e}")
        flash('Error loading performance dashboard.', 'danger')
        return redirect(url_for('main.index'))



# --- Add any other routes using @bp.route(...) ---
# Example:
# @bp.route('/schedule')
# def schedule():
#     return render_template('schedule_view.html', title='Schedule')