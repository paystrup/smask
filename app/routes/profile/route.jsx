import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import Profile from "~/components/profile/Profile";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData });
}

export default function ProfilePage() {
  const { user, userData } = useLoaderData();

  return (
    <section className="py-20">
      <Profile user={user} userData={userData} />
    </section>
  );
}
