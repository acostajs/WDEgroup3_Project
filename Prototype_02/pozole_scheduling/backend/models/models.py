class Employee:
    def __init__(self, employee_id: int, name: str, role: str, availability: dict):
        self.employee_id = employee_id
        self.name = name
        self.role = role
        self.availability = availability

    def __repr__(self):
        return f"<Employee(employee_id={self.employee_id}, name='{self.name}', role='{self.role}')>"

class Shift:
    def __init__(self, shift_id: int, start_time: str, end_time: str, day: str, employee_id: int):
        self.shift_id = shift_id
        self.start_time = start_time
        self.end_time = end_time
        self.day = day
        self.employee_id = employee_id

    def __repr__(self):
        return f"<Shift(shift_id={self.shift_id}, day='{self.day}', start_time='{self.start_time}', end_time='{self.end_time}', employee_id={self.employee_id})>"