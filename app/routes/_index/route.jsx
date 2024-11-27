import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }) {
  // Redirect to login if user is not authenticated
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);

  return json(user, userData);
}

export default function Index() {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">Home</h2>
    </div>
  );
}
