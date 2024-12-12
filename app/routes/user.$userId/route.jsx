import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import Profile from "~/components/profile/Profile";
import ErrorMessage from "~/components/_foundation/errorhandling/ErrorMessage";

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userId = params.userId;
  const currentUser = await mongoose.models.User.findById(user._id);
  const userData =
    await mongoose.models.User.findById(userId).populate("location");
  if (!userData) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  // Redirect user to their own profile, if they visit their user route
  if (currentUser._id.toString() === userData._id.toString()) {
    return redirect("/profile");
  }

  return json({ userData });
}

export const meta = ({ data }) => {
  const userName = data?.userData?.firstName && data?.userData?.lastName
    ? `${data.userData.firstName} ${data.userData.lastName}`
    : "User";
  return [
    { title: `SMASK | ${userName} Profile` },
    {
      property: "og:title",
      content: `SMASK | ${userName} Profile`,
    },
    {
      name: "description",
      content: "The profile page of a user displaying their avatar, name, latest attendance, favorite dish and much more...",
    },
  ];
};


export default function DynamicProfilePage() {
  const { userData } = useLoaderData();

  return (
    <section className="py-8">
      <Profile userData={userData} />
    </section>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorMessage
        title={error.status + " " + error.statusText}
        message={error.data}
      />
    );
  } else if (error instanceof Error) {
    return <ErrorMessage title={error.message} message={error.stack} />;
  } else {
    return <ErrorMessage title="Unknown Error" />;
  }
}
