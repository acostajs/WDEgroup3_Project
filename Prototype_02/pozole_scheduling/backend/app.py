from flask import Flask, request, jsonify
from backend.models.models import Employee, Shift

app = Flask(__name__)

employees = []
shifts = []

@app.route('/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    if not data or 'name' not in data or 'role' not in data or 'availability' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    employee_id = len(employees) + 1  # Simple ID generation for now
    new_employee = Employee(
        employee_id=employee_id,
        name=data['name'],
        role=data['role'],
        availability=data['availability']
    )
    employees.append(new_employee)
    return jsonify(new_employee.__dict__), 201

# Route to Employees 

@app.get('/employees')
def get_employees():
    employee_list = [employee.__dict__ for employee in employees]
    return jsonify(employee_list)

@app.get('/employees/<int:employee_id>')
def get_employee(employee_id):
    employee = next((emp for emp in employees if emp.employee_id == employee_id), None)
    if employee:
        return jsonify(employee.__dict__)
    return jsonify({"error": "Employee not found"}), 404

@app.put('/employees/<int:employee_id>')
def update_employee(employee_id):
    employee = next((emp for emp in employees if emp.employee_id == employee_id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    data = request.get_json()
    if not data or 'name' not in data or 'role' not in data or 'availability' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    employee.name = data['name']
    employee.role = data['role']
    employee.availability = data['availability']
    return jsonify(employee.__dict__)

@app.delete('/employees/<int:employee_id>')
def delete_employee(employee_id):
    global employees
    initial_length = len(employees)
    employees = [emp for emp in employees if emp.employee_id != employee_id]
    if len(employees) < initial_length:
        return jsonify({"message": "Employee deleted successfully"}), 200
    return jsonify({"error": "Employee not found"}), 404

# Route to Shifts

@app.post('/shifts')
def create_shift():
    data = request.get_json()
    if not data or 'start_time' not in data or 'end_time' not in data or 'day' not in data or 'employee_id' not in data:
        return jsonify({"error": "Missing required shift fields"}), 400

    # For now, let's assume the employee_id is valid (we'll add validation later)
    shift_id = len(shifts) + 1
    new_shift = Shift(
        shift_id=shift_id,
        start_time=data['start_time'],
        end_time=data['end_time'],
        day=data['day'],
        employee_id=data['employee_id']
    )
    shifts.append(new_shift)
    return jsonify(new_shift.__dict__), 201

@app.get('/shifts')
def get_shifts():
    shift_list = [shift.__dict__ for shift in shifts]
    return jsonify(shift_list)

@app.get('/shifts/<int:shift_id>')
def get_shift(shift_id):
    shift = next((s for s in shifts if s.shift_id == shift_id), None)
    if shift:
        return jsonify(shift.__dict__)
    return jsonify({"error": "Shift not found"}), 404

@app.put('/shifts/<int:shift_id>')
def update_shift(shift_id):
    shift = next((s for s in shifts if s.shift_id == shift_id), None)
    if not shift:
        return jsonify({"error": "Shift not found"}), 404

    data = request.get_json()
    if not data or 'start_time' not in data or 'end_time' not in data or 'day' not in data or 'employee_id' not in data:
        return jsonify({"error": "Missing required shift fields"}), 400

    shift.start_time = data['start_time']
    shift.end_time = data['end_time']
    shift.day = data['day']
    shift.employee_id = data['employee_id']
    return jsonify(shift.__dict__)

@app.delete('/shifts/<int:shift_id>')
def delete_shift(shift_id):
    global shifts
    initial_length = len(shifts)
    shifts = [s for s in shifts if s.shift_id != shift_id]
    if len(shifts) < initial_length:
        return jsonify({"message": "Shift deleted successfully"}), 200
    return jsonify({"error": "Shift not found"}), 404



if __name__ == '__main__':
    app.run(debug=True)
