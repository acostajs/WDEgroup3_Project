import sys
import os

# Add the parent directory of 'backend' to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, request
from backend.database.models import Employee, Schedule, Shift, session
from datetime import datetime

app = Flask(__name__)

@app.route('/employees', methods=['GET'])
def get_employees():
    employees = session.query(Employee).all()
    employee_list = []
    for employee in employees:
        employee_list.append({
            'id': employee.id,
            'name': employee.name,
            'role': employee.role,
            'hire_date': str(employee.hire_date)
        })
    return jsonify(employee_list)

@app.route('/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    new_employee = Employee(
        name=data['name'],
        role=data['role'],
        hire_date=datetime.strptime(data['hire_date'], '%Y-%m-%d').date()
    )
    session.add(new_employee)
    session.commit()
    return jsonify({'message': 'Employee created successfully'}), 201

@app.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    employee = session.get(Employee, employee_id)
    if not employee:
        return jsonify({'message': 'Employee not found'}), 404
    data = request.get_json()
    employee.name = data.get('name', employee.name)
    employee.role = data.get('role', employee.role)
    if 'hire_date' in data:
        employee.hire_date = datetime.strptime(data['hire_date'], '%Y-%m-%d').date()
    session.commit()
    return jsonify({'message': 'Employee updated successfully'})

@app.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = session.get(Employee, employee_id)
    if not employee:
        return jsonify({'message': 'Employee not found'}), 404
    session.delete(employee)
    session.commit()
    return jsonify({'message': 'Employee deleted successfully'})

@app.route('/schedules', methods=['GET'])
def get_schedules():
    schedules = session.query(Schedule).all()
    schedule_list = []
    for schedule in schedules:
        schedule_list.append({
            'id': schedule.id,
            'schedule_date': str(schedule.schedule_date)
        })
    return jsonify(schedule_list)

@app.route('/schedules', methods=['POST'])
def create_schedule():
    data = request.get_json()
    new_schedule = Schedule(
        schedule_date=datetime.strptime(data['schedule_date'], '%Y-%m-%d').date()
    )
    session.add(new_schedule)
    session.commit()
    return jsonify({'message': 'Schedule created successfully'}), 201

@app.route('/schedules/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        return jsonify({'message': 'Schedule not found'}), 404
    data = request.get_json()
    if 'schedule_date' in data:
        schedule.schedule_date = datetime.strptime(data['schedule_date'], '%Y-%m-%d').date()
    session.commit()
    return jsonify({'message': 'Schedule updated successfully'})

@app.route('/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        return jsonify({'message': 'Schedule not found'}), 404
    session.delete(schedule)
    session.commit()
    return jsonify({'message': 'Schedule deleted successfully'})

@app.route('/shifts', methods=['GET'])
def get_shifts():
    shifts = session.query(Shift).all()
    shift_list = []
    for shift in shifts:
        shift_list.append({
            'id': shift.id,
            'employee_id': shift.employee_id,
            'schedule_id': shift.schedule_id,
            'start_time': str(shift.start_time),
            'end_time': str(shift.end_time)
        })
    return jsonify(shift_list)

@app.route('/shifts', methods=['POST'])
def create_shift():
    data = request.get_json()
    new_shift = Shift(
        employee_id=data['employee_id'],
        schedule_id=data['schedule_id'],
        start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
        end_time=datetime.strptime(data['end_time'], '%H:%M').time()
    )
    session.add(new_shift)
    session.commit()
    return jsonify({'message': 'Shift created successfully'}), 201

@app.route('/shifts/<int:shift_id>', methods=['PUT'])
def update_shift(shift_id):
    shift = session.get(Shift, shift_id)
    if not shift:
        return jsonify({'message': 'Shift not found'}), 404
    data = request.get_json()
    shift.employee_id = data.get('employee_id', shift.employee_id)
    shift.schedule_id = data.get('schedule_id', shift.schedule_id)
    if 'start_time' in data:
        shift.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
    if 'end_time' in data:
        shift.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
    session.commit()
    return jsonify({'message': 'Shift updated successfully'})

@app.route('/shifts/<int:shift_id>', methods=['DELETE'])
def delete_shift(shift_id):
    shift = session.get(Shift, shift_id)
    if not shift:
        return jsonify({'message': 'Shift not found'}), 404
    session.delete(shift)
    session.commit()
    return jsonify({'message': 'Shift deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)
