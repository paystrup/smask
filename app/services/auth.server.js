// From Remix auth https://remix.run/resources/remix-auth
// Form Strategy - https://github.com/sergiodxa/remix-auth-form
// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey", // keep in sync
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email");
    let password = form.get("password");

    // do some validation, errors are saved in the sessionErrorKey
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new AuthorizationError(
        "Bad Credentials: Email is required and must be a string",
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      throw new AuthorizationError(
        "Bad Credentials: Password is required and must be a string",
      );
    }

    // Verify user
    const user = await verifyUser({ email, password });
    if (!user) {
      // if problem with user throw error AuthorizationError
      throw new AuthorizationError("User not found");
    }
    // console.log(user);
    return user;
  }),
  "user-pass",
);

async function verifyUser({ email, password }) {
  const user = await mongoose.models.User.findOne({ email }).select(
    "+password",
  );
  // console.log(user);
  if (!user) {
    throw new AuthorizationError("No user found with this email.");
  }

  // Check if the password is correct with bcrypt
  // Hash + Salt + Compare
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AuthorizationError("Invalid password.");
  }
  // Remove the password from the user object before returning it
  user.password = undefined;
  return user;
}
