export interface IncidentFormValues {
  title: string;
  description: string;
  category: string;
  location: string;
  weather_context: string;
}

export interface IncidentAnalysisResult {
  incident_type: string;
  severity: string;
  short_summary: string;
  possible_risks: string[];
  priority: string;
  recommended_immediate_actions: string[];
  risk_score: number;
  citizen_instructions: string[];
  volunteer_instructions: string[];
  government_recommendations: string[];
  report_markdown: string;
}

export interface IncidentReportResult {
  incident_summary: string;
  risk_score: number;
  ai_reasoning: string;
  recommended_actions: string[];
  required_resources: string[];
  report_markdown: string;
}
