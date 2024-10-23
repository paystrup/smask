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
import ErrorMessage from "~/_components/errorhandling/ErrorMessage";

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
    <section className="flex flex-col items-center px-4 lg:px-8 2xl:px-0">
      <div className="flex flex-col items-center gap-4 max-w-screen-desktop w-full">
        <h1 className="text-3xl font-semibold">Login</h1>
        <Form method="post" className="flex flex-col max-w-xl w-full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Your email..."
            required
            className="py-2 px-2 mb-4 border rounded-md bg-neutral-100"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Your password..."
            autoComplete="current-password"
            required
            className="py-2 px-2 mb-4 border rounded-md bg-neutral-100"
          />
          <div>
            <button className="py-2 px-2 bg-primaryYellow w-full mt-2 rounded-md hover:opacity-60 duration-200 transition-all">
              Sign In
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
          to="/signup"
          className="mt-4 hover:opacity-60 duration-200 transition-all"
        >
          Don&apos;t have a user? Create one here 🎉
        </Link>
      </div>
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
