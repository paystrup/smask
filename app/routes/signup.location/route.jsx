import {
  Form,
  Link,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
  useNavigation,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import ErrorMessage from "~/components/_foundation/errorhandling/ErrorMessage";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import LoadingButton from "~/components/_foundation/pending/LoadingButton";
import backgroundImage from "~/assets/img/signup-background.jpg";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  return null;
}

export default function GetSignUpLocation() {
  const actionData = useActionData();
  const navigation = useNavigation();

  return (
    <section className="grid grid-cols-12 h-full pt-12 px-4 lg:px-0 lg:pt-0">
      <section className="hidden lg:flex lg:flex-col lg:gap-8 col-span-6 h-full p-12 items-center justify-center relative bg-black">
        <img
          src={backgroundImage}
          alt="Smask food background"
          className="absolute inset-0 object-cover w-full h-full z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-transparent opacity-90 z-0" />
        <div className="relative z-10 text-center">
          <h2 className="text-white text-2xl tracking-tighter max-w-[40ch] opacity-40">
            Smask. The easy way to organize your lunch. Smask. Smask. Smask.
          </h2>
        </div>
      </section>

      <section className="flex flex-col items-center lg:px-8 2xl:px-0 col-span-12 lg:col-span-6 lg:h-full">
        <div className="flex flex-col items-center justify-center gap-4 max-w-xl w-full lg:h-full pb-28">
          <SimpleHeader
            title="Sign up to use Smask"
            description="To access your workspace you must enter a location code below"
          />

          <Card className="w-full">
            <Form method="post" className="flex flex-col max-w-xl w-full">
              <CardContent className="pt-6">
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
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                {navigation.state === "submitting" ? (
                  <LoadingButton />
                ) : (
                  <Button className="w-full" type="submit">
                    Continue
                  </Button>
                )}

                <Link to="/login" className="hover:opacity-60 transition-all">
                  Already have an account? <u>Go to login.</u>
                </Link>
              </CardFooter>
            </Form>
          </Card>
        </div>
      </section>
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
