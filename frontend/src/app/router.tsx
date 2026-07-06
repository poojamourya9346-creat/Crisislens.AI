import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { routes } from "@/routes";

const router = createBrowserRouter(routes);

/** Application router — route modules will be registered in src/routes/. */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
