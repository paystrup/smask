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
        <h1 className="text-3xl font-semibold">Sign Up</h1>
        <Form
          method="post"
          className="flex flex-col max-w-xl w-full"
          encType="multipart/form-data"
        >
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Your email"
            required
            className="py-2 px-2 mb-4 border rounded-md bg-neutral-100"
          />
          {actionData?.errors?.email && (
            <p className="mt-1 mb-0 text-red-500">
              {actionData.errors.email.message}
            </p>
          )}

          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            placeholder="Your first name"
            required
            className="py-2 px-2 mb-4 border rounded-md bg-neutral-100"
          />
          {actionData?.errors?.firstName && (
            <p className="mt-1 mb-0 text-red-500">
              {actionData.errors.firstName.message}
            </p>
          )}

          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            placeholder="Your last name"
            required
            className="py-2 px-2 mb-4 border rounded-md bg-neutral-100"
          />
          {actionData?.errors?.lastName && (
            <p className="mt-1 mb-0 text-red-500">
              {actionData.errors.lastName.message}
            </p>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            autoComplete="current-password"
            required
            className="py-2 px-2 mb-4 border rounded-md bg-neutral-100"
          />
          {actionData?.errors?.password && (
            <p className="mt-1 mb-0 text-red-500">
              {actionData.errors.password.message}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="py-2 px-2 bg-primaryYellow w-full mt-6 rounded-md hover:opacity-60 duration-200 transition-all"
            >
              Sign up
            </button>
          </div>

          {/* SHOW LOGIN ERR */}
          {loaderData?.error?.message && (
            <div className="text-red-500 text-sm mt-4">
              <p>{loaderData?.error?.message}</p>
            </div>
          )}
        </Form>

        <Link
          to="/login"
          className="mt-4 hover:opacity-60 duration-200 transition-all"
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
    const newUser = new mongoose.models.User({
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
    });
    await newUser.save();
    return redirect("/");
  } catch (error) {
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
