from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import requests 


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)  # Initialize db here

from backend.models.models import Employee, Shift
from backend.schemas import EmployeeSchema, ShiftSchema
from marshmallow import ValidationError

with app.app_context():
    db.create_all()

# Initialize Marshmallow schemas
employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)
shift_schema = ShiftSchema()
shifts_schema = ShiftSchema(many=True)

API_BASE_URL = 'http://127.0.0.1:5000'

# UI
@app.route('/')
def index():
    return render_template('index.html')

# UI EMPLOYEES

@app.route('/employees_ui')
def list_employees_ui():
    employees = get_employees_data()  
    return render_template('employees.html', employees=employees)

@app.route('/employees_ui/create')
def create_employee_ui():
    return render_template('create_employee.html')

def get_employees_data():
    all_employees = db.session.query(Employee).all()
    return employees_schema.dump(all_employees)

@app.post('/employees_ui/submit_employee')
def submit_employee():
    if request.method == 'POST':
        name = request.form['name']
        role = request.form['role']
        availability = {
            'monday': request.form['monday'],
            'tuesday': request.form['tuesday'],
            'wednesday': request.form['wednesday'],
            'thursday': request.form['thursday'],
            'friday': request.form['friday'],
            'saturday': request.form['saturday'],
            'sunday': request.form['sunday']
        }

        availability = {day: times for day, times in availability.items() if times}

        employee_data = {
            'name': name,
            'role': role,
            'availability': availability
        }

        try:
            response = requests.post(f'{API_BASE_URL}/employees', json=employee_data)
            response.raise_for_status()
            return redirect(url_for('list_employees_ui'))  
        
        except requests.exceptions.RequestException as e:
            error_message = f"Error creating employee: {e}"
            if response.status_code == 400 and response.headers.get('Content-Type') == 'application/json':
                error_data = response.json()
                if 'error' in error_data:
                    error_message = f"Error creating employee: {error_data['error']}"
            return render_template('create_employee.html', error=error_message)
        
@app.route('/employees_ui/<int:employee_id>')
def employee_detail_ui(employee_id):
    try:
        response = requests.get(f'{API_BASE_URL}/employees/{employee_id}')
        response.raise_for_status()  # Raise an exception for bad status codes
        employee = response.json()
        return render_template('employee_detail.html', employee=employee)
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching employee details: {e}"
        return render_template('error.html', error=error_message, back_url=url_for('list_employees_ui'))
    
@app.post('/employees_ui/update_employee/<int:employee_id>')
def update_employee_ui(employee_id):
    if request.method == 'POST':
        name = request.form['name']
        role = request.form['role']
        availability = {
            'monday': request.form['monday'],
            'tuesday': request.form['tuesday'],
            'wednesday': request.form['wednesday'],
            'thursday': request.form['thursday'],
            'friday': request.form['friday'],
            'saturday': request.form['saturday'],
            'sunday': request.form['sunday']
        }

        # Filter out days with empty availability
        availability = {day: times for day, times in availability.items() if times}

        employee_data = {
            'name': name,
            'role': role,
            'availability': availability
        }

        try:
            response = requests.put(f'{API_BASE_URL}/employees/{employee_id}', json=employee_data)
            response.raise_for_status()
            return redirect(url_for('employee_detail_ui', employee_id=employee_id)) # Redirect to details on success
        except requests.exceptions.RequestException as e:
            error_message = f"Error updating employee: {e}"
            if response.status_code == 400 and response.headers.get('Content-Type') == 'application/json':
                error_data = response.json()
                if 'error' in error_data:
                    error_message = f"Error updating employee: {error_data['error']}"
            # Re-render the edit form with the error message
            return render_template('edit_employee.html', employee=employee_data, error=error_message)
        
@app.post('/employees_ui/delete_employee/<int:employee_id>')
def delete_employee_ui(employee_id):
    try:
        response = requests.delete(f'{API_BASE_URL}/employees/{employee_id}')
        response.raise_for_status()
        return redirect(url_for('list_employees_ui'))
    except requests.exceptions.RequestException as e:
        error_message = f"Error deleting employee: {e}"
        # Optionally, you could redirect back to the detail page with an error message
        return render_template('error.html', error=error_message, back_url=url_for('employee_detail_ui', employee_id=employee_id))


# UI SHIFTS

@app.route('/shifts_ui')
def list_shifts_ui():
    shifts = get_shifts_data()  
    return render_template('shifts.html', shifts=shifts)

@app.route('/shifts_ui/create')
def create_shift_ui():
    return render_template('create_shift.html')

def get_shifts_data():
    all_shifts = db.session.query(Shift).all()
    return shifts_schema.dump(all_shifts)

@app.post('/shifts_ui/submit_shift')
def submit_shift():
    if request.method == 'POST':
        start_time = request.form['start_time']
        end_time = request.form['end_time']
        day = request.form['day']
        employee_id = request.form.get('employee_id')  
        shift_data = {
            'start_time': start_time,
            'end_time': end_time,
            'day': day
        }
        if employee_id:
            shift_data['employee_id'] = int(employee_id)

        try:
            response = requests.post(f'{API_BASE_URL}/shifts', json=shift_data)
            response.raise_for_status()
            return redirect(url_for('list_shifts_ui'))  
        
        except requests.exceptions.RequestException as e:
            error_message = f"Error creating shift: {e}"
            if response.status_code == 400 and response.headers.get('Content-Type') == 'application/json':
                error_data = response.json()
                if 'error' in error_data:
                    error_message = f"Error creating shift: {error_data['error']}"
            return render_template('create_shift.html', error=error_message)
        
@app.route('/shifts_ui/<int:shift_id>')
def shift_detail_ui(shift_id):
    try:
        response = requests.get(f'{API_BASE_URL}/shifts/{shift_id}')
        response.raise_for_status()  # Raise an exception for bad status codes
        shift = response.json()
        return render_template('shift_detail.html', shift=shift)
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching shift details: {e}"
        return render_template('error.html', error=error_message, back_url=url_for('list_shifts_ui'))
    
@app.route('/employees_ui/edit/<int:employee_id>')
def edit_employee_ui(employee_id):
    try:
        response = requests.get(f'{API_BASE_URL}/employees/{employee_id}')
        response.raise_for_status()
        employee = response.json()
        return render_template('edit_employee.html', employee=employee)
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching employee data for editing: {e}"
        return render_template('error.html', error=error_message, back_url=url_for('list_employees_ui'))
    
@app.route('/shifts_ui/edit/<int:shift_id>')
def edit_shift_ui(shift_id):
    try:
        response = requests.get(f'{API_BASE_URL}/shifts/{shift_id}')
        response.raise_for_status()
        shift = response.json()
        return render_template('edit_shift.html', shift=shift)
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching shift data for editing: {e}"
        return render_template('error.html', error=error_message, back_url=url_for('list_shifts_ui'))    

@app.post('/shifts_ui/update_shift/<int:shift_id>')
def update_shift_ui(shift_id):
    if request.method == 'POST':
        start_time = request.form['start_time']
        end_time = request.form['end_time']
        day = request.form['day']
        employee_id = request.form.get('employee_id')  # 

        shift_data = {
            'start_time': start_time,
            'end_time': end_time,
            'day': day
        }
        if employee_id:
            shift_data['employee_id'] = int(employee_id)

        try:
            response = requests.put(f'{API_BASE_URL}/shifts/{shift_id}', json=shift_data)
            response.raise_for_status()
            return redirect(url_for('shift_detail_ui', shift_id=shift_id)) 
        
        except requests.exceptions.RequestException as e:
            error_message = f"Error updating shift: {e}"
            if response.status_code == 400 and response.headers.get('Content-Type') == 'application/json':
                error_data = response.json()
                if 'error' in error_data:
                    error_message = f"Error updating shift: {error_data['error']}"
            
            try:
                response = requests.get(f'{API_BASE_URL}/shifts/{shift_id}')
                response.raise_for_status()
                shift = response.json()
                return render_template('edit_shift.html', shift=shift, error=error_message)
            except requests.exceptions.RequestException as fetch_error:
                error_message = f"Error updating shift: {error_message}. Additionally, error fetching shift data for re-rendering: {fetch_error}"
                return render_template('error.html', error=error_message, back_url=url_for('list_shifts_ui'))
            
@app.post('/shifts_ui/delete_shift/<int:shift_id>')
def delete_shift_ui(shift_id):
    try:
        response = requests.delete(f'{API_BASE_URL}/shifts/{shift_id}')
        response.raise_for_status()
        return redirect(url_for('list_shifts_ui'))
    except requests.exceptions.RequestException as e:
        error_message = f"Error deleting shift: {e}"
        # Optionally, you could redirect back to the detail page with an error message
        return render_template('error.html', error=error_message, back_url=url_for('shift_detail_ui', shift_id=shift_id))

# EMPLOYEES

@app.post('/employees')
def create_employee():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400
        validated_employee = employee_schema.load(data, session=db.session) 
        db.session.add(validated_employee)
        db.session.commit()
        result = employee_schema.dump(validated_employee)
        return jsonify(result), 201
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

@app.get('/employees')
def get_employees():
    all_employees = db.session.query(Employee).all()
    result = employees_schema.dump(all_employees)
    return jsonify(result)

@app.get('/employees/<int:employee_id>')
def get_employee(employee_id):
    employee = db.session.get(Employee, employee_id)
    if employee:
        result = employee_schema.dump(employee)
        return jsonify(result)
    return jsonify({"error": "Employee not found"}), 404

@app.put('/employees/<int:employee_id>')
def update_employee(employee_id):
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400
        validated_employee = employee_schema.load(data, session=db.session, partial=True)

        if hasattr(validated_employee, 'name'):
            employee.name = validated_employee.name
        if hasattr(validated_employee, 'role'):
            employee.role = validated_employee.role
        if hasattr(validated_employee, 'availability'):
            employee.availability = validated_employee.availability

        db.session.commit()
        result = employee_schema.dump(employee)
        return jsonify(result)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    
@app.delete('/employees/<int:employee_id>')
def delete_employee(employee_id):
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": "Employee deleted successfully"}), 200

# SHIFTS

@app.post('/shifts')
def create_shift():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400
        validated_shift = shift_schema.load(data, session=db.session)
        db.session.add(validated_shift)
        db.session.commit()
        result = shift_schema.dump(validated_shift)
        return jsonify(result), 201
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

@app.get('/shifts')
def get_shifts():
    all_shifts = db.session.query(Shift).all()
    result = shifts_schema.dump(all_shifts)
    return jsonify(result)

@app.get('/shifts/<int:shift_id>')
def get_shift(shift_id):
    shift = db.session.get(Shift, shift_id)
    if shift:
        result = shift_schema.dump(shift)
        return jsonify(result)
    return jsonify({"error": "Shift not found"}), 404

@app.put('/shifts/<int:shift_id>')
def update_shift(shift_id):
    shift = db.session.get(Shift, shift_id)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400
        validated_shift = shift_schema.load(data, session=db.session, partial=True)

        if hasattr(validated_shift, 'start_time'):
            shift.start_time = validated_shift.start_time
        if hasattr(validated_shift, 'end_time'):
            shift.end_time = validated_shift.end_time
        if hasattr(validated_shift, 'day'):
            shift.day = validated_shift.day
        if hasattr(validated_shift, 'employee_id'):
            shift.employee_id = validated_shift.employee_id

        db.session.commit()
        result = shift_schema.dump(shift)
        return jsonify(result)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    
@app.delete('/shifts/<int:shift_id>')
def delete_shift(shift_id):
    shift = db.session.get(Shift, shift_id)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404

    db.session.delete(shift)
    db.session.commit()
    return jsonify({"message": "Shift deleted successfully"}), 200

@app.put('/shifts/<int:shift_id>/assign')
def assign_employee_to_shift(shift_id):
    shift = db.session.get(Shift, shift_id)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404

    data = request.get_json()
    if not data or 'employee_id' not in data:
        return jsonify({"error": "Missing employee_id"}), 400

    employee_id = data['employee_id']
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 400

    if shift.employee_id is not None:
        assigned_employee = db.session.get(Employee, shift.employee_id)
        if assigned_employee:
            return jsonify({"error": f"Shift is already assigned to employee {assigned_employee.name}"}), 400
        else:
            return jsonify({"error": "Shift is already assigned to an employee (employee data not found)"}), 400

    shift_day = shift.day
    employee_availability = employee.availability

    if shift_day not in employee_availability or employee_availability[shift_day].lower() == 'off':
        return jsonify({"error": f"Employee {employee.name} is not available on {shift_day}"}), 400

    shift.employee_id = employee_id
    db.session.commit()
    result = shift_schema.dump(shift)
    return jsonify(result), 200

@app.put('/shifts/<int:shift_id>/unassign')
def unassign_employee_from_shift(shift_id):
    shift = db.session.get(Shift, shift_id)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404

    if shift.employee_id is None:
        return jsonify({"message": "Shift is not currently assigned to any employee"}), 200

    shift.employee_id = None
    db.session.commit()
    result = shift_schema.dump(shift)
    return jsonify(result), 200

@app.get('/employees/<int:employee_id>/shifts')
def get_employee_shifts(employee_id):
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    shifts = db.session.query(Shift).filter(Shift.employee_id == employee_id).all()
    result = shifts_schema.dump(shifts)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)