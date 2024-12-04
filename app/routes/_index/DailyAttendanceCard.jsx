import { addDays, format } from "date-fns";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Attendees from "../calendar/Attendees";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react";

export function DailyAttendanceCard({
  mealDays,
  onSubmit,
  isUserAttending,
  isSubmitting,
}) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let displayDate = today;
  if (isWeekend) {
    // If it's weekend, set the display date to next Monday
    displayDate = addDays(today, (1 + 7 - dayOfWeek) % 7);
  }

  const formattedDate = formatDateWithDateFns(displayDate.toISOString());
  const relevantMealday = mealDays.find(
    (meal) => formatDateWithDateFns(meal.date) === formattedDate,
  );
  const attendance = relevantMealday ? relevantMealday.totalAttendees : 0;
  // const dateString = format(displayDate, "EEE, MMM d");

  const dietCounts = relevantMealday.attendeeDetails.reduce(
    (counts, attendee) => {
      counts[attendee.diet] = (counts[attendee.diet] || 0) + 1;
      return counts;
    },
    {},
  );

  const veganCount = dietCounts.vegan || null;
  const vegetarianCount = dietCounts.vegetarian || null;
  const pescetarianCount = dietCounts.pescetarian || null;
  const dateString = format(displayDate, "EEE, MMM d");

  return (
    <Card
      className={cn(
        "p-6 border-none bg-black text-white relative h-full w-full flex flex-col justify-between transition-all duration-300 ease-in-out",
        isUserAttending && "bg-green-400 text-white",
      )}
    >
      <CardTitle className="flex flex-col gap-2 justify-between z-[2]">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold tracking-tighter">
              Daily attendance
            </h3>
            <p
              className={cn(
                "text-lg opacity-50 font-normal",
                isUserAttending && "opacity-80",
              )}
            >
              {dateString}
            </p>
          </div>
          <div>
            <Attendees mealDay={relevantMealday} className="-me-8" />
          </div>
        </div>

        <div className="flex mt-4 gap-2 flex-wrap">
          {/* <p className="text-lg opacity-80 font-normal">{dateString}</p> */}
          {veganCount && (
            <Badge variant="default" className="w-fit">
              {veganCount} Vegan
            </Badge>
          )}
          {vegetarianCount && (
            <Badge variant="default" className="w-fit">
              {vegetarianCount} Vegetarian
            </Badge>
          )}
          {pescetarianCount && (
            <Badge variant="default" className="w-fit">
              {pescetarianCount} Pescetarian
            </Badge>
          )}
        </div>
      </CardTitle>

      <div className="flex w-full items-center justify-center gap-2">
        <h3 className="text-9xl tracking-tighter font-medium">{attendance}</h3>
      </div>

      <CardContent className="flex flex-col mt-8 p-0 z-[4]">
        <Button
          onClick={onSubmit}
          className={cn(
            "mt-8",
            isUserAttending ? "bg-red-500" : "bg-green-500 hover:bg-green-600",
          )}
          variant={isUserAttending ? "destructive" : "default"}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isUserAttending ? "Don't go" : "Attend"}
        </Button>
      </CardContent>
    </Card>
  );
}
