import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GroceryMart Admin — Store Management" },
      {
        name: "description",
        content:
          "Admin panel for GroceryMart: manage products, categories, stock, pricing, offers, orders, sales reports and customers.",
      },
      { name: "author", content: "GroceryMart" },
      { property: "og:title", content: "GroceryMart Admin" },
      { property: "og:description", content: "Manage your grocery store — products, orders, stock, offers and reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [authenticated, setAuthenticated] = useState(() => typeof window !== "undefined" && Boolean(localStorage.getItem("admin_token")));
  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground">GroceryMart Store Admin</span>
              </header>
              <main className="flex-1 p-4 md:p-6">
                {/* Required: nested routes render here. */}
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </StoreProvider>
    </QueryClientProvider>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("9000000000");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState("");
  const login = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    try {
      const response = await fetch("http://localhost:5001/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, password }) });
      const body = await response.json(); if (!response.ok || body.data?.user?.role !== "ADMIN") throw new Error(body.message ?? "Admin credentials are required.");
      localStorage.setItem("admin_token", body.data.accessToken); onLogin();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-muted p-4"><form onSubmit={login} className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-xl"><h1 className="font-display text-2xl font-bold">Vrindavan Mart</h1><p className="mb-6 text-sm text-muted-foreground">Admin dashboard</p><label className="mb-4 block text-sm">Phone<input className="mt-1 w-full rounded-md border p-2" value={phone} onChange={(e) => setPhone(e.target.value)} /></label><label className="mb-5 block text-sm">Password<input type="password" className="mt-1 w-full rounded-md border p-2" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="mb-3 text-sm text-destructive">{error}</p>}<button className="w-full rounded-md bg-primary py-2 font-medium text-primary-foreground">Sign in</button></form></main>;
}
