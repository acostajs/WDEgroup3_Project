from flask import render_template, redirect, url_for, flash, request, abort
from app import db
from app.admin import bp 
from app.forms import EmployeeForm 
from app.models import Employee 
from sqlalchemy.exc import IntegrityError

@bp.route('/employees')
def list_employees():
    """Displays a list of all employees."""
    try:
        employees = Employee.query.order_by(Employee.name).all()
        return render_template('admin/employee_list.html',
                               title='Manage Employees',
                               employees=employees)
    except Exception as e:
        flash(f'Error loading employee list: {e}', 'danger')
        return redirect(url_for('main.index'))
    
@bp.route('/employee/edit/<int:employee_id>', methods=['GET', 'POST'])
def edit_employee(employee_id):
    """Route for editing an existing employee."""
    employee = Employee.query.get_or_404(employee_id)
    form = EmployeeForm(obj=employee)

    if form.validate_on_submit(): 
        error = False
        if form.email.data != employee.email:
            existing_email = Employee.query.filter(
                Employee.email == form.email.data,
                Employee.id != employee.id 
            ).first()
            if existing_email:
                flash(f'Error: Email "{form.email.data}" is already registered by another employee.', 'danger')
                error = True

        if form.name.data != employee.name:
            existing_name = Employee.query.filter(
                 Employee.name == form.name.data,
                 Employee.id != employee.id 
            ).first()
            if existing_name:
                flash(f'Error: Name "{form.name.data}" is already used by another employee.', 'danger')
                error = True

        if not error:
            employee.name = form.name.data
            employee.position = form.position.data
            employee.email = form.email.data
            employee.hourly_rate = form.hourly_rate.data
            try:
                
                db.session.commit() 
                flash(f'Employee "{employee.name}" updated successfully!', 'success')
                return redirect(url_for('admin.list_employees')) 
            except IntegrityError:
                db.session.rollback()
                flash('Database error: Could not update employee. Possible duplicate name or email.', 'danger')
            except Exception as e:
                db.session.rollback()
                flash(f'An unexpected error occurred: {e}', 'danger')

    return render_template('admin/employee_form.html', title='Edit Employee', form=form)

@bp.route('/employee/add', methods=['GET', 'POST'])
def add_employee():
    """Route for adding a new employee."""
    form = EmployeeForm()
    if form.validate_on_submit(): 
        
        existing_employee = Employee.query.filter(
            (Employee.email == form.email.data) | (Employee.name == form.name.data)
            ).first()
        if existing_employee:
            flash('Error: Employee with that name or email already exists.', 'danger')
        else:
            new_employee = Employee(
                name=form.name.data,
                position=form.position.data,
                email=form.email.data,
                hourly_rate=form.hourly_rate.data
            )
            try:
                db.session.add(new_employee)
                db.session.commit()
                flash(f'Employee "{new_employee.name}" added successfully!', 'success')
                return redirect(url_for('admin.list_employees'))
            except IntegrityError:
                db.session.rollback()
                flash('Database error: Employee with this name or email might already exist.', 'danger')
            except Exception as e:
                db.session.rollback()
                flash(f'An unexpected error occurred: {e}', 'danger')

    return render_template('admin/employee_form.html', title='Add New Employee', form=form)