import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!user.admin) {
    return redirect("/");
  }

  const location = await mongoose.models.Location.findById(params.locationId);
  if (!location) {
    throw new Response(`Couldn't find meal with id ${params.mealId}`, {
      status: 404,
    });
  }
  return json(location);
}

export const meta = ({ data }) => {
  return [
    { title: `SMASK | ${data?.name || "Location"}` },
    {
      property: "og:title",
      content: `SMASK | ${data?.name || "Location"}`,
    },
    {
      name: "description",
      content: data
        ? `Explore details about ${data.name}, including its unique code and identifier.`
        : "Discover detailed information about the selected location on SMASK.",
    },
  ];
};

export default function LocationPage() {
  const location = useLoaderData();
  return (
    <div>
      {location?.name} {location?._id} {location?.code}
    </div>
  );
}
