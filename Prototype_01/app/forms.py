# app/forms.py

from flask_wtf import FlaskForm
from wtforms import SubmitField, IntegerField, FloatField, TextAreaField, DateField
from wtforms.validators import DataRequired, Optional, NumberRange
from wtforms_sqlalchemy.fields import QuerySelectField 
from app.models import Employee 
import datetime

def employee_query():
    return Employee.query.order_by(Employee.name)

class PerformanceLogForm(FlaskForm):
    employee = QuerySelectField(
        'Employee',
        query_factory=employee_query,
        get_label='name',
        allow_blank=True,
        blank_text='-- Select Employee --',
        validators=[DataRequired(message="Please select an employee.")]
    )

    log_date = DateField(
        'Date',
        default=datetime.date.today,
        validators=[DataRequired()]
    )

    tasks_completed = IntegerField(
        'Tasks Completed',
        validators=[Optional()] 
    )

    
    rating = FloatField(
        'Rating (1-5)',
        validators=[
            Optional(), 
            NumberRange(min=1, max=5, message="Rating must be between 1 and 5.")
        ]
    )

    notes = TextAreaField(
        'Notes',
        validators=[Optional()]
    )

    submit = SubmitField('Log Performance')