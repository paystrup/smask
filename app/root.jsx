import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
// import Nav from "./_components/Nav";
import { authenticator } from "./services/auth.server";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/ui/AppSidebar";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function meta() {
  return [{ title: "smask" }];
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
        {/* <Nav /> */}
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset className="p-4 font-sans text-slate-800">
            <main>
              <SidebarTrigger />
              <Outlet />
              <ScrollRestoration />
              <Scripts />
              <LiveReload />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
