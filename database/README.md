# Database & Schema Architecture

## Collections & Schemas
- `phcs`: Geospatial Primary Health Centres metadata (ID, coordinates, population, beds, staff, risk level).
- `medicines`: Formulary definitions and critical safety thresholds.
- `inventory`: Real-time stock levels, daily run rates, days remaining, expiry dates, and batch numbers.
- `alerts`: Operational disruption and stock-out triage alerts.
- `redistribution_requests` & `redistribution_recommendations`: Inter-facility logistics orders.
- `action_briefs`: Gemini AI-generated 5-point operational plans.
- `simulation_state`: Disaster stress-testing state.
- `federated_nodes`: Privacy-preserving consortium node metadata.

## Firebase Integration
The system is 100% Firebase and Google Cloud Firestore compatible. When Firestore credentials or project ID are configured, data syncs natively with Firestore collections. In local demo mode, a high-performance in-memory state container operates seamlessly without external database overhead.
