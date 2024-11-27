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
    <section className="py-8">
      <Profile userData={userData} />
    </section>
  );
}
