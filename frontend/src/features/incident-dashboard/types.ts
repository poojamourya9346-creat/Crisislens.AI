export interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  weather_context: string;
  status: "submitted" | "reviewing" | "resolved";
  risk_score: number;
  incident_type: string;
  severity: string;
  report_markdown: string;
  created_at: string;
  report_available: boolean;
}
