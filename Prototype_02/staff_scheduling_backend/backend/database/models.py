from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey, Time
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import date

Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    role = Column(String)
    hire_date = Column(Date)

class Schedule(Base):
    __tablename__ = 'schedules'

    id = Column(Integer, primary_key=True)
    schedule_date = Column(Date)

class Shift(Base):
    __tablename__ = 'shifts'

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey('employees.id'))
    schedule_id = Column(Integer, ForeignKey('schedules.id'))
    start_time = Column(Time)
    end_time = Column(Time)

    employee = relationship("Employee", backref="shifts")
    schedule = relationship("Schedule", backref="shifts")

# Database setup
engine = create_engine('sqlite:///employees.db')
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

# Add an employee and verify
new_employee = Employee(name='John Doe', role='Chef', hire_date=date(2023, 1, 1))
session.add(new_employee)
session.commit()

first_employee = session.query(Employee).first()
print(first_employee.name)
