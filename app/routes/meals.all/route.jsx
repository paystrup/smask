import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { AlignJustify, CreditCard, Search } from "lucide-react";
import mongoose from "mongoose";
import { Input } from "~/components/ui/input";
import { json, redirect } from "@remix-run/node";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Seasons } from "~/db/models";
import MealCard from "~/components/_feature/cards/MealCard";
import { cn } from "~/lib/utils";
import { authenticator } from "~/services/auth.server";
import { Badge } from "~/components/ui/badge";
import Ribbon from "~/components/_foundation/Ribbon";

export const meta = () => {
  return [
    { title: "SMASK | All meals" },
    {
      property: "og:title",
      content: "SMASK | All meals",
    },
    {
      name: "description",
      content: "Browse and search for delicious meals in your SMASK library.",
    },
  ];
};

// Reference: https://www.mongodb.com/docs/manual/reference/operator/query/text/
// TODO: Add limit to query
export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Redirect if user is not an admin
  if (!user?.admin) {
    return redirect("/");
  }

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const sort = url.searchParams.get("sort") || "";
    const season = url.searchParams.get("season") || "";
    const userData = await mongoose.models.User.findById(user._id).populate(
      "location",
    );

    let mealsQuery;
    if (query) {
      mealsQuery = mongoose.models.Meal.find({
        $text: { $search: query },
        location: user.location,
      });
    } else {
      mealsQuery = mongoose.models.Meal.find({ location: user.location });
    }

    if (season) {
      if (season !== "all") {
        mealsQuery = mealsQuery.where("seasons").equals(season);
      }
    }

    // Apply Mongoose sorting
    switch (sort) {
      case "oldest":
        mealsQuery = mealsQuery.sort({ createdAt: 1 });
        break;
      case "a-z":
        mealsQuery = mealsQuery.sort({ title: 1 });
        break;
      case "z-a":
        mealsQuery = mealsQuery.sort({ title: -1 });
        break;
      default: // "newest"
        mealsQuery = mealsQuery.sort({ createdAt: -1 });
    }

    const meals = await mealsQuery.populate("tags");
    return json({ meals, query, sort, season, userData });
  } catch (error) {
    console.error(error);
    return json(
      { error: "An error occurred while loading data" },
      { status: 500 },
    );
  }
}

export default function Meals() {
  const { meals, query, sort, season, userData } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const title = "Search for delicious meals in your Smask library";
  const noResultsText = "No meals found. Please try another search.";
  const queryFallback = query
    ? `(${meals?.length}) Results for "${query}"`
    : `All meals (${meals?.length})`;

  const seasons = Object.values(Seasons);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (!params.has("sort")) {
      params.set("sort", sort);
    }
    if (!params.has("season")) {
      params.set("season", season);
    }
    setSearchParams(params);
  }, [sort, season, searchParams, setSearchParams]);

  const handleParamChange = (paramName, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(paramName, value);
    setSearchParams(newSearchParams);
  };

  return (
    <Ribbon>
      {userData?.location?.name && (
        <Badge className="absolute right-0 top-0 m-4 bg-primary-blue text-white">
          {userData.location.name}
        </Badge>
      )}
      <div className="flex items-center justify-center text-center flex-col gap-12 bg-white mb-10 w-full">
        <h1 className="text-5xl font-medium tracking-tighter max-w-[25ch] mt-12 lg:mt-0">
          {title}
        </h1>
      </div>

      <div className="pt-6 pb-8 sticky top-0 bg-white z-10 flex flex-col w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          <Form className="w-full lg:mb-8" method="get" action="/meals/all">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                id="search"
                placeholder={
                  query
                    ? query
                    : "Search for meals, descriptions, ingredients, etc."
                }
                className="pl-8"
              />
            </div>
            <input type="hidden" name="sort" value={sort} />
            <button type="submit" hidden>
              Search
            </button>
          </Form>

          <div className="flex flex-col md:flex-row gap-2 justify-end mb-8 lg:mb-0">
            <Select
              value={searchParams.get("season") || ""}
              onValueChange={(value) => handleParamChange("season", value)}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All seasons</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get("sort") || ""}
              onValueChange={(value) => handleParamChange("sort", value)}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Date</SelectLabel>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectLabel>Title</SelectLabel>
                  <SelectItem value="a-z">A-Z</SelectItem>
                  <SelectItem value="z-a">Z-A</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-row justify-between gap-4 lg:items-center">
          <h2 className="text-2xl font-semibold tracking-tight w-full">
            {queryFallback}
          </h2>

          <div className="flex w-full justify-end items-end">
            {/* <Form method="get" action="/meals/all">
            <Button type="submit" hidden>
              Clear
            </Button>
          </Form> */}

            <div className="flex gap-4">
              <p className="hidden lg:block">View</p>

              <div className="flex gap-2">
                <button
                  onClick={() => setView("grid")}
                  className={`hover:opacity-50 transition-opacity ease-in-out duration-300 ${view !== "grid" ? "opacity-30" : ""}`}
                  aria-label="Change to grid view"
                >
                  <CreditCard className="h-6 w-6" />
                </button>

                <button
                  onClick={() => setView("list")}
                  className={`hover:opacity-50 transition-opacity ease-in-out duration-300 ${view !== "list" ? "opacity-30" : ""}`}
                  aria-label="Change to list view"
                >
                  <AlignJustify className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 pb-20 w-full">
        {meals.length > 0 ? (
          <ul className="grid grid-cols-12 gap-4 w-full">
            {meals.map((meal) => {
              return (
                <li
                  key={meal._id}
                  className={cn(
                    "animate-fade col-span-12 hover:opacity-80 hover:transition-opacity duration-500 hover:ease-in-out",
                    view === "list" ? "" : "xl:col-span-6 2xl:col-span-3",
                  )}
                >
                  <MealCard
                    link={`/meals/${meal._id}`}
                    title={meal.title}
                    description={meal.description}
                    tags={meal.tags}
                    allergies={meal.allergies}
                    seasons={meal.seasons}
                    imageUrl={meal.image}
                    view={view}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <h3 className="text-center text-3xl tracking-tight mt-20 animate-fade">
            {noResultsText}
          </h3>
        )}
      </div>
    </Ribbon>
  );
}
