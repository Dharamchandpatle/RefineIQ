# RefineryIQ

AI-Driven Smart Refinery Energy & Safety Intelligence Platform.

## Overview
RefineryIQ is a decision-support platform for refinery operations. It ingests CSV datasets, runs offline ML pipelines once per upload, stores results in MongoDB, and serves dashboards plus a data-grounded chatbot that answers questions using stored KPIs, anomaly alerts, forecasts, and recommendations.

## Tech Stack
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** FastAPI + MongoDB
- **ML:** Offline-trained models triggered on CSV upload
- **AI:** Gemini (server-side only)

## Core Workflow
1. User uploads CSV dataset.
2. Pipeline runs once and stores outputs in MongoDB:
   - `kpi_snapshots`
   - `anomaly_alerts`
   - `forecast_results`
   - `recommendations`
3. Dashboards and chatbot read from MongoDB only.

## Project Structure
```
RefineryIQ/
├─ client/                 # React frontend
├─ server/                 # FastAPI backend
├─ dataset/                # Sample datasets
├─ AIML/                   # ML scripts/notebooks
└─ README.md
```

## Backend Setup (FastAPI)
1. Create a `.env` file inside `server/`:
   ```
   MONGODB_URI=mongodb://localhost:27017
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```
2. Install dependencies:
   ```
   cd server
   pip install -r requirements.txt
   ```
3. Run the API server:
   ```
   python run.py
   ```

## Frontend Setup (React)
1. Install dependencies:
   ```
   cd client
   npm install
   ```
2. Start dev server:
   ```
   npm run dev
   ```

## Environment Variables
**Backend (server/.env)**
- `MONGODB_URI` — MongoDB connection string
- `GEMINI_API_KEY` — Gemini API key (server-only)
- `GEMINI_MODEL` — Gemini model name

**Frontend (client/.env)**
- `VITE_API_BASE` — Base URL for the backend (default: `http://localhost:8000`)

## Key API Endpoints
- `POST /api/upload` — Upload CSV and run ML pipeline
- `GET /api/datasets` — List datasets
- `POST /api/datasets/active/{dataset_id}` — Set active dataset
- `GET /api/dashboard/admin` — Admin dashboard data
- `GET /api/dashboard/operator` — Operator dashboard data
- `POST /api/chatbot/query` — Data-grounded chatbot

### Chatbot Request/Response
**Request**
```json
{
  "dataset_id": "string",
  "user_role": "admin | operator",
  "question": "string"
}
```

**Response**
```json
{
  "answer": "string",
  "sources": ["kpi", "alerts", "forecast", "recommendations"],
  "confidence": "high | medium | low"
}
```

## Chatbot Rules (Critical)
- Uses **MongoDB data only**
- Never runs ML or reads CSVs
- Never fabricates numbers
- If data is missing: **"Data not available for selected dataset"**
- Tone adapts to `user_role`

## Notes
- Gemini API key must never be exposed in the frontend.
- Dashboards and chatbot require a selected dataset.

## License
Private/Internal
