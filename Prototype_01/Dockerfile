# Use an official Python runtime as a parent image
# Using -slim variant reduces image size. Adjust version if needed.
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1  # Prevents python from writing .pyc files
ENV PYTHONUNBUFFERED 1       # Prevents python from buffering stdout/stderr

# Set the working directory in the container
WORKDIR /app

# Install system dependencies if needed (e.g., for certain libraries)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
# Ensure .dockerignore is set up correctly to exclude unwanted files/folders
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Define the command to run the application using Gunicorn
# Binds to all network interfaces on port 5000
# 'run:app' refers to the 'app' variable created by create_app() in your run.py (or wherever Flask app instance is)
# If your entry point script is app.py use 'app:app'
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--timeout", "120", "run:app"]