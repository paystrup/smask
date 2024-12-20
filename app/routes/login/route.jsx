import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";
import ErrorMessage from "~/components/_foundation/errorhandling/ErrorMessage";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import LoadingButton from "~/components/_foundation/pending/LoadingButton";
import backgroundImage from "~/assets/img/login-background.jpg";

export const meta = () => {
  return [
    { title: "SMASK | Login" },
    {
      property: "og:title",
      content: "SMASK | Login",
    },
    {
      name: "description",
      content:
        "Log in to your SMASK account to organize lunches and access personalized features. Enter your email and password to get started.",
    },
  ];
};

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  const error = session.get("sessionErrorKey");
  session.unset("sessionErrorKey");
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return json({ error }, { headers });
}

export default function LoginPage() {
  const loaderData = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/login";

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
        <div className="flex flex-col items-center justify-center gap-4 max-w-xl w-full lg:h-full lg:pb-14">
          <SimpleHeader
            title="Login to use Smask"
            description="Login with your email and password below to access all features of Smask"
          />

          <Card className="max-w-lg w-full pt-6">
            <CardContent>
              <Form method="post" className="flex flex-col w-full gap-8 mb-2">
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
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <label htmlFor="password">Password</label>
                      <Link
                        to="/forgotpassword"
                        className="hover:opacity-60 duration-200 transition-all"
                      >
                        <u>Forgot password?</u>
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Your password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {/* SHOW LOGIN ERR */}
                {loaderData?.error?.message && (
                  <div className="text-red-500">
                    <p>{loaderData?.error?.message}</p>
                  </div>
                )}

                <CardFooter className="flex flex-col gap-2 p-0">
                  {isSubmitting ? (
                    <LoadingButton />
                  ) : (
                    <Button
                      disabled={isSubmitting}
                      className="w-full"
                      type="submit"
                    >
                      Sign In
                    </Button>
                  )}

                  <Link
                    to="/signup/location"
                    className="hover:opacity-60 duration-200 transition-all "
                  >
                    Don&apos;t have a user? <u>Sign up here</u>
                  </Link>
                </CardFooter>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  );
}

export async function action({ request }) {
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
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
