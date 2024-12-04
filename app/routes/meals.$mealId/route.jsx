import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  Form,
  Outlet,
  Link,
  useActionData,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import mongoose from "mongoose";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import { Badge } from "~/components/ui/badge";
import Ribbon from "~/components/_foundation/Ribbon";
import { MealCarousel } from "~/components/_feature/Carousel/MealCarousel";
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
import { Button } from "~/components/ui/button";
import { authenticator } from "~/services/auth.server";
import { MoveLeft, Pen, Trash } from "lucide-react";
import { uploadImage } from "~/utils/server/uploadImage.server";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import EditMeal from "./EditMeal";

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/`,
  });

  const meal = await mongoose.models.Meal.findById(params.mealId)
    .populate("tags")
    .exec();

  if (!meal) {
    throw new Response(`Couldn't find meal with id ${params.mealId}`, {
      status: 404,
    });
  }

  const relatedMealsQuery = {
    $or: [
      { tags: { $in: meal.tags.map((tag) => tag._id) } },
      { seasons: { $in: meal.seasons } },
      { allergies: { $in: meal.allergies } },
    ],
    _id: { $ne: meal._id }, // Exclude the current meal
  };

  let relatedMeals = await mongoose.models.Meal.find(relatedMealsQuery)
    .limit(6)
    .exec();

  // Fallback to random meals if not enough related meals are found
  if (relatedMeals.length < 6) {
    const remainingCount = 6 - relatedMeals.length;
    const randomMeals = await mongoose.models.Meal.aggregate([
      { $match: { _id: { $ne: meal._id } } },
      { $sample: { size: remainingCount } },
    ]);
    relatedMeals = relatedMeals.concat(randomMeals);
  }

  // Use a Set to remove duplicates by `_id`
  const uniqueMeals = Array.from(
    new Map(relatedMeals.map((meal) => [meal._id.toString(), meal])),
  ).map(([, meal]) => meal);

  return json({ meal, relatedMeals: uniqueMeals, user });
}

export const meta = ({ data }) => {
  return [{ title: `SMASK | ${data?.meal?.title || "Meal"}` }];
};

export default function MealDetailPage() {
  const actionData = useActionData();
  const { meal, relatedMeals, user } = useLoaderData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const tagsToDisplay = 10;

  return (
    <Ribbon>
      <div className="flex justify-between items-center mb-12">
        <Link className="flex gap-2 mb-8" to="/meals/all">
          <MoveLeft size={24} />
          <p>Go back</p>
        </Link>

        {user.admin && (
          <div className="flex gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger>
                <Button className="min-w-28 flex items-center justify-center gap-2">
                  <Pen className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <EditMeal
                meal={meal}
                actionData={actionData}
                onSubmit={() => setEditOpen(false)}
              />
            </Dialog>

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger>
                <Button
                  variant="destructive"
                  className="min-w-28 flex items-center justify-center gap-2"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent aria-label="Permanently delete your account">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the meal from our database.
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
          </div>
        )}
      </div>

      <ContentWrapper>
        <div className="gap-8 grid grid-cols-12">
          {meal?.image ? (
            <img
              src={meal?.image}
              alt={meal?.title}
              className="w-full h-[50vh] object-cover rounded-2xl col-span-12 lg:col-span-6"
            />
          ) : (
            <div className="flex items-center justify-center text-3xl bg-slate-50 w-full h-[50vh] object-cover rounded-2xl col-span-12 lg:col-span-6">
              <p>🍔</p>
            </div>
          )}

          <div className="col-span-12 lg:col-span-6 flex flex-col gap-8">
            <div>
              {meal?.title && (
                <h1 className="mb-6 text-7xl font-medium tracking-tight first-letter:capitalize line-clamp-5 break-words">
                  {meal?.title}
                </h1>
              )}

              <Badge className="bg-gray-200 text-black mb-12 text-sm tracking-tight">
                Created {new Date(meal.createdAt).toLocaleDateString()}
              </Badge>

              {meal?.description && (
                <p className="text-xl tracking-tight opacity-70">
                  {meal?.description}
                </p>
              )}
            </div>

            {meal.seasons.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium tracking-tight text-lg">Seasons</h3>
                <ul className="flex flex-wrap gap-2">
                  {meal.seasons.length > 0 && (
                    <>
                      {meal.seasons.slice(0, tagsToDisplay).map((season, i) => (
                        <li key={i} className="list-none">
                          <Badge className="bg-black text-white">
                            {season}
                          </Badge>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </div>
            )}

            {meal.allergies.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium tracking-tight text-lg">
                  Allergies
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {meal.allergies.length > 0 && (
                    <>
                      {meal.allergies
                        .slice(0, tagsToDisplay)
                        .map((allergy, i) => (
                          <li key={i} className="list-none">
                            <Badge className="bg-primary-blue text-white">
                              {allergy}
                            </Badge>
                          </li>
                        ))}
                    </>
                  )}
                </ul>
              </div>
            )}

            {meal.tags.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium tracking-tight text-lg">Tags</h3>
                <ul className="flex flex-wrap gap-2">
                  {meal.tags.length > 0 && (
                    <>
                      {meal.tags.slice(0, tagsToDisplay).map((tag, i) => (
                        <li key={i} className="list-none">
                          <Badge variant="outline">{tag.name}</Badge>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Meals */}
        {relatedMeals && (
          <div>
            <MealCarousel cards={relatedMeals} />
          </div>
        )}

        <Outlet />
      </ContentWrapper>
    </Ribbon>
  );
}

export async function action({ request, params }) {
  const form = await request.formData();
  const { title, description, tags, actionType } = Object.fromEntries(form);

  const allergies = form.getAll("allergies");
  const seasons = form.getAll("seasons");

  const tagArray = tags
    ? tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const tagIds = await Promise.all(
    tagArray.map(async (tagName) => {
      let tag = await mongoose.models.Tag.findOne({ name: tagName });
      if (!tag) {
        tag = new mongoose.models.Tag({ name: tagName });
        await tag.save();
      }
      return tag._id;
    }),
  );

  const image = form.get("image");
  let imageUrl = null;
  if (image && image.size > 0) {
    imageUrl = await uploadImage(image);
  }

  try {
    let updatedMeal;
    let existingMeal;

    if (actionType === "saveAsNew") {
      // Fetch the existing meal to get its image if no new image is uploaded
      existingMeal = await mongoose.models.Meal.findById(params.mealId);
    }

    const mealData = {
      title: title,
      description: description,
      allergies: allergies,
      seasons: seasons,
      tags: tagIds,
      image: imageUrl || (existingMeal ? existingMeal.image : null),
    };

    if (actionType === "saveAsNew") {
      // Create a new meal
      updatedMeal = new mongoose.models.Meal(mealData);
      await updatedMeal.save();
    } else {
      // Update existing meal
      updatedMeal = await mongoose.models.Meal.findByIdAndUpdate(
        params.mealId,
        mealData,
        { new: true, runValidators: true },
      );

      if (!updatedMeal) {
        throw new Error("Meal not found");
      }
    }

    return redirect(`/meals/${updatedMeal._id}`);
  } catch (error) {
    console.error(error);
    const errors = {};
    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
    } else if (error.message === "Meal not found") {
      errors.general = "Meal not found";
    } else {
      errors.general = "An unexpected error occurred";
    }
    return json(
      { errors: errors, values: Object.fromEntries(form) },
      { status: 400 },
    );
  }
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{`${error.status} ${error.statusText}`}</h1>
        <h2>{error.data}</h2>
      </div>
    );
  }

  return (
    <h1 className="font-bold text-red-500">
      {error?.name}: {error?.message}
    </h1>
  );
}
