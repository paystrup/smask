import { format, isToday } from "date-fns";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Attendees from "./Attendees";
import AddGuestsDialog from "./AddGuestsDialog";
import { Minus, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { easeInOut, motion } from "motion/react";
import ManageMeals from "./ManageMeals";

export default function CalendarGrid({
  day,
  i,
  user,
  mealDaysMap,
  isMonthView,
  handleUserAttend,
  handleGuestAttend,
  isSubmitting,
  allMeals,
  handleAddMeal,
}) {
  const dayKey = format(day, "yyyy-MM-dd");
  const mealDay = mealDaysMap[dayKey];
  const userAttendance = mealDay?.attendees.find(
    (attendee) => attendee.user.toString() === user._id,
  );

  const userGuestsToday = mealDay?.guestDetails?.filter(
    (guest) => guest.addedBy.toString() === user._id,
  );

  const formattedDate = formatDateWithDateFns(day);
  const isUserAttending = !!userAttendance;

  const dietCounts = [
    ...(day?.attendeeDetails || []),
    ...(day?.guestDetails || []),
  ].reduce((counts, person) => {
    counts[person.diet] = (counts[person.diet] || 0) + 1;
    return counts;
  }, {});

  const userGuestDietCounts = userGuestsToday?.reduce((counts, guest) => {
    counts[guest.diet] = (counts[guest.diet] || 0) + 1;
    return counts;
  }, {});

  console.log(mealDay);

  return (
    <motion.div
      className={cn(
        "group flex relative flex-col justify-between text-center h-full overflow-hidden pb-4 transition-colors duration-500 ease-in-out bg-neutral-50 rounded-xl",
        isToday(day) && "bg-blue-50",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: i * 0.05,
        ease: easeInOut,
      }}
      key={dayKey}
    >
      <div>
        <div
          className={cn(
            "p-4 rounded-xl relative bg-neutral-200",
            isUserAttending && "bg-green-500",
          )}
        >
          <div className="w-2 rounded-xl py-4 absolute left-0 top-0 ms-4 h-full">
            <div
              className={cn(
                "rounded-xl h-full w-full transition-colors duration-200 ease-in-out",
                isUserAttending ? "bg-green-400 text-white" : "bg-neutral-300",
              )}
            ></div>
          </div>
          <h2
            className={cn(
              "font-semibold text-xl transition-colors duration-200 ease-in-out",
              isUserAttending ? " text-white" : "text-black",
            )}
          >
            {format(day, "EEE")}
          </h2>
          <p
            className={cn(
              "text-sm transition-colors duration-200 ease-in-out",
              isUserAttending ? " text-white" : "text-black",
            )}
          >
            {format(day, "MMM d")}
          </p>
        </div>
      </div>

      <div className="bg-neutral-100 rounded-xl flex flex-col items-center justify-center min-h-32">
        {!mealDay && (
          <div className="flex flex-col gap-2 w-full p-6">
            <div className="font-semibold text-sm">
              <h3 className="font-medium text-gray-400">No attendees</h3>
            </div>
          </div>
        )}

        {mealDay && (
          <div className="flex flex-col items-center justify-center gap-2 w-full p-6">
            <div className="font-semibold text-sm">
              {mealDay?.totalAttendees > 0 ? (
                <h3>Attendees ({mealDay.totalAttendees})</h3>
              ) : (
                <h3 className="font-medium text-gray-400">No attendees</h3>
              )}
            </div>

            {mealDay.totalAttendees > 0 && <Attendees mealDay={mealDay} />}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-12 h-full">
        <ManageMeals
          allMeals={allMeals}
          handleAddMeal={handleAddMeal}
          day={formattedDate}
        />
      </div>

      <div className="flex flex-col gap-2 px-4">
        {user && !isMonthView && (
          <Button
            size="lg"
            onClick={() => handleUserAttend(formattedDate)}
            className={cn(
              "w-full",
              isUserAttending
                ? "bg-red-500"
                : "bg-green-500 hover:bg-green-600",
            )}
            variant={isUserAttending ? "destructive" : "default"}
            disabled={isSubmitting}
            aria-label={isUserAttending ? "Don't attend today" : "Attend"}
          >
            {isUserAttending ? (
              <Minus className="h-8 w-8" />
            ) : (
              <Plus className="h-8 w-8" />
            )}
            {/* {isUserAttending ? "Don't attend today" : "Attend"} */}
          </Button>
        )}

        {user && (
          <AddGuestsDialog
            formattedDate={formattedDate}
            userGuestsToday={userGuestsToday}
            userGuestDietCounts={userGuestDietCounts}
            handleGuestAttend={handleGuestAttend}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </motion.div>
  );
}
