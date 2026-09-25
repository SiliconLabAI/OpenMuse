import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { IconRail } from "@/components/IconRail";
import { ActivityPanel } from "@/components/ActivityPanel";
import { HomePage } from "@/routes/HomePage";
import { TaskPage } from "@/routes/TaskPage";
import { SettingsPage } from "@/routes/SettingsPage";
import { ConnectorsPage } from "@/routes/ConnectorsPage";
import { ProjectsPage } from "@/routes/ProjectsPage";
import { ActivityPage } from "@/routes/ActivityPage";
import "@/styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-muse-bg">
      <IconRail />
      <main className="min-w-0 flex-1 border-x border-muse-border bg-muse-surface">
        <Outlet />
      </main>
      <ActivityPanel />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/task/$taskId",
    component: TaskPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: SettingsPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ConnectorsPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects",
    component: ProjectsPage,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/activity",
    component: ActivityPage,
  }),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
