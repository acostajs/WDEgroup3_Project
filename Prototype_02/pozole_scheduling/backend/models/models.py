class Employee:
    def __init__(self, employee_id: int, name: str, role: str, availability: dict):
        self.employee_id = employee_id
        self.name = name
        self.role = role
        self.availability = availability

    def __repr__(self):
        return f"<Employee(employee_id={self.employee_id}, name='{self.name}', role='{self.role}')>"
