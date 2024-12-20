import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { authenticator } from "./services/auth.server";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/_feature/Sidebar/AppSidebar";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return [{ title: "SMASK" }];
}

export async function loader({ request }) {
  return await authenticator.isAuthenticated(request);
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset className="font-sans text-slate-800">
            <SidebarTrigger />
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
