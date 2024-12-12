import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import mongoose from "mongoose";
import ErrorMessage from "~/components/_foundation/errorhandling/ErrorMessage";
import LoadingButton from "~/components/_foundation/pending/LoadingButton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { validateResetToken } from "~/utils/server/handleTokens.server";
import { sendConfirmPasswordReset } from "~/utils/server/nodeMailer.server";

export const meta = () => {
  return [
    { title: "SMASK | Reset Password" },
    {
      property: "og:title",
      content: "SMASK | Reset Password",
    },
    {
      name: "description",
      content: "Did you forget your password? You can reset it here.",
    },
  ];
};

export async function loader({ request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const decoded = validateResetToken(token);

    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await mongoose.models.User.findById(decoded.userId).select(
      "+resetPasswordToken",
    );
    if (!user) {
      return json({ error: "User not found" }, { status: 400 });
    }

    if (user.resetPasswordToken !== token) {
      return json({ error: "Token does not match user" }, { status: 400 });
    }

    return json({ userId: decoded.userId, token, user });
  } catch (error) {
    console.error(error.message);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function ResetPassword() {
  const data = useLoaderData();
  const navigation = useNavigation();

  return (
    <section className="flex flex-col items-center">
      <div className="max-w-xl">
        <div className="flex flex-col gap-6 my-12 text-center max-w-[45ch]">
          <h1 className="text-5xl font-semibold tracking-tighter">
            Reset your password
          </h1>
          <p className="text-xl">
            Confirm your email and enter a new password below.
          </p>
        </div>

        {/* Display error if present */}
        {data.error ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <p className="text-red-500 text-center">
              {data.error || "An unknown error occurred. Please try again."}
            </p>
            <Button>
              <Link to="/forgotpassword">Request a new password reset</Link>
            </Button>
          </div>
        ) : (
          <Form method="post" className="flex flex-col max-w-xl w-full gap-4">
            {/* Token should still be included in case of a valid response */}
            <input type="hidden" name="token" value={data.token} />
            <input type="hidden" name="userId" value={data.userId} />
            <div>
              <label htmlFor="password">New Password:</label>
              <Input id="password" type="password" name="password" required />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                required
              />
            </div>
            {navigation.state === "submitting" ? (
              <LoadingButton />
            ) : (
              <Button className="w-full mt-2" type="submit">
                Reset Password
              </Button>
            )}
          </Form>
        )}
      </div>
    </section>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const { password, userId, token } = Object.fromEntries(form);

  try {
    // Validate token
    const isValidToken = validateResetToken(token);
    if (!isValidToken) {
      return json({ error: "Invalid token" }, { status: 400 });
    }

    // Fetch user with resetPasswordToken
    const user = await mongoose.models.User.findById(userId).select(
      "+resetPasswordToken",
    );
    if (!user) {
      return json({ error: "User not found" }, { status: 400 });
    }

    if (user.resetPasswordToken !== token) {
      return json({ error: "Token does not match user" }, { status: 400 });
    }

    // Update password and clear the resetPasswordToken
    user.password = password;
    user.resetPasswordToken = undefined;

    // Save the user (triggers pre('validate') hook for password hashing)
    await user.save();
    await sendConfirmPasswordReset(user.email, user.firstName);
    return redirect("/login");
  } catch (error) {
    console.log(error);
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
      { status: 400 },
    );
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
