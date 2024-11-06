import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import { Badge } from "~/components/ui/badge";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData });
}

export default function Profile() {
  const { user, userData } = useLoaderData();

  return (
    <section className="py-20">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col gap-2 items-center justify-center w-full mb-12">
          <div className="h-20 w-20 bg-black rounded-full mb-2"></div>
          <h1 className="text-4xl font-semibold tracking-tight text-center">
            {userData.firstName} {userData.lastName}
          </h1>

          <a
            href={`mailto:${userData.email}`}
            className="hover:opacity-50 transition-opacity duration-300 ease-in-out"
          >
            {userData.email}
          </a>

          <div className="flex gap-2 my-6">
            <Badge className="text-sm">
              Created {new Date(userData.createdAt).toLocaleDateString()}
            </Badge>

            <Badge className="text-sm">🎉 Birthday in X days</Badge>
          </div>

          <h3 className="text-xl tracking-tight">
            Favourite dish is <b>boller i karry</b>
          </h3>
        </div>

        <div className="justify-start items-start">
          <h2>Latest attendance</h2>
        </div>
        <p>{JSON.stringify(user, null, 4)}</p>
        <p>{JSON.stringify(userData, null, 4)}</p>
      </div>
    </section>
  );
}
