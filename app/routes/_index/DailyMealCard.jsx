import { Link } from "@remix-run/react";
import { addDays, format } from "date-fns";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import { HoverImage } from "./HoverImage";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Badge } from "~/components/ui/badge";

export default function DailyMealCard({ mealDays }) {
  const [hoveredMeal, setHoveredMeal] = useState(null);
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let displayDate = today;
  if (isWeekend) {
    displayDate = addDays(today, (1 + 7 - dayOfWeek) % 7);
  }

  const formattedDate = formatDateWithDateFns(displayDate.toISOString());
  const relevantMealday = mealDays.find(
    (meal) => formatDateWithDateFns(meal.date) === formattedDate,
  );

  const dateString = format(displayDate, "EEE, MMM d");

  return (
    <Card className="p-7 h-full flex flex-col gap-12 justify-between border-0 bg-primary-lime text-primary-dark relative">
      <CardTitle className="flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold tracking-tight">
            Menu of the day
          </h3>

          {isWeekend && (
            <p className="text-base font-medium opacity-50">Next workday</p>
          )}
        </div>
        <p className="text-base font-medium opacity-50">{dateString}</p>
      </CardTitle>

      <CardContent className="p-0 space-y-12">
        {relevantMealday?.meals?.length > 0 ? (
          <>
            {relevantMealday?.meals?.map((meal) => (
              <Link
                to={`/meals/${meal?.meal?._id}`}
                key={meal?.meal?._id}
                className="flex flex-col lg:flex-row gap-4 hover:opacity-70 transition-opacity duration-200 ease-in-out text-primary-dark relative"
                onMouseEnter={() => setHoveredMeal(meal)}
                onMouseLeave={() => setHoveredMeal(null)}
              >
                <div className="relative overflow-hidden rounded-3xl h-24 w-24 min-w-24 min-h-24">
                  {meal?.meal?.image ? (
                    <img
                      src={meal?.meal?.image}
                      alt={meal?.meal?.title}
                      className="object-cover rounded-3xl h-full w-full group-hover:scale-[102%] transition-all duration-200 ease-in-out"
                    />
                  ) : (
                    <div className="object-cover rounded-3xl h-full w-full group-hover:scale-[102%] transition-all duration-200 ease-in-out">
                      <p>🍽️</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-4 items-start">
                  <div className="flex flex-wrap-reverse md:flex-nowrap justify-between gap-4 lg:gap-8 w-full">
                    <h3 className="text-xl font-semibold tracking-tighter">
                      {meal?.meal?.title}
                    </h3>

                    <Badge
                      className="text-sm h-fit outline-primary-dark text-primary-dark border-primary-dark inline-block w-fit whitespace-nowrap"
                      variant="outline"
                    >
                      {format(new Date(meal?.startTime), "HH:mm")}
                      {" - "}
                      {format(new Date(meal?.endTime), "HH:mm")}
                    </Badge>
                  </div>

                  <p className="opacity-70 tracking-tight text-md line-clamp-2">
                    {meal?.meal?.description}
                  </p>
                </div>
              </Link>
            ))}
          </>
        ) : (
          <p className="opacity-80">No meals planned for today</p>
        )}
      </CardContent>
      <AnimatePresence>
        {hoveredMeal && (
          <HoverImage
            src={hoveredMeal.meal.image}
            alt={hoveredMeal.meal.title}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}
