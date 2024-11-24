import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import ErrorMessage from "~/components/errorhandling/ErrorMessage";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import mongoose from "mongoose";
import { generateResetToken } from "~/utils/server/handleTokens.server";
import { sendResetLink } from "~/utils/server/nodeMailer.server";

export function meta() {
  return [{ title: "smask | Forgot Password" }];
}

export default function ForgotPassword() {
  const actionData = useActionData();
  console.log(actionData);

  if (actionData?.success) {
    return (
      <section className="flex flex-col items-center px-4 lg:px-8 2xl:px-0">
        <div className="flex flex-col gap-6 my-12 text-center max-w-[45ch]">
          <h1 className="text-5xl font-semibold tracking-tighter">
            Your password reset link has been sent
          </h1>
          <p className="text-xl">
            Please check your email - you might have to check your spam folder.
          </p>
          <Button className="mt-12">
            <Link
              to="/login"
              className="hover:opacity-60 duration-200 transition-all"
            >
              Go back to login
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center px-4 lg:px-8 2xl:px-0">
      <div className="flex flex-col items-center gap-4 max-w-screen-desktop w-full">
        <div className="flex flex-col gap-6 my-12 text-center max-w-[45ch]">
          <h1 className="text-5xl font-semibold tracking-tighter">
            Forgot your password?
          </h1>
          <p className="text-xl">
            It can happen for everyone. Let&apos;s help you getting back on
            track by resetting your password.
          </p>
        </div>
        <Form method="post" className="flex flex-col max-w-xl w-full gap-8">
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Your email"
              required
            />
          </div>

          {/* SHOW LOGIN ERR */}
          {actionData?.fieldErrors?.email && (
            <div className="text-red-500">
              <p>{actionData?.fieldErrors?.email}</p>
            </div>
          )}

          <Button type="submit">Reset password</Button>
        </Form>

        <Link
          to="/login"
          className="hover:opacity-60 duration-200 transition-all"
        >
          Go back to login
        </Link>
      </div>
    </section>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const { email } = Object.fromEntries(form);

  try {
    const user = await mongoose.models.User.findOne({ email });

    if (!user) {
      return json(
        {
          fieldErrors: {
            email: "No user exists with this email address",
          },
        },
        { status: 400 },
      );
    }

    const resetToken = generateResetToken(user._id);
    const updatedFields = { resetPasswordToken: resetToken };

    const updatedUser = await mongoose.models.User.findByIdAndUpdate(
      user._id,
      updatedFields,
    );

    if (!updatedUser) {
      return json(
        {
          fieldErrors: {
            email: "Could not reset password for this user. Please try again.",
          },
        },
        { status: 400 },
      );
    }

    const resetLink = `${process.env.BASE_URL}/resetpassword?token=${resetToken}`;

    await updatedUser.save();
    await sendResetLink(user.email, user.firstName, resetLink);
    return json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return json(
      {
        errors: { email: { message: "Invalid email format" } },
        values: Object.fromEntries(form),
      },
      { status: 400 },
    );
  }
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
