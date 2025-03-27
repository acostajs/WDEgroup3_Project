from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from backend.models.models import Employee, Shift
from marshmallow import ValidationError, validates

class EmployeeSchema(SQLAlchemySchema):
    class Meta:
        model = Employee
        load_instance = True

    id = auto_field()
    name = auto_field(required=True)
    role = auto_field(required=True)
    availability = auto_field(required=True)

class ShiftSchema(SQLAlchemySchema):
    class Meta:
        model = Shift
        load_instance = True

    id = auto_field()
    start_time = auto_field(required=True)
    end_time = auto_field(required=True)
    day = auto_field(required=True)
    employee_id = auto_field()

    @validates("end_time")
    def validate_end_time(self, value):
        if value is None:
            raise ValidationError("End time cannot be null.")

    @validates("day")
    def validate_day(self, value):
        if value is None:
            raise ValidationError("Day cannot be null.")