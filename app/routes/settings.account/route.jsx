import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import mongoose from "mongoose";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Diets } from "~/db/models";
import { authenticator } from "~/services/auth.server";

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
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await mongoose.models.User.findById(user._id).populate(
    "location",
  );

  return json({ userData });
}

export default function ManageAccount() {
  const { userData } = useLoaderData();
  const actionData = useActionData();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    diet: userData.diet,
  });

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, diet: value }));
  };

  return (
    <section>
      <div className="flex flex-col gap-8 items-center max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your details</CardTitle>
          </CardHeader>
          <Form method="post" className="flex flex-col w-full gap-4">
            <CardContent>
              <input type="hidden" name="diet" value={formData.diet} />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={userData.email}
                    placeholder="Your email address"
                    required
                  />
                  {actionData?.errors.email && (
                    <p className="mt-1 mb-0 text-red-500">
                      {actionData.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 w-full">
                  <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="firstName">First Name</label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={userData.firstName}
                      placeholder="Your first name"
                      required
                    />
                    {actionData?.errors.firstName && (
                      <p className="mt-1 mb-0 text-red-500">
                        {actionData.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="lastName">Last Name</label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={userData.lastName}
                      placeholder="Your last name"
                      required
                    />
                    {actionData?.errors?.lastName && (
                      <p className="mt-1 mb-0 text-red-500">
                        {actionData.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="birthday">Birthday</label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    defaultValue={
                      new Date(userData.birthday).toISOString().split("T")[0]
                    }
                    required
                    className="flex justify-between w-full"
                  />
                  {actionData?.errors?.birthday && (
                    <p className="mt-1 mb-0 text-red-500">
                      {actionData.errors.birthday.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full mt-8">
                  <label htmlFor="favoriteMeal">Favorite Meal</label>
                  <Input
                    id="favoriteMeal"
                    name="favoriteMeal"
                    defaultValue={userData.favoriteMeal || ""}
                    placeholder="Your favorite meal"
                  />
                  {actionData?.errors?.favouriteMeal && (
                    <p className="mt-1 mb-0 text-red-500">
                      {actionData.errors.favoriteMeal.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="diet">Your Diet Preferences</label>
                  <Select
                    id="diet"
                    name="diet"
                    defaultValue={userData.diet}
                    value={formData.diet}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(Diets).map((diet) => (
                          <SelectItem key={diet} value={diet}>
                            {diet.charAt(0).toUpperCase() + diet.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {actionData?.errors?.diet && (
                    <p className="mt-1 mb-0 text-red-500">
                      {actionData.errors.diet.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="w-full flex flex-col gap-2 items-center justify-start text-start">
              {actionData?.errors && <p className="">{actionData?.errors}</p>}
              <Button type="submit" className="w-full">
                Save
              </Button>
            </CardFooter>
          </Form>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              The location your account is associated with. This cannot be
              changed. If you need to change your location, please contact
              support, or delete your account and create a new one with your new
              access code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p>Current location</p>
            <Badge variant="primary" className="mt-2">
              {userData.location.name}
            </Badge>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Delete your account</CardTitle>
            <CardDescription>
              We would be super sad to let you go. This action cannot be undone,
              and all your data will be deleted from our servers. What will you
              eat for lunch then?
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent aria-label="Permanently delete your account">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Form action="destroy" method="post" className="w-full">
                    <Button variant="destructive">Delete</Button>
                  </Form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/`,
  });

  const { email, firstName, lastName, birthday, favoriteMeal, diet } =
    Object.fromEntries(form);

  try {
    let updateObject = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
      favoriteMeal: favoriteMeal,
      diet: diet,
    };

    const updates = await mongoose.models.User.findByIdAndUpdate(
      user._id,
      updateObject,
    );
    await updates.save();
    return redirect("/settings");
  } catch (error) {
    return json(
      { errors: error.message, values: Object.fromEntries(form) },
      { status: 400 },
    );
  }
}
