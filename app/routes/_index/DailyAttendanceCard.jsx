/* eslint-disable react/prop-types */
import { addDays } from "date-fns";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Attendees from "../calendar/Attendees";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export function DailyAttendanceCard({ mealDays, onSubmit, isUserAttending }) {
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

  const veganCount =
    relevantMealday.attendeeDetails.filter(
      (attendee) => attendee.diet === "vegan",
    ).length > 0
      ? relevantMealday.attendeeDetails.filter(
          (attendee) => attendee.diet === "vegan",
        ).length
      : null;

  const vegetarianCount =
    relevantMealday.attendeeDetails.filter(
      (attendee) => attendee.diet === "vegetarian",
    ).length > 0
      ? relevantMealday.attendeeDetails.filter(
          (attendee) => attendee.diet === "vegetarian",
        ).length
      : null;

  console.log(veganCount);

  return (
    <Card
      className={cn(
        "p-6 border-none bg-black text-white relative h-full w-full flex flex-col justify-between transition-all duration-300 ease-in-out",
        isUserAttending && "bg-green-400 text-white",
      )}
    >
      <CardTitle className="flex flex-col gap-2 justify-between z-[2]">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
            <h3 className="text-2xl font-semibold tracking-tighter">
              Daily attendance
            </h3>
          </div>
          <Attendees mealDay={relevantMealday} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* <p className="text-lg opacity-80 font-normal">{dateString}</p> */}
          {veganCount && (
            <Badge variant="default" className="w-fit">
              {veganCount} Vegan
            </Badge>
          )}
          {vegetarianCount && (
            <Badge variant="default" className="w-fit">
              {veganCount} Vegetarian
            </Badge>
          )}
        </div>
      </CardTitle>

      <CardContent className="flex justify-between items-end mt-8 p-0 z-[4]">
        <div className="flex gap-2 items-end justify-between">
          <h3 className="text-8xl tracking-tighter font-medium">
            {attendance}
          </h3>
        </div>

        <Button
          onClick={onSubmit}
          className={cn(
            isUserAttending ? "bg-red-500" : "bg-green-500 hover:bg-green-600",
          )}
          variant={isUserAttending ? "destructive" : "default"}
        >
          {isUserAttending ? "Don't go" : "Attend"}
        </Button>
      </CardContent>
    </Card>
  );
}
