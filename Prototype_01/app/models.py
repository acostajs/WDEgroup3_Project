from app import db
import datetime

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    position = db.Column(db.String(64))
    # Add other relevant fields

    def __repr__(self):
        return f'<Employee {self.name}>'

class Shift(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'))
    start_time = db.Column(db.DateTime, index=True)
    end_time = db.Column(db.DateTime)
    # Add other fields like role during shift, etc.

    employee = db.relationship('Employee', backref='shifts')

    def __repr__(self):
        return f'<Shift {self.employee.name} {self.start_time}>'

# Add PerformanceMetrics table later