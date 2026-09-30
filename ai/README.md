# AI & Machine Learning Architecture

## Components
1. **Demand Forecasting (`ai/forecasting/`):**
   - Implements Vertex AI compatible Bayesian ARIMA models.
   - Computes 7, 14, and 30-day forecast windows with 95% confidence intervals.
   - Adjusts demand elasticity based on weather anomalies (monsoons, relative humidity) and outbreak signals.

2. **Gemini Action Briefs (`backend/app/ai/action_brief.py`):**
   - Synthesizes 5-point plain-language operational summaries for district medical officers.
   - Strictly abides by operational safety rules (no medical patient diagnosis; purely logistical and inventory optimization).

3. **Federated Learning Demonstration (`ai/federated_learning/`):**
   - Multi-node simulation (Odisha Node, State B Node, BRICS Node).
   - Federated Averaging (FedAvg) with differential privacy noise ($\epsilon=1.2$).
   - Demonstrates: "RAW DATA STAYS LOCAL, ONLY MODEL UPDATES ARE SHARED".
