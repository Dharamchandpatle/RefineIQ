

# Energy Consumption & SEC Prediction (Prophet)

# !pip install prophet

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from prophet import Prophet
from google.colab import files

# UPLOAD DATASET (AUTOMATION ENTRY POINT)

uploaded = files.upload()
file_name = list(uploaded.keys())[0]

df = pd.read_csv(file_name)
print("Dataset uploaded:", file_name)
df.head()

# BASIC DATA CLEANING (REQUIRED)


# Remove duplicates
df.drop_duplicates(inplace=True)

# Handle date column safely
if "date" in df.columns:
    df["date"] = pd.to_datetime(df["date"])
elif "ds" in df.columns:
    df["ds"] = pd.to_datetime(df["ds"])

# Handle missing values
df.fillna(df.median(numeric_only=True), inplace=True)

# Clean only if raw refinery data
required_cols = ["electricity_kwh", "steam_usage", "fuel_usage", "production_tons"]
if all(col in df.columns for col in required_cols):
    df = df[
        (df["electricity_kwh"] > 0) &
        (df["steam_usage"] > 0) &
        (df["fuel_usage"] > 0) &
        (df["production_tons"] > 0)
    ]

print("Cleaning completed")

df.info()

# =========================
# ROBUST FEATURE ENGINEERING (ONE CELL)
# =========================

import pandas as pd
import numpy as np

# ---- Column auto-mapping ----
column_map = {
    "electricity_kwh": ["electricity_kwh", "electricity", "elec_kwh", "power_kwh", "energy_kwh"],
    "steam_usage": ["steam_usage", "steam", "steam_kwh"],
    "fuel_usage": ["fuel_usage", "fuel", "fuel_kwh"],
    "production_tons": ["production_tons", "production", "output_tons"]
}

for standard_col, possible_cols in column_map.items():
    for col in possible_cols:
        if col in df.columns:
            df[standard_col] = df[col]
            break

# ---- Final validation ----
required_cols = ["electricity_kwh", "steam_usage", "fuel_usage", "production_tons"]
missing = [c for c in required_cols if c not in df.columns]

if missing:
    raise ValueError(f"Missing required columns: {missing}")

# ---- Feature Engineering ----
df["total_energy"] = (
    df["electricity_kwh"] +
    df["steam_usage"] +
    df["fuel_usage"]
)

df["SEC"] = df["total_energy"] / df["production_tons"]

print("Feature engineering completed successfully")
df[required_cols + ["total_energy", "SEC"]].head()

# AGGREGATE DATA (TIME-SERIES FORMAT)
# Daily aggregation (best for refinery planning)


daily_df = df.groupby("date").agg({
    "total_energy": "sum",
    "SEC": "mean"
}).reset_index()

daily_df.head()

# PREPARE DATA FOR PROPHET (FORMAT RULE)
# Prophet requires:
# ds → date
# y → value to predict
# 🔹 ENERGY FORECAST DATASET

# TRAIN ENERGY CONSUMPTION MODEL


# Energy Forecast Dataset///////
energy_ts = daily_df.rename(columns={
    "date": "ds",
    "total_energy": "y"
})

# 🔹 SEC Forecast Dataset
sec_ts = daily_df.rename(columns={
    "date": "ds",
    "SEC": "y"
})

# TRAIN ENERGY FORECAST MODEL
energy_model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    changepoint_prior_scale=0.1
)

energy_model.fit(energy_ts)

# FORECAST FUTURE ENERGY (NEXT 30 DAYS)


future_energy = energy_model.make_future_dataframe(periods=30)
energy_forecast = energy_model.predict(future_energy)


energy_forecast.head()

# VISUALIZE ENERGY FORECAST 📊


energy_model.plot(energy_forecast)
plt.title("Refinery Energy Consumption Forecast")
plt.xlabel("Date")
plt.ylabel("Total Energy")
plt.show()



# PREPARE SEC FORECAST DATASET

# SEC FORECAST MODEL (AUTO)


sec_ts = daily_df.rename(columns={
    "date": "ds",
    "SEC": "y"
})

# RAIN SEC FORECAST MODEL

sec_model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=False,
    changepoint_prior_scale=0.1
)

sec_model.fit(sec_ts)

# FORECAST FUTURE SEC


# SEC FORECAST + VISUAL


future_sec = sec_model.make_future_dataframe(periods=30)
sec_forecast = sec_model.predict(future_sec)

sec_model.plot(sec_forecast)
plt.title("Automated SEC Forecast")
plt.show()

sec_forecast.head()

# VISUALIZE SEC FORECAST


sec_model.plot(sec_forecast)
plt.title("Refinery SEC Forecast")
plt.xlabel("Date")
plt.ylabel("SEC")
plt.show()

#AUTO SAVE OUTPUT FILES


energy_forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].to_csv(
    "energy_forecast.csv", index=False
)

sec_forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].to_csv(
    "sec_forecast.csv", index=False
)

print("Forecast files saved automatically")

# DOWNLOAD RESULTS
# files.download("energy_forecast.csv")
# files.download("sec_forecast.csv")

from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

# Split actual & predicted
actual = energy_ts.tail(30)["y"].values
predicted = energy_forecast.tail(30)["yhat"].values

# MAE
mae = mean_absolute_error(actual, predicted)

# RMSE (manual – version safe)
rmse = np.sqrt(mean_squared_error(actual, predicted))

print("MAE:", mae)
print("RMSE:", rmse)

# UNIT-WISE FORECASTING (FUTURE SCOPE)
for unit in df["unit_name"].unique():
    unit_df = df[df["unit_name"] == unit]

    daily_unit = unit_df.groupby("date").agg({
        "total_energy": "sum"
    }).reset_index()

    unit_ts = daily_unit.rename(columns={"date": "ds", "total_energy": "y"})

    model = Prophet()
    model.fit(unit_ts)

    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    model.plot(forecast)
    plt.title(f"Energy Forecast – {unit}")
    plt.show()