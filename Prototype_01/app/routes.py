# IMPORTS

from flask import Blueprint, render_template, flash, redirect, url_for
from app.models import Employee, Shift
from app.utils import forecasting, scheduling
from app import db
from sqlalchemy.orm import joinedload 
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
    """Displays the generated future schedule."""
    print("Accessed /schedule route")
    try:
        today_start = datetime.datetime.combine(datetime.date.today(), datetime.time.min)

        shifts = db.session.query(Shift).options(joinedload(Shift.employee))\
            .join(Shift.employee)\
            .filter(Shift.start_time >= today_start)\
            .order_by(Shift.start_time, Employee.name).all()

        print(f"Found {len(shifts)} shifts to display starting from {today_start.date()}.")

        return render_template('schedule_view.html', title='View Schedule', shifts=shifts)

    except Exception as e:
        print(f"Error querying or rendering shifts: {e}")

        flash('Error loading schedule view.', 'danger')
        return redirect(url_for('main.index')) 

# --- Add any other routes using @bp.route(...) ---
# Example:
# @bp.route('/schedule')
# def schedule():
#     return render_template('schedule_view.html', title='Schedule')