import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { json } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";
import ErrorMessage from "~/components/errorhandling/ErrorMessage";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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

  return (
    <section className="flex flex-col items-center lg:px-8 2xl:px-0 py-10">
      <Card className="max-w-lg w-full p-4">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-4xl tracking-tighter text-center">
            Login to use Smask
          </CardTitle>
          <CardDescription className="text-center max-w-[30ch]">
            Login with your email and password below to access all features of
            Smask
          </CardDescription>
        </CardHeader>

        <CardContent className="text-sm">
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

            <Button type="submit">Sign In</Button>
          </Form>

          <Link
            to="/signup/location"
            className="hover:opacity-60 duration-200 transition-all "
          >
            Don&apos;t have a user? <u>Sign up here</u>
          </Link>
        </CardContent>
      </Card>
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
