# app/__init__.py (REVISED VERSION)

from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass # Already exists

    # Initialize extensions
    db.init_app(app)

    # --- Register Blueprints ---
    # Import the blueprint instance from your routes module
    from app.routes import bp as main_blueprint
    # Register the blueprint with the Flask application instance
    app.register_blueprint(main_blueprint)

    # If you had other blueprints (e.g., for auth), register them here too:
    # from app.auth import bp as auth_blueprint
    # app.register_blueprint(auth_blueprint, url_prefix='/auth')
    from . import models

    print(f"Using database at: {app.config['SQLALCHEMY_DATABASE_URI']}") # Debug print

    return app