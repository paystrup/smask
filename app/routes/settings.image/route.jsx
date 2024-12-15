import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { authenticator } from "~/services/auth.server";
import { uploadImage } from "~/utils/server/uploadImage.server";

export const meta = () => {
  return [
    { title: "SMASK | Account Settings" },
    {
      property: "og:title",
      content: "SMASK | Account Settings",
    },
    {
      name: "description",
      content: "Change your account settings",
    },
  ];
};

export async function loader({ request }) {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    const userData = await mongoose.models.User.findById(user._id);
    return json({ userData });
  } catch (error) {
    console.error(error.message);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function ManageImage() {
  const { userData } = useLoaderData();
  const actionData = useActionData();
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file.size < 1000000) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Image size must be less than 1MB.");
      event.target.value = "";
    }
  };

  return (
    <section className="w-full">
      <div className="flex flex-col gap-8 items-center w-full">
        {userData.image && (
          <img
            src={image ? image : userData.image}
            alt={userData.firstName + " " + userData.lastName}
            className="h-48 w-48 object-cover rounded-lg"
          />
        )}

        <Card className="pt-6">
          <Form method="post" encType="multipart/form-data">
            <CardContent className="flex flex-col max-w-xl w-full gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="image" className="mb-1">
                  Upload new image
                </label>
                <Input
                  type="file"
                  name="image"
                  id="image"
                  onChange={handleImageChange}
                  required
                />
                {actionData?.errors?.image && (
                  <p className="mt-1 text-red-500">{actionData.errors.image}</p>
                )}
              </div>

              {image && (
                <Button type="submit" className="mt-3">
                  Update image
                </Button>
              )}
            </CardContent>
          </Form>
        </Card>
      </div>
    </section>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const image = form.get("image");
  let imageUrl = null;

  try {
    if (image && image.size > 0) {
      imageUrl = await uploadImage(image);
    }

    const user = await authenticator.isAuthenticated(request);
    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await mongoose.models.User.findById(user._id);
    if (!dbUser) {
      return json({ error: "User not found" }, { status: 404 });
    }

    dbUser.image = imageUrl;
    await dbUser.save();
    return redirect(`/profile`);
  } catch (error) {
    console.log(error);
    // Extract error messages from the Mongoose error object
    const errors = {};
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message; // Get the message for each error field
      });
    }
    return json(
      { errors: errors, values: Object.fromEntries(form) },
      { status: 400 },
    );
  }
}
