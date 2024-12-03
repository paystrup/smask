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

export function meta() {
  return [{ title: "smask | Login" }];
}

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

  return (
    <section className="grid grid-cols-12 h-full pt-12 px-4 lg:px-0 lg:pt-0">
      <section className="hidden lg:flex lg:flex-col lg:gap-8 col-span-6 bg-primary-blue h-full p-12 items-center justify-center">
        <h2 className="text-white text-lg tracking-tighter max-w-[40ch] text-center opacity-40">
          What is better than gathering over a great meal? <b>Smask.</b> We help
          you doing just that - but with ease.
        </h2>
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
                  {navigation.state === "submitting" ? (
                    <LoadingButton />
                  ) : (
                    <Button
                      disabled={navigation.state === "submitting"}
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
