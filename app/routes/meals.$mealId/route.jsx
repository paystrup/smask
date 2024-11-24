import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose from "mongoose";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import { Badge } from "~/components/ui/badge";
import BackButton from "~/components/navigation/BackButton";

export async function loader({ params }) {
  const meal = await mongoose.models.Meal.findById(params.mealId).populate(
    "tags",
  );
  if (!meal) {
    throw new Response(`Couldn't find meal with id ${params.mealId}`, {
      status: 404,
    });
  }
  return json(meal);
}

export default function BookPage() {
  const meal = useLoaderData();
  const tagsToDisplay = 10;

  return (
    <section className="mt-12">
      <BackButton />
      <ContentWrapper>
        <div className="gap-8 grid grid-cols-12">
          {meal?.image ? (
            <img
              src={meal?.image}
              alt={meal?.title}
              className="w-full h-[50vh] object-cover rounded-2xl col-span-6"
            />
          ) : (
            <div className="flex items-center justify-center text-3xl bg-slate-50 w-full h-[50vh] object-cover rounded-2xl col-span-6">
              <p>🍔</p>
            </div>
          )}

          <div className="col-span-6 flex flex-col gap-8">
            <div>
              <p className="mb-6 text-sm">
                Created {new Date(meal.createdAt).toLocaleDateString()}
              </p>
              <h1 className="mb-4 text-7xl font-medium tracking-tight first-letter:capitalize line-clamp-5">
                {meal.title}
              </h1>
              <p className="text-2xl opacity-70">{meal.description}</p>
            </div>

            <div className="flex flex-col gap-2">
              <h3>Seasons</h3>
              <ul className="flex flex-wrap gap-2">
                {meal.seasons.length > 0 && (
                  <>
                    {meal.seasons.slice(0, tagsToDisplay).map((season, i) => (
                      <li key={season + i} className="list-none">
                        <Badge>{season}</Badge>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3>Allergies</h3>
              <ul className="flex flex-wrap gap-2">
                {meal.allergies.length > 0 && (
                  <>
                    {meal.allergies
                      .slice(0, tagsToDisplay)
                      .map((allergy, i) => (
                        <li key={allergy + i} className="list-none">
                          <Badge>{allergy}</Badge>
                        </li>
                      ))}
                  </>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3>Tags</h3>
              <ul className="flex flex-wrap gap-2">
                {meal.tags.length > 0 && (
                  <>
                    {meal.tags.slice(0, tagsToDisplay).map((tag, i) => (
                      <li key={tag + i} className="list-none">
                        <Badge>{tag.name}</Badge>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </section>
  );
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
