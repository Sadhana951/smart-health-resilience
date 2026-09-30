import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    app_title: 'SMART HEALTH',
    tagline: 'Predict shortages. Move resources faster. Strengthen healthcare resilience.',
    cmd_center: 'COMMAND CENTER',
    sim_data_badge: 'SYNTHETIC DEMO DATA',
    built_for_india: 'BUILT FOR INDIA-SCALE HEALTH RESILIENCE',

    // Nav
    nav_overview: 'Overview',
    nav_network: 'PHC Network',
    nav_inventory: 'Inventory',
    nav_forecasts: 'Forecasts',
    nav_alerts: 'Alerts',
    nav_redistribution: 'Redistribution',
    nav_assistant: 'AI Assistant',
    nav_federated: 'Federated Learning',
    nav_simulation: 'Simulation Mode',

    // Metrics
    metric_total_phcs: 'TOTAL PHCs',
    metric_active_alerts: 'ACTIVE ALERTS',
    metric_meds_at_risk: 'MEDICINES AT RISK',
    metric_beds_avail: 'BEDS AVAILABLE',
    metric_staff_present: 'STAFF ON DUTY',
    metric_stock_visibility: 'STOCK VISIBILITY',

    // Status
    status_safe: 'SAFE',
    status_watch: 'WATCH',
    status_critical: 'CRITICAL',
    status_accepted: 'ACCEPTED',
    status_pending: 'PENDING',

    // Actions
    btn_enter: 'ENTER COMMAND CENTER',
    btn_how_it_works: 'WATCH HOW IT WORKS',
    btn_accept: 'ACCEPT RECOMMENDATION',
    btn_reject: 'REJECT',
    btn_view_details: 'VIEW DETAILS',
    btn_ask_ai: 'ASK AI',
    btn_action_brief: 'GENERATE GEMINI ACTION BRIEF',
    btn_start_sim: 'START EMERGENCY SIMULATION',
    btn_stop_sim: 'STOP SIMULATION',
    btn_train_round: 'EXECUTE PRIVACY-PRESERVING ROUND',

    // Headlines
    hero_headline: 'Healthcare Supply Chains That See the Shortage Before It Happens.',
    hero_subheadline: "An AI-powered resilience platform giving India's Primary Health Centres real-time visibility into medicines, beds, staff and emerging health risks.",
    problem_title: 'When healthcare demand changes, supply chains must change faster.',
    
    // Assistant
    ai_title: 'HealthResilience AI',
    ai_subtitle: 'Ask about PHC resources, supply risks and operational signals.'
  },
  hi: {
    // Brand
    app_title: 'स्मार्ट हेल्थ',
    tagline: 'दवाइयों की कमी का पूर्वानुमान लगाएं। संसाधनों को तेजी से पहुंचाएं। स्वास्थ्य तंत्र को मजबूत बनाएं।',
    cmd_center: 'कमांड सेंटर',
    sim_data_badge: 'सिमुलेशन डेमो डेटा',
    built_for_india: 'भारत-स्तरीय स्वास्थ्य लचीलेपन हेतु निर्मित',

    // Nav
    nav_overview: 'अवलोकन',
    nav_network: 'PHC नेटवर्क',
    nav_inventory: 'इन्वेंटरी',
    nav_forecasts: 'पूर्वानुमान',
    nav_alerts: 'अलर्ट्स',
    nav_redistribution: 'पुनर्वितरण',
    nav_assistant: 'AI सहायक',
    nav_federated: 'फेडरेटेड लर्निंग',
    nav_simulation: 'आपातकालीन सिमुलेशन',

    // Metrics
    metric_total_phcs: 'कुल प्राथमिक स्वास्थ्य केंद्र',
    metric_active_alerts: 'सक्रिय चेतावनियां',
    metric_meds_at_risk: 'जोखिम में दवाइयां',
    metric_beds_avail: 'उपलब्ध बिस्तर',
    metric_staff_present: 'ड्यूटी पर कर्मी',
    metric_stock_visibility: 'स्टॉक दृश्यता',

    // Status
    status_safe: 'सुरक्षित',
    status_watch: 'निगरानी',
    status_critical: 'गंभीर',
    status_accepted: 'स्वीकृत',
    status_pending: 'लंबित',

    // Actions
    btn_enter: 'कमांड सेंटर खोलें',
    btn_how_it_works: 'कार्यप्रणाली देखें',
    btn_accept: 'सिफारिश स्वीकार करें',
    btn_reject: 'अस्वीकार करें',
    btn_view_details: 'विवरण देखें',
    btn_ask_ai: 'AI से पूछें',
    btn_action_brief: 'जेमिनी एक्शन ब्रीफ बनाएं',
    btn_start_sim: 'आपातकालीन सिमुलेशन शुरू करें',
    btn_stop_sim: 'सिमुलेशन रोकें',
    btn_train_round: 'प्राइवेसी-सुरक्षित राउंड चलाएं',

    // Headlines
    hero_headline: 'स्वास्थ्य आपूर्ति श्रृंखला जो कमी होने से पहले ही देख लेती है।',
    hero_subheadline: 'भारत के प्राथमिक स्वास्थ्य केंद्रों (PHC) को दवाओं, बेड, स्टाफ और उभरते जोखिमों की रीयल-टाइम दृश्यता प्रदान करने वाला AI प्लेटफॉर्म।',
    problem_title: 'जब स्वास्थ्य मांग बदलती है, तो आपूर्ति श्रृंखला को और तेज बदलना होगा।',

    // Assistant
    ai_title: 'हेल्थरेज़िलिएंस AI',
    ai_subtitle: 'PHC संसाधन, आपूर्ति जोखिम और परिचालन संकेतों के बारे में पूछें।'
  },
  or: {
    // Brand
    app_title: 'ସ୍ମାର୍ଟ ହେଲଥ୍',
    tagline: 'ଅଭାବ ପୂର୍ବାନୁମାନ କରନ୍ତୁ। ସମ୍ବଳ ଶୀଘ୍ର ପଠାନ୍ତୁ। ସ୍ୱାସ୍ଥ୍ୟ ବ୍ୟବସ୍ଥାକୁ ସୁଦୃଢ଼ କରନ୍ତୁ।',
    cmd_center: 'କମାଣ୍ଡ ସେଣ୍ଟର',
    sim_data_badge: 'ସିମୁଲେସନ୍ ଡେମୋ ତଥ୍ୟ',
    built_for_india: 'ଭାରତ-ସ୍ତରୀୟ ସ୍ୱାସ୍ଥ୍ୟ ସ୍ଥିତିସ୍ଥାପକତା ପାଇଁ ନିର୍ମିତ',

    // Nav
    nav_overview: 'ଅବଲୋକନ',
    nav_network: 'PHC ନେଟୱାର୍କ',
    nav_inventory: 'ଔଷଧ ଭଣ୍ଡାର',
    nav_forecasts: 'ପୂର୍ବାନୁମାନ',
    nav_alerts: 'ସତର୍କ ସୂଚନା',
    nav_redistribution: 'ପୁନର୍ବିତରଣ',
    nav_assistant: 'AI ସହାୟକ',
    nav_federated: 'ଫେଡେରେଟେଡ୍ ଲର୍ଣ୍ଣିଂ',
    nav_simulation: 'ଜରୁରୀକାଳୀନ ସିମୁଲେସନ୍',

    // Metrics
    metric_total_phcs: 'ସମୁଦାୟ PHC କେନ୍ଦ୍ର',
    metric_active_alerts: 'ସକ୍ରିୟ ସତର୍କତା',
    metric_meds_at_risk: 'ସଙ୍କଟାପନ୍ନ ଔଷଧ',
    metric_beds_avail: 'ଉପଲବ୍ଧ ଶଯ୍ୟା',
    metric_staff_present: 'ଉପସ୍ଥିତ କର୍ମଚାରୀ',
    metric_stock_visibility: 'ଷ୍ଟକ୍ ସ୍ପଷ୍ଟତା',

    // Status
    status_safe: 'ସୁରକ୍ଷିତ',
    status_watch: 'ନଜରରେ',
    status_critical: 'ସଙ୍କଟାପନ୍ନ',
    status_accepted: 'ଗୃହୀତ',
    status_pending: 'ବକେୟା',

    // Actions
    btn_enter: 'କମାଣ୍ଡ ସେଣ୍ଟର ପ୍ରବେଶ',
    btn_how_it_works: 'କାର୍ଯ୍ୟପଦ୍ଧତି ଦେଖନ୍ତୁ',
    btn_accept: 'ସୁପାରିଶ ଗ୍ରହଣ କରନ୍ତୁ',
    btn_reject: 'ପ୍ରତ୍ୟାଖ୍ୟାନ',
    btn_view_details: 'ବିସ୍ତୃତ ଦେଖନ୍ତୁ',
    btn_ask_ai: 'AI କୁ ପଚାରନ୍ତୁ',
    btn_action_brief: 'ଜେମିନି ଆକ୍ସନ୍ ବ୍ରିଫ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ',
    btn_start_sim: 'ଜରୁରୀକାଳୀନ ସିମୁଲେସନ୍ ଆରମ୍ଭ',
    btn_stop_sim: 'ସିମୁଲେସନ୍ ବନ୍ଦ କରନ୍ତୁ',
    btn_train_round: 'ନୂତନ ପ୍ରଶିକ୍ଷଣ ଚକ୍ର ଚଳାନ୍ତୁ',

    // Headlines
    hero_headline: 'ସ୍ୱାସ୍ଥ୍ୟ ଯୋଗାଣ ଶୃଙ୍ଖଳା — ଯାହା ଅଭାବ ଘଟିବା ପୂର୍ବରୁ ହିଁ ସତର୍କ କରେ।',
    hero_subheadline: 'ଭାରତର ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC) ଗୁଡ଼ିକ ପାଇଁ ଔଷଧ, ବେଡ୍, କର୍ମଚାରୀ ଏବଂ ବିପଦର ତୁରନ୍ତ ତଦାରଖ କରୁଥିବା AI ପ୍ଲାଟଫର୍ମ।',
    problem_title: 'ସ୍ୱାସ୍ଥ୍ୟ ଚାହିଦା ବଢ଼ିଲେ, ଯୋଗାଣ ବ୍ୟବସ୍ଥା ଆହୁରି ଦ୍ରୁତଗତିରେ ବଦଳିବା ଆବଶ୍ୟକ।',

    // Assistant
    ai_title: 'ହେଲଥରେଜିଲିଏନ୍ସ AI',
    ai_subtitle: 'PHC ସମ୍ବଳ, ଔଷଧ ଅଭାବ ଏବଂ ଜରୁରୀକାଳୀନ ସ୍ଥିତି ସମ୍ପର୍କରେ ପଚାରନ୍ତୁ।'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
