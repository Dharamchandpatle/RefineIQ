
# INSTALL DEPENDENCIES
# !pip install prophet

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.ensemble import IsolationForest
from sklearn.metrics import mean_absolute_error, mean_squared_error

from prophet import Prophet
from google.colab import files
import smtplib
from email.message import EmailMessage

# UPLOAD DATASET (AUTOMATION TRIGGER 🔥)


uploaded = files.upload()
file_name = list(uploaded.keys())[0]
df = pd.read_csv(file_name)

print("Dataset uploaded:", file_name)
df.head()

# ROBUST DATA CLEANING + COLUMN AUTO-MAPPING (CRITICAL)


# Remove duplicates
df.drop_duplicates(inplace=True)

# Handle date safely
if "date" in df.columns:
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df[df["date"].notna()]

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

required_cols = list(column_map.keys())
missing = [c for c in required_cols if c not in df.columns]
if missing:
    raise ValueError(f"Missing required columns: {missing}")

# Handle missing values
df.fillna(df.median(numeric_only=True), inplace=True)

# Remove impossible values
df = df[
    (df["electricity_kwh"] > 0) &
    (df["steam_usage"] > 0) &
    (df["fuel_usage"] > 0) &
    (df["production_tons"] > 0)
]

print("Data cleaning & column mapping completed")
df.info()

# FEATURE ENGINEERING (SEC & TOTAL ENERGY)


df["total_energy"] = (
    df["electricity_kwh"] +
    df["steam_usage"] +
    df["fuel_usage"]
)

df["SEC"] = df["total_energy"] / df["production_tons"]
df.head()

"""Model 1  : ANOMALY DETECTION (ISOLATION FOREST)

"""

#  TRAIN MODEL

features = [
    "electricity_kwh",
    "steam_usage",
    "fuel_usage",
    "production_tons",
    "SEC"
]

X = df[features]

iso_model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

iso_model.fit(X)
df["anomaly"] = np.where(iso_model.predict(X) == -1, 1, 0)

# SEVERITY ASSIGNMENT


SEC_MEAN = df["SEC"].mean()

def severity(sec):
    if sec > 1.5 * SEC_MEAN:
        return "HIGH"
    elif sec > 1.2 * SEC_MEAN:
        return "MEDIUM"
    elif sec > SEC_MEAN:
        return "LOW"
    else:
        return "NORMAL"

df["severity"] = df["SEC"].apply(severity)

"""MODEL 2: ENERGY & SEC PREDICTION (PROPHET)"""

# DAILY AGGREGATION


daily_df = df.groupby("date").agg({
    "total_energy": "sum",
    "SEC": "mean"
}).reset_index()

# ENERGY FORECAST

energy_ts = daily_df.rename(columns={"date": "ds", "total_energy": "y"})

energy_model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    changepoint_prior_scale=0.1
)
energy_model.fit(energy_ts)

future_energy = energy_model.make_future_dataframe(periods=30)
energy_forecast = energy_model.predict(future_energy)

energy_model.plot(energy_forecast)
plt.title("Energy Consumption Forecast")
plt.show()

# SEC FORECAST (EFFICIENCY TREND)


sec_ts = daily_df.rename(columns={"date": "ds", "SEC": "y"})

sec_model = Prophet(
    yearly_seasonality=True,
    changepoint_prior_scale=0.1
)
sec_model.fit(sec_ts)

future_sec = sec_model.make_future_dataframe(periods=30)
sec_forecast = sec_model.predict(future_sec)

sec_model.plot(sec_forecast)
plt.title("SEC Forecast")
plt.show()

# OPTIONAL FORECAST VALIDATION

actual = energy_ts.tail(30)["y"].values
predicted = energy_forecast.tail(30)["yhat"].values

mae = mean_absolute_error(actual, predicted)
rmse = np.sqrt(mean_squared_error(actual, predicted))

print("MAE:", mae)
print("RMSE:", rmse)

"""MODEL 3: RECOMMENDATION SYSTEM"""

# GENERATE RECOMMENDATIONS


def recommendation(row):
    if row["severity"] == "HIGH":
        return "Immediate action: reduce load, inspect equipment"
    elif row["severity"] == "MEDIUM":
        return "Optimize parameters and steam usage"
    elif row["severity"] == "LOW":
        return "Preventive optimization"
    else:
        return "Operation normal"

df["recommendation"] = df.apply(recommendation, axis=1)

# FINAL DECISION TABLE

decision_table = df[[
    "date",
    "severity",
    "SEC",
    "recommendation"
]]

decision_table.head()

# SAVE FILES

energy_forecast.to_csv("energy_forecast.csv", index=False)
sec_forecast.to_csv("sec_forecast.csv", index=False)
decision_table.to_csv("optimization_recommendations.csv", index=False)

print("All files saved")

# DOWNLOAD FILES

# files.download("energy_forecast.csv")
# files.download("sec_forecast.csv")
# files.download("optimization_recommendations.csv")

# Compress files into ONE ZIP
import zipfile

zip_filename = "refinery_reports.zip"

with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
    zipf.write("energy_forecast.csv")
    zipf.write("sec_forecast.csv")
    zipf.write("optimization_recommendations.csv")

print("ZIP file created")

from email.message import EmailMessage
import smtplib

EMAIL = "dharambaba2k4@gmail.com"
APP_PASSWORD = "fugmkuhfxtzeutjm"

msg = EmailMessage()
msg["Subject"] = "Automated Refinery Energy & Optimization Report"
msg["From"] = EMAIL
msg["To"] = "dharamcodemystery@gmail.com"
msg.set_content(
    "Attached is the compressed refinery energy forecast and optimization report."
)

with open(zip_filename, "rb") as f:
    msg.add_attachment(
        f.read(),
        maintype="application",
        subtype="zip",
        filename=zip_filename
    )

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(EMAIL, APP_PASSWORD)
    server.send_message(msg)

print("Email sent successfully with ZIP attachment")

# In real industry, nobody emails raw 5-year data.

# Create summary instead:
summary_df = decision_table.groupby("severity").size().reset_index(name="count")
summary_df.to_csv("summary_report.csv", index=False)