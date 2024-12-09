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
    <Card className="p-6 h-full flex flex-col justify-between border-0 bg-primary-blue text-white relative">
      <CardTitle className="flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold tracking-tighter">
            Menu of the day
          </h3>

          {isWeekend && (
            <p className="text-lg opacity-80 font-normal">(Next workday)</p>
          )}
        </div>
        <p className="text-lg opacity-50 font-normal">{dateString}</p>
      </CardTitle>

      <CardContent className="p-0 space-y-12">
        {relevantMealday?.meals?.length > 0 ? (
          <>
            {relevantMealday?.meals?.map((meal) => (
              <Link
                to={`/meals/${meal?.meal?._id}`}
                key={meal?.meal?._id}
                className="flex flex-col gap-2 hover:opacity-70 transition-opacity duration-200 ease-in-out text-white"
                onMouseEnter={() => setHoveredMeal(meal)}
                onMouseLeave={() => setHoveredMeal(null)}
              >
                <div className="flex justify-between gap-4 items-center">
                  <h3 className="text-lg font-medium tracking-tighter">
                    {meal?.meal?.title}
                  </h3>

                  <Badge
                    className="text-sm text-white outline-white"
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
