# app/utils/forecasting.py

import pandas as pd
from prophet import Prophet
import os
import logging

# Suppress informational messages from Prophet/cmdstanpy
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
logging.getLogger("prophet").setLevel(logging.WARNING)


def generate_forecast(days_to_predict=7):
    """
    Generates a sales/demand forecast using Prophet.

    Args:
        days_to_predict (int): Number of days into the future to forecast.

    Returns:
        pandas.DataFrame: A DataFrame containing the forecast with columns
                          ['ds', 'yhat', 'yhat_lower', 'yhat_upper']
                          Returns None if an error occurs (e.g., file not found).
    """
    print("Attempting to generate forecast...")  # Simple console log

    # Construct the path to the data file relative to this script's location
    # Go up from 'utils', up from 'app', then into 'data'
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(os.path.dirname(base_dir), "data")
    file_path = os.path.join(data_dir, "historical_sales.csv")

    print(f"Looking for data file at: {file_path}")

    try:
        df = pd.read_csv(file_path)
        print(f"Successfully read {len(df)} rows from {file_path}")

        # --- Data Preparation ---
        # Ensure 'ds' column is datetime
        df["ds"] = pd.to_datetime(df["ds"])

        # Basic check for required columns
        if "ds" not in df.columns or "y" not in df.columns:
            print("Error: CSV must contain 'ds' and 'y' columns.")
            return None

        # Prophet requires at least 2 data points
        if len(df) < 2:
            print("Error: Need at least 2 data points to create a forecast.")
            return None

        # --- Model Training & Forecasting ---
        # Initialize Prophet model (can add seasonality options later if needed)
        m = Prophet()

        # Fit the model to the historical data
        print("Fitting Prophet model...")
        m.fit(df)
        print("Model fitting complete.")

        # Create a DataFrame for future dates
        future = m.make_future_dataframe(periods=days_to_predict)

        # Generate the forecast
        print(f"Generating forecast for {days_to_predict} days...")
        forecast = m.predict(future)
        print("Forecast generation complete.")

        # --- Return Results ---
        # Select relevant columns (date, prediction, confidence interval)
        forecast_subset = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

        # Optional: print the tail (last few rows including future predictions)
        print("Forecast results (tail):")
        print(forecast_subset.tail())

        return forecast_subset

    except FileNotFoundError:
        print(f"Error: Data file not found at {file_path}")
        return None
    except Exception as e:
        print(f"An error occurred during forecasting: {e}")
        # Log the full exception traceback if using proper logging
        # import traceback
        # print(traceback.format_exc())
        return None


# Example of how to call it (for testing purposes if run directly)
if __name__ == "__main__":
    print("Running forecast generation directly...")
    forecast_result = generate_forecast(days_to_predict=14)
    if forecast_result is not None:
        print("\nFunction call successful. Result head:")
        print(forecast_result.head())
    else:
        print("\nFunction call failed.")
