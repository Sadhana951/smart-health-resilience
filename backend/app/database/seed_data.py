from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

MEDICINES_CATALOG = [
    {"id": "med-1", "name": "Paracetamol 500mg Tablets", "category": "Antipyretic / Analgesic", "unit": "Tablets", "unit_cost_inr": 0.85, "critical_threshold_days": 5, "description": "First-line management for fever and analgesia."},
    {"id": "med-2", "name": "ORS (Oral Rehydration Salts)", "category": "Dehydration / Diarrhea", "unit": "Sachets", "unit_cost_inr": 4.50, "critical_threshold_days": 7, "description": "Critical rehydration therapy for acute diarrhea and dehydration."},
    {"id": "med-3", "name": "Amoxicillin 500mg Capsules", "category": "Antibiotic", "unit": "Capsules", "unit_cost_inr": 3.20, "critical_threshold_days": 6, "description": "Broad-spectrum beta-lactam antibiotic for bacterial infections."},
    {"id": "med-4", "name": "Artesunate Injection 60mg", "category": "Anti-malarial", "unit": "Vials", "unit_cost_inr": 42.00, "critical_threshold_days": 4, "description": "Essential treatment for severe Plasmodium falciparum malaria."},
    {"id": "med-5", "name": "Anti-Rabies Vaccine (ARV)", "category": "Vaccine / Biological", "unit": "Vials", "unit_cost_inr": 285.00, "critical_threshold_days": 5, "description": "Post-exposure prophylaxis for animal bites."},
    {"id": "med-6", "name": "Regular Human Insulin 40IU/ml", "category": "Endocrine / Diabetes", "unit": "Vials", "unit_cost_inr": 145.00, "critical_threshold_days": 7, "description": "Cold-chain insulin for glycemic emergencies."},
    {"id": "med-7", "name": "Azithromycin 500mg Tablets", "category": "Antibiotic", "unit": "Tablets", "unit_cost_inr": 9.50, "critical_threshold_days": 5, "description": "Macrolide antibiotic for respiratory and gastrointestinal infections."},
    {"id": "med-8", "name": "IV Normal Saline 0.9% 500ml", "category": "Intravenous Fluids", "unit": "Bottles", "unit_cost_inr": 22.00, "critical_threshold_days": 4, "description": "Fluid replenishment and trauma resuscitation."},
    {"id": "med-9", "name": "Zinc Sulphate 20mg Tablets", "category": "Pediatric / Nutrition", "unit": "Tablets", "unit_cost_inr": 1.10, "critical_threshold_days": 6, "description": "Adjunct therapy for pediatric diarrhea and immune support."},
    {"id": "med-10", "name": "Oxytocin Injection 10IU", "category": "Maternal Health", "unit": "Ampoules", "unit_cost_inr": 18.50, "critical_threshold_days": 4, "description": "Prevention and treatment of postpartum hemorrhage (PPH)."},
    {"id": "med-11", "name": "Ciprofloxacin 500mg Tablets", "category": "Antibiotic", "unit": "Tablets", "unit_cost_inr": 2.90, "critical_threshold_days": 5, "description": "Fluoroquinolone for urinary and enteric infections."},
    {"id": "med-12", "name": "Iron & Folic Acid (IFA) Tablets", "category": "Maternal / Anemia", "unit": "Tablets", "unit_cost_inr": 0.45, "critical_threshold_days": 10, "description": "National Anemia Mukt Bharat supplementation."}
]

RAW_PHCS = [
    # ODISHA - Khordha & Cuttack Cluster
    {"id": "phc-od-01", "name": "PHC Cuttack Rural (Salipur)", "state": "Odisha", "district": "Cuttack", "lat": 20.4820, "lng": 85.9230, "population": 48500, "beds": 20, "staff": 10, "phone": "+91 671 2891001"},
    {"id": "phc-od-02", "name": "PHC Bhubaneswar North (Chandaka)", "state": "Odisha", "district": "Khordha", "lat": 20.3588, "lng": 85.7622, "population": 62000, "beds": 30, "staff": 15, "phone": "+91 674 2381202"},
    {"id": "phc-od-03", "name": "PHC Jatni Junction", "state": "Odisha", "district": "Khordha", "lat": 20.1620, "lng": 85.7080, "population": 39000, "beds": 16, "staff": 9, "phone": "+91 674 2492103"},
    {"id": "phc-od-04", "name": "PHC Athagarh Sub-divisional", "state": "Odisha", "district": "Cuttack", "lat": 20.5280, "lng": 85.6290, "population": 41200, "beds": 24, "staff": 11, "phone": "+91 671 2783104"},
    {"id": "phc-od-05", "name": "PHC Choudwar Industrial", "state": "Odisha", "district": "Cuttack", "lat": 20.5420, "lng": 85.9120, "population": 52100, "beds": 20, "staff": 12, "phone": "+91 671 2674105"},
    {"id": "phc-od-06", "name": "PHC Balianta Riverbank", "state": "Odisha", "district": "Khordha", "lat": 20.2850, "lng": 85.8920, "population": 34500, "beds": 12, "staff": 8, "phone": "+91 674 2561106"},
    {"id": "phc-od-07", "name": "PHC Banki Flood-Prone", "state": "Odisha", "district": "Cuttack", "lat": 20.3790, "lng": 85.5310, "population": 46800, "beds": 18, "staff": 9, "phone": "+91 671 2498107"},

    # ODISHA - Coastal & South Cluster
    {"id": "phc-od-08", "name": "PHC Puri Sadar (Chandanpur)", "state": "Odisha", "district": "Puri", "lat": 19.8650, "lng": 85.8290, "population": 54000, "beds": 25, "staff": 14, "phone": "+91 6752 223408"},
    {"id": "phc-od-09", "name": "PHC Konark Coastal", "state": "Odisha", "district": "Puri", "lat": 19.8970, "lng": 86.0940, "population": 31200, "beds": 14, "staff": 7, "phone": "+91 6752 236509"},
    {"id": "phc-od-10", "name": "PHC Balasore Coastal (Remuna)", "state": "Odisha", "district": "Balasore", "lat": 21.5280, "lng": 86.8710, "population": 58900, "beds": 22, "staff": 12, "phone": "+91 6782 254110"},
    {"id": "phc-od-11", "name": "PHC Jaleswar Border", "state": "Odisha", "district": "Balasore", "lat": 21.8150, "lng": 87.2140, "population": 44300, "beds": 18, "staff": 9, "phone": "+91 6782 278111"},
    {"id": "phc-od-12", "name": "PHC Berhampur Ganjam Hills", "state": "Odisha", "district": "Ganjam", "lat": 19.3150, "lng": 84.7941, "population": 67000, "beds": 30, "staff": 16, "phone": "+91 680 2233112"},
    {"id": "phc-od-13", "name": "PHC Chatrapur Sea-Belt", "state": "Odisha", "district": "Ganjam", "lat": 19.3550, "lng": 84.9920, "population": 38400, "beds": 16, "staff": 8, "phone": "+91 680 2621113"},
    {"id": "phc-od-14", "name": "PHC Aska Sugar-Belt", "state": "Odisha", "district": "Ganjam", "lat": 19.6120, "lng": 84.6600, "population": 42100, "beds": 18, "staff": 9, "phone": "+91 680 2741114"},

    # ODISHA - Western & Tribal Plateau
    {"id": "phc-od-15", "name": "PHC Sambalpur Burla Valley", "state": "Odisha", "district": "Sambalpur", "lat": 21.4980, "lng": 83.8710, "population": 51200, "beds": 24, "staff": 13, "phone": "+91 663 2431115"},
    {"id": "phc-od-16", "name": "PHC Rengali Catchment", "state": "Odisha", "district": "Sambalpur", "lat": 21.6350, "lng": 83.9980, "population": 33100, "beds": 14, "staff": 7, "phone": "+91 663 2562116"},
    {"id": "phc-od-17", "name": "PHC Rourkela Panposh", "state": "Odisha", "district": "Sundargarh", "lat": 22.2490, "lng": 84.8820, "population": 69000, "beds": 32, "staff": 17, "phone": "+91 661 2511117"},
    {"id": "phc-od-18", "name": "PHC Baripada Forest Belt", "state": "Odisha", "district": "Mayurbhanj", "lat": 21.9320, "lng": 86.7320, "population": 46500, "beds": 20, "staff": 10, "phone": "+91 6792 252118"},

    # WEST BENGAL Cluster
    {"id": "phc-wb-01", "name": "PHC Kakdwip Delta", "state": "West Bengal", "district": "South 24 Parganas", "lat": 21.8760, "lng": 88.1880, "population": 57400, "beds": 24, "staff": 11, "phone": "+91 33 2439101"},
    {"id": "phc-wb-02", "name": "PHC Diamond Harbour Estuary", "state": "West Bengal", "district": "South 24 Parganas", "lat": 22.1930, "lng": 88.2010, "population": 61200, "beds": 28, "staff": 14, "phone": "+91 33 2482102"},
    {"id": "phc-wb-03", "name": "PHC Haldia Port Perimeter", "state": "West Bengal", "district": "Purba Medinipur", "lat": 22.0620, "lng": 88.0820, "population": 49800, "beds": 22, "staff": 12, "phone": "+91 3224 252103"},
    {"id": "phc-wb-04", "name": "PHC Digha Coastal Shield", "state": "West Bengal", "district": "Purba Medinipur", "lat": 21.6260, "lng": 87.5090, "population": 36700, "beds": 16, "staff": 8, "phone": "+91 3224 266104"},
    {"id": "phc-wb-05", "name": "PHC Asansol Colliery Belt", "state": "West Bengal", "district": "Paschim Bardhaman", "lat": 23.6880, "lng": 86.9660, "population": 72300, "beds": 35, "staff": 18, "phone": "+91 341 2281105"},
    {"id": "phc-wb-06", "name": "PHC Durgapur Steel Outskirts", "state": "West Bengal", "district": "Paschim Bardhaman", "lat": 23.5200, "lng": 87.3110, "population": 64800, "beds": 26, "staff": 13, "phone": "+91 343 2541106"},
    {"id": "phc-wb-07", "name": "PHC Kurseong Valley Foothills", "state": "West Bengal", "district": "Darjeeling", "lat": 26.8820, "lng": 88.2780, "population": 29800, "beds": 14, "staff": 8, "phone": "+91 354 2341107"},

    # JHARKHAND Cluster
    {"id": "phc-jh-01", "name": "PHC Ranchi Rural (Kanke)", "state": "Jharkhand", "district": "Ranchi", "lat": 23.4320, "lng": 85.3210, "population": 53200, "beds": 25, "staff": 12, "phone": "+91 651 2451101"},
    {"id": "phc-jh-02", "name": "PHC Namkum Tribal Belt", "state": "Jharkhand", "district": "Ranchi", "lat": 23.3420, "lng": 85.3910, "population": 41800, "beds": 18, "staff": 9, "phone": "+91 651 2581102"},
    {"id": "phc-jh-03", "name": "PHC Jamshedpur Potka", "state": "Jharkhand", "district": "East Singhbhum", "lat": 22.6120, "lng": 86.2230, "population": 59100, "beds": 24, "staff": 13, "phone": "+91 657 2421103"},
    {"id": "phc-jh-04", "name": "PHC Ghatsila Sub-divisional", "state": "Jharkhand", "district": "East Singhbhum", "lat": 22.5810, "lng": 86.4820, "population": 37600, "beds": 16, "staff": 8, "phone": "+91 657 2611104"},
    {"id": "phc-jh-05", "name": "PHC Dhanbad Coalfield Outskirts", "state": "Jharkhand", "district": "Dhanbad", "lat": 23.7950, "lng": 86.4300, "population": 68400, "beds": 30, "staff": 15, "phone": "+91 326 2311105"},

    # ANDHRA PRADESH Cluster
    {"id": "phc-ap-01", "name": "PHC Visakhapatnam Rural (Anandapuram)", "state": "Andhra Pradesh", "district": "Visakhapatnam", "lat": 17.9120, "lng": 83.3980, "population": 58200, "beds": 26, "staff": 14, "phone": "+91 891 2781101"},
    {"id": "phc-ap-02", "name": "PHC Bheemunipatnam Coast", "state": "Andhra Pradesh", "district": "Visakhapatnam", "lat": 17.8920, "lng": 83.4560, "population": 43100, "beds": 18, "staff": 10, "phone": "+91 891 2891102"},
    {"id": "phc-ap-03", "name": "PHC Srikakulam Coastal Reach", "state": "Andhra Pradesh", "district": "Srikakulam", "lat": 18.2960, "lng": 83.8960, "population": 47900, "beds": 20, "staff": 11, "phone": "+91 8942 225103"},
    {"id": "phc-ap-04", "name": "PHC Tekkali Border Valley", "state": "Andhra Pradesh", "district": "Srikakulam", "lat": 18.6180, "lng": 84.2380, "population": 35400, "beds": 16, "staff": 8, "phone": "+91 8942 248104"},
    {"id": "phc-ap-05", "name": "PHC Vizianagaram Fort Outskirts", "state": "Andhra Pradesh", "district": "Vizianagaram", "lat": 18.1140, "lng": 83.4020, "population": 51900, "beds": 22, "staff": 12, "phone": "+91 8922 236105"}
]

def generate_initial_state() -> Dict[str, Any]:
    """Generates realistic synthetic state with high variance for demonstration."""
    random.seed(42)
    phcs = []
    inventory = []
    alerts = []
    redistributions = []

    now = datetime.now()
    now_iso = now.isoformat()

    # Pre-select designated test targets for guaranteed compelling demo flows:
    # Target 1: PHC Cuttack Rural (phc-od-01) has critical shortage of Paracetamol & ORS
    # Donor 1: PHC Bhubaneswar North (phc-od-02) has large surplus of Paracetamol & ORS
    # Target 2: PHC Banki Flood-Prone (phc-od-07) has warning on Saline & Artesunate

    for raw in RAW_PHCS:
        pid = raw["id"]
        bed_cap = raw["beds"]
        # beds occupied
        if pid == "phc-od-01":
            beds_occ = 17 # 85% full
            staff_pres = 8
            weather = "Heavy Monsoon Rain Warning (28°C, 92% RH)"
            disease = "Spike in acute gastroenteritis and viral fevers"
        elif pid == "phc-od-07":
            beds_occ = 16
            staff_pres = 7
            weather = "Mahanadi River High Water Level Alert"
            disease = "Elevated waterborne illness cases"
        else:
            beds_occ = int(bed_cap * random.uniform(0.35, 0.75))
            staff_pres = int(raw["staff"] * random.uniform(0.75, 1.0))
            weather = "Normal Season (31°C, 65% RH)"
            disease = "Baseline seasonal activity"

        phc_obj = {
            "id": pid,
            "name": raw["name"],
            "state": raw["state"],
            "district": raw["district"],
            "lat": raw["lat"],
            "lng": raw["lng"],
            "population_served": raw["population"],
            "bed_capacity": bed_cap,
            "beds_occupied": beds_occ,
            "staff_total": raw["staff"],
            "staff_present": staff_pres,
            "risk_level": "SAFE",
            "predicted_shortage_days": None,
            "weather_signal": weather,
            "disease_signal": disease,
            "last_updated": now_iso,
            "contact_phone": raw["phone"]
        }

        min_days_remaining = 999

        # Generate inventory for all 12 medicines
        for med in MEDICINES_CATALOG:
            mid = med["id"]
            mname = med["name"]

            # Baseline daily usage based on population
            base_usage = max(10, int((raw["population"] / 1000) * random.uniform(2.5, 6.0)))

            if pid == "phc-od-01" and mid == "med-1": # Paracetamol at Cuttack Rural
                daily_usage = 310
                current_stock = 1240
                days_rem = 4
                risk = "CRITICAL"
                pred_7d = daily_usage * 7 + 250
            elif pid == "phc-od-01" and mid == "med-2": # ORS at Cuttack Rural
                daily_usage = 180
                current_stock = 900
                days_rem = 5
                risk = "WATCH"
                pred_7d = daily_usage * 7 + 150
            elif pid == "phc-od-02" and mid == "med-1": # Paracetamol at Bhubaneswar North (Surplus donor)
                daily_usage = 190
                current_stock = 6800
                days_rem = 35
                risk = "SAFE"
                pred_7d = daily_usage * 7
            elif pid == "phc-od-02" and mid == "med-2": # ORS at Bhubaneswar North (Surplus donor)
                daily_usage = 120
                current_stock = 4500
                days_rem = 37
                risk = "SAFE"
                pred_7d = daily_usage * 7
            elif pid == "phc-od-07" and mid == "med-8": # Saline at Banki Flood-Prone
                daily_usage = 65
                current_stock = 260
                days_rem = 4
                risk = "CRITICAL"
                pred_7d = daily_usage * 7 + 100
            else:
                daily_usage = base_usage
                days_rem = random.randint(8, 45)
                current_stock = daily_usage * days_rem
                risk = "CRITICAL" if days_rem <= 5 else ("WATCH" if days_rem <= 10 else "SAFE")
                pred_7d = daily_usage * 7

            if days_rem < min_days_remaining:
                min_days_remaining = days_rem

            exp_days = random.randint(180, 540)
            exp_date = (now + timedelta(days=exp_days)).strftime("%Y-%m-%d")

            inv_item = {
                "id": f"inv-{pid}-{mid}",
                "phc_id": pid,
                "phc_name": raw["name"],
                "district": raw["district"],
                "state": raw["state"],
                "medicine_id": mid,
                "medicine_name": mname,
                "current_stock": current_stock,
                "daily_usage": daily_usage,
                "predicted_demand_7d": pred_7d,
                "days_remaining": days_rem,
                "risk_level": risk,
                "expiry_date": exp_date,
                "batch_no": f"BATCH-{random.randint(100, 999)}K",
                "reorder_quantity": daily_usage * 20
            }
            inventory.append(inv_item)

        phc_obj["predicted_shortage_days"] = min_days_remaining
        if min_days_remaining <= 5:
            phc_obj["risk_level"] = "CRITICAL"
        elif min_days_remaining <= 10:
            phc_obj["risk_level"] = "WATCH"
        else:
            phc_obj["risk_level"] = "SAFE"

        phcs.append(phc_obj)

    # Initial realistic Alerts
    alerts.append({
        "id": "alt-001",
        "phc_id": "phc-od-01",
        "phc_name": "PHC Cuttack Rural (Salipur)",
        "district": "Cuttack",
        "state": "Odisha",
        "medicine_id": "med-1",
        "medicine_name": "Paracetamol 500mg Tablets",
        "severity": "CRITICAL",
        "alert_type": "STOCKOUT_RISK",
        "message": "Paracetamol 500mg stock-out projected in 4 days. Surge in febrile patient footfall.",
        "days_remaining": 4,
        "recommended_action": "Transfer 1,500 units from surplus buffer at PHC Bhubaneswar North.",
        "timestamp": (now - timedelta(minutes=18)).isoformat(),
        "status": "ACTIVE"
    })

    alerts.append({
        "id": "alt-002",
        "phc_id": "phc-od-07",
        "phc_name": "PHC Banki Flood-Prone",
        "district": "Cuttack",
        "state": "Odisha",
        "medicine_id": "med-8",
        "medicine_name": "IV Normal Saline 0.9% 500ml",
        "severity": "CRITICAL",
        "alert_type": "STOCKOUT_RISK",
        "message": "IV Saline buffer depleted to 4 days amid river catchment surge.",
        "days_remaining": 4,
        "recommended_action": "Execute inter-facility dispatch of 250 bottles from Choudwar Industrial.",
        "timestamp": (now - timedelta(minutes=45)).isoformat(),
        "status": "ACTIVE"
    })

    alerts.append({
        "id": "alt-003",
        "phc_id": "phc-od-01",
        "phc_name": "PHC Cuttack Rural (Salipur)",
        "district": "Cuttack",
        "state": "Odisha",
        "medicine_id": "med-2",
        "medicine_name": "ORS (Oral Rehydration Salts)",
        "severity": "WARNING",
        "alert_type": "STOCKOUT_RISK",
        "message": "ORS demand spiked +38% due to localized water contamination signal.",
        "days_remaining": 5,
        "recommended_action": "Stage 800 sachets reorder or initiate mutual-aid transfer.",
        "timestamp": (now - timedelta(hours=2)).isoformat(),
        "status": "ACTIVE"
    })

    alerts.append({
        "id": "alt-004",
        "phc_id": "phc-wb-01",
        "phc_name": "PHC Kakdwip Delta",
        "district": "South 24 Parganas",
        "state": "West Bengal",
        "medicine_id": "med-4",
        "medicine_name": "Artesunate Injection 60mg",
        "severity": "WARNING",
        "alert_type": "WEATHER_SURGE",
        "message": "High tidal ingress warning. Antimalarial consumption expected to rise.",
        "days_remaining": 6,
        "recommended_action": "Monitor district vaccine/antimalarial pool.",
        "timestamp": (now - timedelta(hours=3, minutes=10)).isoformat(),
        "status": "ACTIVE"
    })

    alerts.append({
        "id": "alt-005",
        "phc_id": "phc-od-02",
        "phc_name": "PHC Bhubaneswar North (Chandaka)",
        "district": "Khordha",
        "state": "Odisha",
        "medicine_id": "med-1",
        "medicine_name": "Paracetamol 500mg Tablets",
        "severity": "INFO",
        "alert_type": "SURPLUS_STOCK",
        "message": "Surplus inventory detected: 3,500 units available above 21-day reserve requirement.",
        "days_remaining": 35,
        "recommended_action": "Designated as primary mutual-aid replenishment hub for Cuttack cluster.",
        "timestamp": (now - timedelta(hours=5)).isoformat(),
        "status": "ACTIVE"
    })

    # Initial Redistribution Recommendations
    redistributions.append({
        "id": "rec-001",
        "from_phc_id": "phc-od-02",
        "from_phc_name": "PHC Bhubaneswar North (Chandaka)",
        "from_district": "Khordha",
        "from_current_stock": 6800,
        "to_phc_id": "phc-od-01",
        "to_phc_name": "PHC Cuttack Rural (Salipur)",
        "to_district": "Cuttack",
        "to_current_stock": 1240,
        "medicine_id": "med-1",
        "medicine_name": "Paracetamol 500mg Tablets",
        "quantity": 1500,
        "distance_km": 34.2,
        "priority": "HIGH",
        "status": "PENDING",
        "reason": "Projected stock-out within 4 days at Salipur. Donor retains 5,300 units (28 days reserve).",
        "eta_hours": 1.5,
        "route_coordinates": [
            [20.3588, 85.7622],
            [20.3800, 85.8200],
            [20.4400, 85.8900],
            [20.4820, 85.9230]
        ],
        "created_at": (now - timedelta(minutes=15)).isoformat()
    })

    redistributions.append({
        "id": "rec-002",
        "from_phc_id": "phc-od-05",
        "from_phc_name": "PHC Choudwar Industrial",
        "from_district": "Cuttack",
        "from_current_stock": 1200,
        "to_phc_id": "phc-od-07",
        "to_phc_name": "PHC Banki Flood-Prone",
        "to_district": "Cuttack",
        "to_current_stock": 260,
        "medicine_id": "med-8",
        "medicine_name": "IV Normal Saline 0.9% 500ml",
        "quantity": 300,
        "distance_km": 42.8,
        "priority": "HIGH",
        "status": "PENDING",
        "reason": "Flash river rise in Banki catchment area. Donor retains 900 bottles (18 days reserve).",
        "eta_hours": 1.8,
        "route_coordinates": [
            [20.5420, 85.9120],
            [20.4600, 85.7500],
            [20.3790, 85.5310]
        ],
        "created_at": (now - timedelta(minutes=40)).isoformat()
    })

    return {
        "phcs": phcs,
        "medicines": MEDICINES_CATALOG,
        "inventory": inventory,
        "alerts": alerts,
        "redistributions": redistributions
    }
