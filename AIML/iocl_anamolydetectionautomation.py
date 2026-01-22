
# INSTALL & IMPORT LIBRARIES
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
import smtplib
from email.message import EmailMessage

# UPLOAD DATASET
from google.colab import files
uploaded = files.upload()

file_name = list(uploaded.keys())[0]
df = pd.read_csv(file_name)

# =========================
# ONE-CELL DATA PIPELINE
# =========================

import pandas as pd
import numpy as np
from google.colab import files

# 1️⃣ Upload Dataset (Automation Trigger)
uploaded = files.upload()
file_name = list(uploaded.keys())[0]

df = pd.read_csv(file_name)
print("Dataset loaded:", file_name)

# 2️⃣ Remove Duplicates
df.drop_duplicates(inplace=True)

# 3️⃣ Handle Date Column Safely
if "date" in df.columns:
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df[df["date"].notna()]

# 4️⃣ Handle Missing Values (Median – Robust)
df.fillna(df.median(numeric_only=True), inplace=True)

# 5️⃣ Remove Physically Impossible Values
df = df[
    (df["electricity_kwh"] > 0) &
    (df["steam_usage"] > 0) &
    (df["fuel_usage"] > 0) &
    (df["production_tons"] > 0)
]

# 6️⃣ Clip Noisy Sensor Data (NOT real anomalies)
df["electricity_kwh"] = df["electricity_kwh"].clip(400, 1600)
df["steam_usage"] = df["steam_usage"].clip(200, 900)
df["fuel_usage"] = df["fuel_usage"].clip(100, 700)

# 7️⃣ Feature Engineering – SEC
df["SEC"] = (
    df["electricity_kwh"] +
    df["steam_usage"] +
    df["fuel_usage"]
) / df["production_tons"]

# 8️⃣ Final Check
print("\nCleaned Dataset Info:")
df.info()

print("\nSample Data:")
df.head()

# FEATURE ENGINEERING (SEC)
df["SEC"] = (
    df["electricity_kwh"] +
    df["steam_usage"] +
    df["fuel_usage"]
) / df["production_tons"]

# GLOBAL ANOMALY DETECTION
features = [
    "electricity_kwh",
    "steam_usage",
    "fuel_usage",
    "production_tons",
    "SEC"
]

X = df[features]

global_model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

df["anomaly"] = np.where(global_model.fit_predict(X) == -1, 1, 0)


# GLOBAL ANOMALIES
plt.figure(figsize=(8,5))
plt.scatter(df["production_tons"], df["electricity_kwh"],
            c=df["anomaly"], cmap="coolwarm", s=6)
plt.title("Global Anomaly Detection")
plt.xlabel("Production Tons")
plt.ylabel("Electricity (kWh)")
plt.show()
df.head()

# UNIT-WISE ANOMALY DETECTION
unit_dfs = {}
unit_models = {}

for unit in df["unit_name"].unique():
    unit_df = df[df["unit_name"] == unit].copy()

    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )

    unit_df["anomaly"] = np.where(
        model.fit_predict(unit_df[features]) == -1, 1, 0
    )

    unit_dfs[unit] = unit_df
    unit_models[unit] = model

    # df.head()

# UNIT-WISE PLOTS
for unit, unit_df in unit_dfs.items():
    plt.figure(figsize=(6,4))
    plt.scatter(
        unit_df["production_tons"],
        unit_df["electricity_kwh"],
        c=unit_df["anomaly"],
        cmap="coolwarm",
        s=6
    )
    plt.title(f"Anomalies in {unit}")
    plt.xlabel("Production Tons")
    plt.ylabel("Electricity (kWh)")
    plt.show()
    # df.head()

for unit, unit_df in unit_dfs.items():
    print(unit, unit_df.columns)

SEC_mean = df["SEC"].mean()

def calculate_severity(sec):
    if sec > 1.5 * SEC_mean:
        return "HIGH"
    elif sec > 1.2 * SEC_mean:
        return "MEDIUM"
    else:
        return "LOW"

# Apply severity unit-wise


for unit, unit_df in unit_dfs.items():
    unit_df["severity"] = np.where(
        unit_df["anomaly"] == 1,
        unit_df["SEC"].apply(calculate_severity),
        "NORMAL"
    )
    unit_dfs[unit] = unit_df

# MERGE ALL UNITS (ALERTS DATAFRAME)
alerts_df = pd.concat(unit_dfs.values(), ignore_index=True)
alerts_df = alerts_df[alerts_df["anomaly"] == 1]

# SEVERITY DISTRIBUTION
# SEVERITY DISTRIBUTION PLOT 📊

alerts_df["severity"].value_counts().plot(
    kind="bar",
    title="Alert Severity Distribution",
    color=["red", "orange", "yellow"]
)
plt.xlabel("Severity Level")
plt.ylabel("Count")
plt.show()

"""SEND AUTOMATED GMAIL ALERT"""

import os
print(os.getcwd())

os.listdir()

# Create alert report again (safe)
alerts_df.to_csv("refinery_alert_report.csv", index=False)

print("File created:", os.path.exists("refinery_alert_report.csv"))

import smtplib
from email.message import EmailMessage

EMAIL = "dharambaba2k4@gmail.com"
APP_PASSWORD = "fugmkuhfxtzeutjm"

msg = EmailMessage()
msg["Subject"] = "🚨 Automated Refinery Energy Anomaly Report"
msg["From"] = EMAIL
msg["To"] = "dharamcodemystery@gmail.com"
msg.set_content("Attached is the automated anomaly alert report.")

with open("refinery_alert_report.csv", "rb") as f:
    msg.add_attachment(
        f.read(),
        maintype="application",
        subtype="octet-stream",
        filename="refinery_alert_report.csv"
    )

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(EMAIL, APP_PASSWORD)
    server.send_message(msg)

print("✅ Automated alert email sent!")

import os

files_to_delete = [
    "refinery_energy_large_dataset (1).csv",
    "refinery_energy_large_dataset (2).csv",
    "refinery_energy_large_dataset (3).csv"
]

for file in files_to_delete:
    path = f"/content/{file}"
    if os.path.exists(path):
        os.remove(path)
        print(f"Deleted: {file}")
    else:
        print(f"Not found: {file}")