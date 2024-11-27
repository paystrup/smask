import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import Profile from "~/components/profile/Profile";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id).populate(
    "location",
  );
  return json({ userData });
}

export default function ProfilePage() {
  const { userData } = useLoaderData();

  return (
    <section className="p-2 pt-14 lg:p-8 lg:pt-20">
      <Profile userData={userData} />
    </section>
  );
}
