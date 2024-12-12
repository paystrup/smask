import { json } from "@remix-run/node";
import { Link, Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import mongoose from "mongoose";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { authenticator } from "~/services/auth.server";

export const meta = () => {
  return [
    { title: "SMASK | Settings" },
    {
      property: "og:title",
      content: "SMASK | Settings",
    },
    {
      name: "description",
      content: "Change your settings",
    },
  ];
};

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!user || !user._id) {
    throw new Error("User authentication failed or user ID is missing.");
  }

  const userData = await mongoose.models.User.findById(user._id).populate(
    "location",
  );

  if (!userData) {
    throw new Error(`User with ID ${user._id} not found.`);
  }

  return json({ user, userData, request, params });
}

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split("/").pop() || "account";

  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/account");
    }
  }, [location.pathname, navigate]);

  const tabs = [
    {
      value: "account",
      label: "Account",
      link: "/settings/account",
    },
    {
      value: "image",
      label: "Image",
      link: "/settings/image",
    },
    {
      value: "password",
      label: "Password",
      link: "/settings/password",
    },
  ];

  return (
    <section className="pb-20 mt-6 flex flex-col items-center">
      <div className="flex flex-col items-center max-w-2xl">
        <div className="flex flex-col items-center gap-4 mb-8 text-center w-full">
          <h1 className="text-4xl font-semibold tracking-tighter">
            Profile settings
          </h1>
          <p className="max-w-[40ch] opacity-70">
            Change your contact information, diet preference, password or delete
            your account here.
          </p>
        </div>

        <div className="mb-10 sticky top-0 py-4 md:py-0 md:relative bg-white w-full flex justify-center">
          <Tabs value={currentTab}>
            <TabsList>
              {tabs.map((tab, i) => (
                <TabsTrigger value={tab.value} key={i} asChild>
                  <Link to={tab.link}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Outlet />
      </div>
    </section>
  );
}
