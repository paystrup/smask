import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { sendDeletionMail } from "~/utils/nodeMailer.server";

// Remove the user from the database and log them out
// TODO: Delete all data associated with the user, mealdays attendance etc.
export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return null;
}

export async function action({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  await mongoose.models.User.findByIdAndDelete(user._id);

  if (user.firstName && user.email) {
    await sendDeletionMail(user.email, user.firstName);
  }

  await authenticator.logout(request, { redirectTo: "/login" });
}
