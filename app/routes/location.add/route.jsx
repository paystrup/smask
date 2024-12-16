import { Form, useActionData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import mongoose from "mongoose";
import { Input } from "~/components/ui/input";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import Ribbon from "~/components/_foundation/Ribbon";
import { authenticator } from "~/services/auth.server";

export const meta = () => {
  return [
    { title: "SMASK | Add New Location" },
    {
      property: "og:title",
      content: "SMASK | Add New Location",
    },
    {
      name: "description",
      content:
        "Add a new location to the SMASK platform, complete with a unique name and code.",
    },
  ];
};

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!user.admin) {
    return redirect("/");
  }

  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData });
}

export default function AddLocation() {
  const actionData = useActionData();

  return (
    <Ribbon className="flex flex-col gap-8 max-w-full">
      <ContentWrapper>
        <h1 className="mb-4 text-2xl font-bold">Add new location</h1>
        <Form
          method="post"
          encType="multipart/form-data"
          className="flex flex-col gap-4"
        >
          {/* Title Input */}
          <label htmlFor="name" className="mb-1 block font-semibold">
            Name
          </label>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="Name of the location"
            defaultValue={""}
            className={`border ${
              actionData?.errors?.name ? "border-red-500" : ""
            }`}
          />
          {actionData?.errors?.name && (
            <p className="mt-1 text-red-500">{actionData.errors.name}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="mt-3 rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
          >
            Confirm
          </button>
        </Form>
      </ContentWrapper>
    </Ribbon>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const { name } = Object.fromEntries(form);

  if (!name || name.trim().length === 0) {
    return json(
      {
        errors: { name: "Name is required." },
        values: Object.fromEntries(form),
      },
      { status: 400 },
    );
  }

  // Helper function to generate a unique location code
  const generateLocationCode = async (name) => {
    let code;
    let isUnique = false;

    while (!isUnique) {
      const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
      code = `${name.slice(0, 3).toUpperCase()}${randomNumber}`;

      const existingLocation = await mongoose.models.Location.findOne({ code });
      if (!existingLocation) {
        isUnique = true; // Code is unique
      }
    }

    return code;
  };

  try {
    // Generate a unique code
    const code = await generateLocationCode(name);

    // Create a new location
    const newLocation = new mongoose.models.Location({
      name: name,
      code: code,
    });
    await newLocation.save();

    return redirect(`/location/${newLocation._id}`);
  } catch (error) {
    console.error(error);

    const errors = {};

    // Handle duplicate key errors (MongoDB error code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]; // get the name field
      errors[field] = "A location with this name already exists.";
    }

    // Handle Mongoose validation errors
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
    }

    return json(
      { errors: errors, values: Object.fromEntries(form) },
      { status: 400 },
    );
  }
}
