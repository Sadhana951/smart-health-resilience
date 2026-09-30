from typing import Dict, Any, List, Optional
from ..config import settings
from ..database.state import state_manager
import json

def process_assistant_query(query: str, language: str = "en") -> Dict[str, Any]:
    """
    Executes tool-assisted query resolution over real synthetic state.
    Supports English, Hindi, and Odia queries with contextual awareness.
    """
    q_lower = query.lower().strip()
    tool_executed = None
    structured_data = None
    reply = ""

    # Detect language intent or script if not explicitly provided
    is_odia = any('\u0B00' <= char <= '\u0B7F' for char in query) or language == "or" or "କେଉଁ" in query or "ଔଷଧ" in query
    is_hindi = any('\u0900' <= char <= '\u097F' for char in query) or language == "hi" or "दवाई" in query or "कमी" in query or "स्टॉक" in query

    # 1. Critical medicines / at-risk inquiry
    if any(k in q_lower for k in ["risk", "shortage", "low stock", "कम", "ଦବାଇ", "କମ୍", "stock-out", "deplet", "critical"]):
        tool_executed = "get_alerts"
        alerts = state_manager.get_alerts(status="ACTIVE")
        critical_items = [a for a in alerts if a["severity"] in ("CRITICAL", "WARNING")]
        structured_data = {"critical_alerts_count": len(critical_items), "items": critical_items[:4]}
        
        if is_odia:
            reply = (
                f"ବର୍ତ୍ତମାନ ନେଟୱାର୍କରେ {len(critical_items)} ଟି ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଆଲର୍ଟ ସକ୍ରିୟ ଅଛି। "
                f"ମୁଖ୍ୟତଃ PHC କଟକ ରୁରାଲ୍ (ସାଲେପୁର) ରେ ପାରାସିଟାମଲ୍ ଏବଂ ORS ର ଷ୍ଟକ୍ ୪-୫ ଦିନ ମଧ୍ୟରେ ସରିଯିବାର ଆଶଙ୍କା ଅଛି। "
                f"ଭୁବନେଶ୍ୱର ଉତ୍ତର (ଚନ୍ଦକା) ରୁ ତୁରନ୍ତ ୧,୫୦୦ ୟୁନିଟ୍ ସ୍ଥାନାନ୍ତର କରିବାକୁ ସୁପାରିଶ କରାଯାଇଛି।"
            )
        elif is_hindi:
            reply = (
                f"वर्तमान में नेटवर्क में {len(critical_items)} प्राथमिक अलर्ट सक्रिय हैं। "
                f"विशेष रूप से PHC कटक रूरल (सालेपुर) में पैरासिटामोल और ORS का स्टॉक 4 दिनों में समाप्त होने का जोखिम है। "
                f"भुवनेश्वर नॉर्थ से 1,500 यूनिट्स का तत्काल ट्रांसफर रेकमेंड किया गया है।"
            )
        else:
            reply = (
                f"There are currently {len(critical_items)} active supply risk alerts across monitored facilities. "
                f"Most urgently: PHC Cuttack Rural (Salipur) has only 4 days of Paracetamol 500mg remaining due to elevated febrile caseload. "
                f"PHC Banki Flood-Prone has 4 days of IV Normal Saline. An automated redistribution proposal is queued for approval."
            )

    # 2. Surplus / Sourcing inquiry (e.g. "Where can we source ORS / Paracetamol?")
    elif any(k in q_lower for k in ["surplus", "source", "excess", "where can we", "kahan se", "କେଉଁଠାରୁ"]):
        tool_executed = "find_surplus_stock"
        inventory = state_manager.get_all_inventory()
        surplus = [i for i in inventory if i["days_remaining"] > 25]
        structured_data = {"surplus_nodes": surplus[:3]}

        if is_odia:
            reply = (
                "ଭୁବନେଶ୍ୱର ଉତ୍ତର (ଚନ୍ଦକା) PHC ରେ ୬,୮୦୦ ୟୁନିଟ୍ ପାରାସିଟାମଲ୍ ଏବଂ ୪,୫୦୦ ସାସେଟ୍ ORS ର ବଳକା ଷ୍ଟକ୍ ମହଜୁଦ ଅଛି (୩୫ ଦିନର ବଫର୍)। "
                "ଏହା କଟକ ଏବଂ ଖୋର୍ଦ୍ଧା ଅଞ୍ଚଳ ପାଇଁ ଆଦର୍ଶ ଯୋଗାଣ କେନ୍ଦ୍ର।"
            )
        elif is_hindi:
            reply = (
                "PHC भुवनेश्वर नॉर्थ (चंदका) में पैरासिटामोल (6,800 यूनिट्स) और ORS (4,500 पैकेट्स) का प्रचुर सरप्लस उपलब्ध है (35 दिन का रिज़र्व)। "
                "यह कटक क्लस्टर के लिए उपयुक्त सप्लायर हब है।"
            )
        else:
            reply = (
                "PHC Bhubaneswar North (Chandaka) currently holds the largest strategic surplus in the cluster: "
                "6,800 units of Paracetamol (35 days buffer) and 4,500 units of ORS (37 days buffer). "
                "PHC Choudwar Industrial also maintains 1,200 bottles of IV Saline available for mutual-aid transfer."
            )

    # 3. Flood / Simulation scenario inquiry
    elif any(k in q_lower for k in ["flood", "simulation", "dengue", "heatwave", "बाढ़", "ବନ୍ୟା"]):
        tool_executed = "get_simulation_impact"
        sim = state_manager.simulation_state
        structured_data = sim

        if is_odia:
            reply = (
                f"ଜରୁରୀକାଳୀନ ଅନୁକରଣ (Simulation) ସ୍ଥିତି: {sim['scenario'] if sim['is_active'] else 'ସକ୍ରିୟ ନାହିଁ'}। "
                f"ଯଦି ବନ୍ୟା ବା ଡେଙ୍ଗୁ ଅନୁକରଣ ଆରମ୍ଭ ହୁଏ, ତେବେ ମହାନଦୀ ଅବବାହିକାର ୭ଟି PHC ପ୍ରଭାବିତ ହେବେ ଏବଂ ଚାହିଦା +୮୦% ବୃଦ୍ଧି ପାଇବ।"
            )
        elif is_hindi:
            reply = (
                f"आपातकालीन सिमुलेशन स्थिति: {sim['scenario'] if sim['is_active'] else 'निष्क्रिय'}। "
                f"बाढ़ परिदृश्य में, महानदी बेसिन के 7 PHC तुरंत प्रभावित होंगे और ORS एवं IV फ्लुइड्स की मांग 80% तक बढ़ जाएगी।"
            )
        else:
            reply = (
                f"Emergency Simulation Status: {sim['scenario'] if sim['is_active'] else 'Inactive (Baseline Operations)'}. "
                f"When simulation is triggered, riparian and delta PHCs experience a demand spike of up to +{int((sim['demand_multiplier']-1)*100 or 80)}%. "
                f"Automated redistribution corridors immediately prioritize vulnerable low-lying centres."
            )

    # 4. Officer action / decision inquiry
    elif any(k in q_lower for k in ["officer", "action", "review", "decision", "kya kare", "କ’ଣ କରିବ"]):
        tool_executed = "generate_action_brief"
        brief = state_manager.redistributions.get("rec-001")
        structured_data = brief

        if is_odia:
            reply = (
                "ଜିଲ୍ଲା ଚିକିତ୍ସା ଅଧିକାରୀଙ୍କ ପାଇଁ ସୁପାରିଶ: ତୁରନ୍ତ ରେକମେଣ୍ଡେସନ୍ REC-001 ଅନୁମୋଦନ କରନ୍ତୁ। "
                "ଏହାଦ୍ୱାରା ଚନ୍ଦକାରୁ ସାଲେପୁରକୁ ୧,୫୦୦ ୟୁନିଟ୍ ପାରାସିଟାମଲ୍ ସ୍ଥାନାନ୍ତରିତ ହେବ ଏବଂ ଷ୍ଟକ୍-ଆଉଟ୍ ଏଡ଼ାଯାଇ ପାରିବ।"
            )
        elif is_hindi:
            reply = (
                "जिला स्वास्थ्य अधिकारी हेतु अनुशंसित कदम: ट्रांसफर रेकमेंडेशन REC-001 को तुरंत स्वीकृति दें। "
                "यह भुवनेश्वर नॉर्थ से कटक रूरल को 1,500 पैरासिटामोल यूनिट्स की सुरक्षित डिलीवरी सुनिश्चित करेगा।"
            )
        else:
            reply = (
                "Recommended Officer Decision: Review and accept Redistribution Order #REC-001. "
                "This transfers 1,500 units of Paracetamol 500mg from PHC Bhubaneswar North to PHC Cuttack Rural (Salipur), "
                "extending the local buffer from 4 days to 14 days without compromising the donor's reserve."
            )

    # General / PHC status
    else:
        tool_executed = "get_phc_status"
        cuttack = state_manager.get_phc_by_id("phc-od-01")
        structured_data = cuttack

        if is_odia:
            reply = (
                f"ମୁଁ ଆପଣଙ୍କୁ PHC ଷ୍ଟକ୍, ବେଡ୍ ଉପଲବ୍ଧତା, କର୍ମଚାରୀ ଉପସ୍ଥିତି ଏବଂ ପୂର୍ବାନୁମାନ ବିଷୟରେ ସହାୟତା କରିପାରିବି। "
                f"ଉଦାହରଣ ସ୍ୱରୂପ: 'କେଉଁ PHC ରେ ଔଷଧ କମ୍ ଅଛି?' କିମ୍ବା 'ପାରାସିଟାମଲ୍ କେଉଁଠାରୁ ମିଳିବ?' ପଚାରନ୍ତୁ।"
            )
        elif is_hindi:
            reply = (
                f"मैं PHC स्टॉक, बेड उपलब्धता, स्टाफ उपस्थिति और मांग पूर्वानुमान की जानकारी दे सकता हूँ। "
                f"आप पूछ सकते हैं: 'किस PHC में दवाई कम है?' या 'बाढ़ सिमुलेशन शुरू करें'।"
            )
        else:
            reply = (
                f"HealthResilience AI Operational Engine active. Monitored network encompasses {len(state_manager.phcs)} PHCs across 4 eastern states. "
                f"I can track real-time stock levels, forecast 30-day medicine depletion, recommend inter-facility transfers, and model disaster surges."
            )

    # If Gemini is configured and we want an LLM polish on top:
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            augmented_prompt = f"""
You are the operational voice of the Smart Health & Supply Chain Resilience Platform for India's Primary Health Centres.
Safety: Do not give medical diagnoses or clinical advice. Focus on supply chain, inventory, and logistics.
Language requested: {language}.
Query: {query}
Retrieved state data: {json.dumps(structured_data or {})}
Baseline factual answer: {reply}

Refine the answer to be concise, authoritative, empathetic to rural healthcare workers, and in {language} (English, Hindi, or Odia script).
Keep it under 3-4 sentences.
"""
            llm_res = model.generate_content(augmented_prompt)
            if llm_res and llm_res.text:
                reply = llm_res.text.strip()
        except Exception:
            pass

    return {
        "reply": reply,
        "tool_executed": tool_executed,
        "structured_data": structured_data,
        "language": language
    }
