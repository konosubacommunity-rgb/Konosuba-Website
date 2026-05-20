import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 900, color: "var(--cyan)" }}>404</h1>
      <p style={{ color: "var(--text-secondary)" }}>Page not found</p>
      <a href="/" style={{ color: "var(--cyan)", textDecoration: "underline" }}>Go home</a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}
