import bcrypt from "bcryptjs";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
} from "@remix-run/react";
import mongoose from "mongoose";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authenticator } from "~/services/auth.server";
import ErrorMessage from "~/components/_foundation/errorhandling/ErrorMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { sendConfirmPasswordReset } from "~/utils/server/nodeMailer.server";

export const meta = () => {
  return [
    { title: "SMASK | Account Settings" },
    {
      property: "og:title",
      content: "SMASK | Account Settings",
    },
    {
      name: "description",
      content: "Change your account settings",
    },
  ];
};

export async function loader({ request }) {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    return json({ user });
  } catch (error) {
    console.error(error.message);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function ManagePassword() {
  const data = useActionData();

  return (
    <section className="flex flex-col items-center">
      <div className="flex flex-col gap-8 items-center w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Change your password</CardTitle>
            <CardDescription>
              Change your password by confirming your current password and
              adding a new one.
            </CardDescription>
          </CardHeader>

          <Form method="post">
            <CardContent className="flex flex-col max-w-xl w-full gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="currentPassword">Current Password</label>
                <Input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="newPassword">New Password</label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                />
              </div>

              <CardFooter className="w-full flex flex-col gap-2 items-center justify-start text-start p-0">
                {data?.error && (
                  <div className="flex flex-col gap-6">
                    <p className="text-red-500">
                      {data.error ||
                        "An unknown error occurred. Please try again."}
                    </p>
                  </div>
                )}
                <Button className="w-full mt-2" type="submit">
                  Change Password
                </Button>
              </CardFooter>
            </CardContent>
          </Form>
        </Card>
      </div>
    </section>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const { currentPassword, newPassword, confirmPassword } =
    Object.fromEntries(form);

  try {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await mongoose.models.User.findById(user._id).select(
      "+password",
    );
    if (!dbUser) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Validate current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      dbUser.password,
    );
    if (!isPasswordCorrect) {
      return json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Validate new password and confirm password match
    if (newPassword !== confirmPassword) {
      return json({ error: "New passwords do not match" }, { status: 400 });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    dbUser.password = hashedPassword;
    await dbUser.save();
    await sendConfirmPasswordReset(dbUser.emaildb, dbUser.firstName);

    return redirect("/settings");
  } catch (error) {
    console.error(error);
    return json({ error: "Something went wrong" }, { status: 500 });
  }
};

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
