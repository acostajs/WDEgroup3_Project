from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from backend.models.models import Employee, Shift
from backend.schemas import EmployeeSchema, ShiftSchema

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

with app.app_context():
    db.create_all()

# Initialize Marshmallow schemas
employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)
shift_schema = ShiftSchema()
shifts_schema = ShiftSchema(many=True)

@app.post('/employees')
def create_employee():
    data = request.get_json()
    if not data or 'name' not in data or 'role' not in data or 'availability' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    new_employee = Employee(
        name=data['name'],
        role=data['role'],
        availability=data['availability']
    )
    db.session.add(new_employee)
    db.session.commit()
    result = employee_schema.dump(new_employee)
    return jsonify(result), 201

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

    data = request.get_json()
    if not data or 'name' not in data or 'role' not in data or 'availability' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    employee.name = data['name']
    employee.role = data['role']
    employee.availability = data['availability']
    db.session.commit()
    result = employee_schema.dump(employee)
    return jsonify(result)

@app.delete('/employees/<int:employee_id>')
def delete_employee(employee_id):
    employee = db.session.get(Employee, employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": "Employee deleted successfully"}), 200

@app.post('/shifts')
def create_shift():
    data = request.get_json()
    if not data or 'start_time' not in data or 'end_time' not in data or 'day' not in data:
        return jsonify({"error": "Missing required shift fields (start_time, end_time, day)"}), 400

    employee_id = data.get('employee_id')  # Allow employee_id to be None

    new_shift = Shift(
        start_time=data['start_time'],
        end_time=data['end_time'],
        day=data['day'],
        employee_id=employee_id
    )
    db.session.add(new_shift)
    db.session.commit()
    result = shift_schema.dump(new_shift)
    return jsonify(result), 201

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

    data = request.get_json()
    if not data or 'start_time' not in data or 'end_time' not in data or 'day' not in data or 'employee_id' not in data:
        return jsonify({"error": "Missing required shift fields"}), 400

    shift.start_time = data['start_time']
    shift.end_time = data['end_time']
    shift.day = data['day']
    shift.employee_id = data['employee_id']
    db.session.commit()
    result = shift_schema.dump(shift)
    return jsonify(result)

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