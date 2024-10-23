import { Form, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import Ribbon from "~/components/base/Ribbon";
import ContentWrapper from "~/components/base/ContentWrapper";

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
    <Ribbon>
      <ContentWrapper>
        profile
        <p>{JSON.stringify(user, null, 4)}</p>
        <p>{JSON.stringify(userData, null, 4)}</p>
        <Form method="post" className="mt-8">
          <button className="bg-black text-white px-6 py-2 h-fit rounded-md hover:opacity-60 transition-all duration-200">
            Logout
          </button>
        </Form>
      </ContentWrapper>
    </Ribbon>
  );
}

export async function action({ request }) {
  await authenticator.logout(request, { redirectTo: "/" });
}
