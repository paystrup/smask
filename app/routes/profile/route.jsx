import { Link, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import Profile from "~/components/profile/Profile";
import { Button } from "~/components/ui/button";

export const meta = () => {
  return [
    { title: "SMASK | Profile" },
    {
      property: "og:title",
      content: "SMASK | Profile",
    },
    {
      name: "description",
      content:
        "Your Smask profile page displaying your avatar, name, latest attendance, favorite dish and much more...",
    },
  ];
};

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await mongoose.models.User.findById(user._id).populate(
    "location",
  );

  // Fetch user's meal days
  const userMeals = await mongoose.models.Mealday.find({
    attendees: { $elemMatch: { user: user._id } },
  });

  return json({ userData, userMeals });
}

export default function ProfilePage() {
  const { userData, userMeals } = useLoaderData();
  console.log(userMeals);

  return (
    <section className="p-2 pt-14 lg:p-8 lg:pt-20">
      <Link
        to="/settings"
        className="absolute top-4 right-4 lg:top-8 lg:right-8"
      >
        <Button>Settings</Button>
      </Link>
      <Profile userData={userData} userMeals={userMeals} />
    </section>
  );
}
