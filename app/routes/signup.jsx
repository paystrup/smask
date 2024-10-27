import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import mongoose from "mongoose";
import ErrorMessage from "~/_components/errorhandling/ErrorMessage";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "Smask | Sign up" }];
}

export async function loader({ request }) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function SignUpPage() {
  const loaderData = useLoaderData();
  const actionData = useActionData();

  return (
    <section className="flex flex-col items-center px-4 lg:px-8 2xl:px-0">
      <div className="flex flex-col items-center gap-4 max-w-screen-desktop w-full">
        <h1 className="text-4xl font-bold">Create a user for Smask</h1>
        <Form
          method="post"
          className="flex flex-col max-w-xl w-full gap-8"
          encType="multipart/form-data"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Your email"
                required
              />
              {actionData?.errors?.email && (
                <p className="mt-1 mb-0 text-red-500">
                  {actionData.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="firstName">First name</label>
              <Input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="Your first name"
                required
              />
              {actionData?.errors?.firstName && (
                <p className="mt-1 mb-0 text-red-500">
                  {actionData.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="lastName">Last name</label>
              <Input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Your last name"
                required
              />
              {actionData?.errors?.lastName && (
                <p className="mt-1 mb-0 text-red-500">
                  {actionData.errors.lastName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
              {actionData?.errors?.password && (
                <p className="mt-1 mb-0 text-red-500">
                  {actionData.errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit">Sign up</Button>

          {/* SHOW LOGIN ERR */}
          {loaderData?.error?.message && (
            <div className="text-red-500 text-sm mt-4">
              <p>{loaderData?.error?.message}</p>
            </div>
          )}
        </Form>

        <Link
          to="/login"
          className="hover:opacity-60 duration-200 transition-all"
        >
          Do you already have a user? Go to login
        </Link>
      </div>
    </section>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const { password, firstName, lastName, email } = Object.fromEntries(form);

  try {
    let emailExists = await mongoose.models.User.findOne({ email: email });

    // Unique validation throws a error 11000 from Mongoose, we check the email uniqueness here instead
    // By checking if it exists in the db -> and throw error if it does
    if (emailExists) {
      const errorMessage = "Email already exists. Please use another email.";
      return json({ message: errorMessage }, { status: 400 });
    }

    const newUser = new mongoose.models.User({
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
    });

    await newUser.save();
    return redirect("/");
  } catch (error) {
    console.log(error);
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
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
