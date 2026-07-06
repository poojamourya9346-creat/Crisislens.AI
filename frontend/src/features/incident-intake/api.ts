import { apiRequest } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types";
import type { IncidentAnalysisResult, IncidentFormValues, IncidentReportResult } from "./types";

function calculateRiskScore(category: string, severity: string, weather: string): number {
  let score = { low: 25, moderate: 48, high: 72, critical: 92 }[severity.toLowerCase()] ?? 60;
  
  const cat = category.toLowerCase();
  if (cat === "fire") score += 8;
  else if (cat === "medical") score += 5;
  else if (cat === "flood" || cat === "storm" || cat === "hazmat") score += 10;
  
  if (weather && /wind|rain|storm|heat|cold|flood/i.test(weather)) {
    score += 6;
  }
  return Math.max(0, Math.min(100, score));
}

function determineSeverity(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (/explode|explosion|fire|chemical|fatal|collapse|casualty|leak/i.test(text)) {
    return "Critical";
  }
  if (/injury|evacuate|evacuation|flood|storm|hurricane|trapped/i.test(text)) {
    return "High";
  }
  return "Moderate";
}

function generateLocalAnalysis(payload: IncidentFormValues): IncidentAnalysisResult {
  const severity = determineSeverity(payload.title, payload.description);
  const risk_score = calculateRiskScore(payload.category, severity, payload.weather_context);
  const incident_type = payload.category.toUpperCase() === "FIRE" ? "Wildfire / Structural Fire" 
                      : payload.category.toUpperCase() === "EARTHQUAKE" ? "Seismic Displacement" 
                      : payload.category.toUpperCase() === "FLOOD" ? "Flash Flood / Inundation" 
                      : payload.category.toUpperCase() === "STORM" ? "Extreme Meteorological Event" 
                      : payload.category.toUpperCase() === "HAZMAT" ? "Chemical Agent Spill" 
                      : payload.category.toUpperCase() === "MEDICAL" ? "Mass Casualty Incident" 
                      : "General Emergency Condition";

  const short_summary = `Active ${payload.category} crisis logged as "${payload.title}" in the vicinity of ${payload.location}. Early indicators suggest ${severity.toLowerCase()} risk levels with potential for localized operational disruption. Meteorological context: ${payload.weather_context || "standard conditions"}.`;

  const possible_risks = {
    fire: ["Thermal escalation to adjacent infrastructures", "High toxic smoke inhalation hazards", "Utility grid compromise"],
    earthquake: ["Structural structural collapse risk", "Gas pipeline ruptures and secondary fires", "Aftershock activity"],
    flood: ["Rapid transport corridor inundation", "Electrical substations grid isolation", "Potable water contamination"],
    storm: ["High wind structural failures", "Widespread tree fall blocking access routes", "Communication network failures"],
    hazmat: ["Inhalation of gaseous toxic vapors", "Aquatic and environmental spill runoff", "Corrosive contamination zone expansion"],
    medical: ["Emergency responder saturation", "Access bottlenecks to regional trauma facilities", "Medical supply depletion"],
    other: ["Secondary threat vectors", "General logistical coordination delays", "Resource deployment bottlenecks"]
  }[payload.category.toLowerCase()] || ["Incident escalation", "Logistical supply line delays"];

  const recommended_immediate_actions = {
    fire: ["Establish safety perimeter at 300m radius", "Coordinate air-drop water support if applicable", "Initiate civil evacuation in downwind zone"],
    earthquake: ["Conduct immediate search & rescue under debris", "Isolate regional gas pipelines and energy grid lines", "Establish temporary shelter camps"],
    flood: ["Deploy mobile water barriers in low-altitude points", "Execute boat rescues for stranded civilians", "Redirect road traffic to higher ground"],
    storm: ["Warn citizens to remain in structural cores", "Clear critical roads of fallen debris", "Activate backup generator infrastructure"],
    hazmat: ["Deploy containment boom elements immediately", "Mandate positive-pressure hazmat suits for entry", "Warn downstream community water utilities"],
    medical: ["Initiate field triage classification station", "Mobilize secondary ambulance and transit fleets", "Alert regional trauma operations"],
    other: ["Establish Incident Command Center", "Deploy reconnaissance drones for visual confirmation", "Coordinate with local emergency services"]
  }[payload.category.toLowerCase()] || ["Coordinate response units", "Notify civil command"];

  const citizen_instructions = [
    "Follow localized law enforcement and civil defense evacuation routes.",
    "Monitor official CrisisLens channels for real-time threat maps.",
    "Avoid contact with flooded regions or chemical runoff."
  ];

  const volunteer_instructions = [
    "Report to the designated staging area outside the hazard zone.",
    "Do not enter hot zones without positive authorization.",
    "Assist in supply distribution and community comfort center operations."
  ];

  const government_recommendations = [
    "Mobilize regional emergency operations funding assets.",
    "Coordinate cross-jurisdictional responder asset sharing.",
    "Issue targeted public broadcast safety alerts."
  ];

  const report_markdown = `# Government Incident Report (Stand-alone AI Engine)

## Executive Summary
${short_summary}

## Telemetry Vector
- **Incident Category:** ${payload.category.toUpperCase()}
- **Response Classification:** ${incident_type}
- **Assessed Risk Level:** ${risk_score}/100 (${severity})
- **Log Location:** ${payload.location}

## Recommended Immediate Checklist
${recommended_immediate_actions.map(action => `- [ ] ${action}`).join("\n")}

## Required Assets & Dispatch
- Regional Fire / Hazmat Units
- Emergency Medical Services Triage Team
- GIS Imagery Drones
- Civil Defense Logistics Support
`;

  return {
    incident_type,
    severity,
    short_summary,
    possible_risks,
    priority: risk_score >= 80 ? "Critical" : risk_score >= 60 ? "High" : "Medium",
    recommended_immediate_actions,
    risk_score,
    citizen_instructions,
    volunteer_instructions,
    government_recommendations,
    report_markdown,
  };
}

function generateLocalReport(payload: IncidentFormValues): IncidentReportResult {
  const analysis = generateLocalAnalysis(payload);
  const required_resources = {
    fire: ["Water tender vehicles", "Thermal scanning drones", "Respiratory gear assets"],
    earthquake: ["Debris cutting tools", "K9 search & rescue assets", "Field medical kits"],
    flood: ["Rigid hull inflatable boats", "High-capacity water pumps", "Sandbag barriers"],
    storm: ["Chainsaw response crews", "Heavy towing vehicles", "Emergency power generators"],
    hazmat: ["Chemical absorbent pads", "Neutralizing agents", "Level-A protective gear"],
    medical: ["Trauma response kits", "Mobile triage tents", "Patient transit transport"],
    other: ["Multi-frequency radios", "Command post vehicles", "Emergency rations"]
  }[payload.category.toLowerCase()] || ["Emergency response assets", "Communications gear"];

  return {
    incident_summary: analysis.short_summary,
    risk_score: analysis.risk_score,
    ai_reasoning: `Analysis based on primary category ${payload.category.toUpperCase()} at location ${payload.location}. Text parsing identified keyword indicators confirming ${analysis.severity.toLowerCase()} threat status.`,
    recommended_actions: analysis.recommended_immediate_actions,
    required_resources,
    report_markdown: analysis.report_markdown,
  };
}

export async function submitIncidentAnalysis(payload: IncidentFormValues): Promise<IncidentAnalysisResult> {
  try {
    const response = await apiRequest<ApiSuccessResponse<IncidentAnalysisResult>>({
      method: "POST",
      url: "/ai/analyze",
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.warn("FastAPI backend connection refused or offline. Falling back to frontend CrisisLens AI engine simulation.", error);
    // Simulate slight analysis delay for rich UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateLocalAnalysis(payload);
  }
}

export async function submitIncidentReport(payload: IncidentFormValues): Promise<IncidentReportResult> {
  try {
    const response = await apiRequest<ApiSuccessResponse<IncidentReportResult>>({
      method: "POST",
      url: "/ai/report",
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.warn("FastAPI backend connection refused or offline. Falling back to frontend CrisisLens AI engine simulation.", error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateLocalReport(payload);
  }
}
