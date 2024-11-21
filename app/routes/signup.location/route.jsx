import {
  Form,
  Link,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import ErrorMessage from "~/_components/errorhandling/ErrorMessage";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  return null;
}

export default function GetSignUpLocation() {
  const actionData = useActionData();

  return (
    <section className="flex flex-col items-center px-4 lg:px-8 2xl:px-0">
      <div className="flex flex-col items-center gap-4 max-w-screen-desktop w-full">
        <div className="flex flex-col gap-6 my-12 text-center max-w-[45ch]">
          <h1 className="text-5xl font-semibold tracking-tighter">
            Sign up to use Smask
          </h1>
          <p className="text-xl">
            To access your workspace you must enter a location code below
          </p>
        </div>
        <Form method="post" className="flex flex-col max-w-xl w-full gap-8">
          <div className="flex flex-col gap-1">
            <label htmlFor="code">Your location code</label>
            <Input
              id="code"
              type="text"
              name="code"
              placeholder="Location code (e.g. ABC1234)"
              required
            />
            {actionData?.errors?.code && (
              <p className="mt-1 mb-0 text-red-500">
                {actionData.errors.code.message}
              </p>
            )}
          </div>

          <Button type="submit">Continue</Button>
        </Form>

        <Link to="/login" className="hover:opacity-60 transition-all">
          Already have an account? Go to login.
        </Link>
      </div>
    </section>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const { code } = Object.fromEntries(form);

  try {
    let location = await mongoose.models.Location.findOne({
      code: code,
    });

    console.log(location);

    if (!location) {
      const errorMessage =
        "Location does not exist. Please select a valid location code.";
      return json(
        { errors: { code: { message: errorMessage } } },
        { status: 400 },
      );
    }

    return redirect(`/signup/${location._id}`);
  } catch (error) {
    console.error(error);
    return json(
      {
        errors: { code: { message: "Invalid location code format" } },
        values: Object.fromEntries(form),
      },
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
