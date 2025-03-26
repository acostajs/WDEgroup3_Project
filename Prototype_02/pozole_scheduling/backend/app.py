from flask import Flask

app = Flask(__name__)

from backend.models.models import Employee

@app.route('/')
def hello_world():
    employee = Employee(employee_id=1, name="John Doe", role="Server", availability={})
    return str(employee)

if __name__ == '__main__':
    app.run(debug=True)
