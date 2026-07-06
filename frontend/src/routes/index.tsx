import type { RouteObject } from "react-router-dom";

import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { IncidentDashboardPage } from "@/features/incident-dashboard/IncidentDashboardPage";
import { IncidentIntakePage } from "@/features/incident-intake/IncidentIntakePage";
import { RootLayout } from "@/routes/layouts/root-layout";
import { MapPage } from "@/features/map/MapPage";
import { VisionUploadPage } from "@/features/incident-vision/VisionUploadPage";


/**
 * Application route registry.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <IncidentIntakePage />,
      },
      {
        path: "dashboard",
        element: <IncidentDashboardPage />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      { path: "vision", element: <VisionUploadPage /> },
    ],
  },
];
