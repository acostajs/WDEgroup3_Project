from flask import Flask, request, jsonify
from backend.models.models import Employee

app = Flask(__name__)

employees = []

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

if __name__ == '__main__':
    app.run(debug=True)
