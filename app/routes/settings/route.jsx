import { json } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";
import mongoose from "mongoose";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { authenticator } from "~/services/auth.server";

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData, request, params });
}

export default function Settings() {
  const location = useLocation();
  const currentTab = location.pathname.split("/").pop() || "account";

  const tabs = [
    {
      value: "account",
      label: "Account",
      link: "/settings/account",
    },
    {
      value: "password",
      label: "Password",
      link: "/settings/password",
    },
  ];

  return (
    <section className="pb-20 mt-12">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-semibold tracking-tighter mb-8">
          Change your settings
        </h1>

        <Tabs defaultValue={currentTab} className="mb-14">
          <TabsList>
            {tabs.map((tab, i) => (
              <TabsTrigger value={tab.value} key={i}>
                <Link to={tab.link}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Outlet />
      </div>
    </section>
  );
}
