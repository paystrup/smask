import { format, isToday } from "date-fns";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Attendees from "./Attendees";
import AddGuestsDialog from "./AddGuestsDialog";
import { Ellipsis, Minus, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { easeInOut, motion } from "motion/react";
import ManageMeals from "./ManageMeals";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import MealCard from "~/components/_feature/cards/MealCard";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

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
    ...(mealDay?.attendeeDetails || []),
    ...(mealDay?.guestDetails || []),
  ].reduce((counts, person) => {
    counts[person.diet] = (counts[person.diet] || 0) + 1;
    return counts;
  }, {});

  const veganCount = dietCounts?.vegan || null;
  const vegetarianCount = dietCounts?.vegetarian || null;
  const pescetarianCount = dietCounts?.pescetarian || null;

  const userGuestDietCounts = userGuestsToday?.reduce((counts, guest) => {
    counts[guest.diet] = (counts[guest.diet] || 0) + 1;
    return counts;
  }, {});

  return (
    <motion.div
      className={cn(
        "flex relative flex-col text-center h-full overflow-hidden pb-4 transition-colors duration-500 ease-in-out lg:bg-neutral-50 rounded-xl",
        isMonthView && "col-span-5 lg:col-span-1",
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
                isToday(day) && "bg-neutral-50",
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

        <div className="bg-neutral-100 rounded-xl flex flex-col items-center justify-center min-h-32">
          {!mealDay && (
            <div className="flex flex-col gap-2 w-full p-6">
              <div className="font-semibold text-sm">
                <h3 className="font-medium text-gray-400">No attendees</h3>
              </div>
            </div>
          )}

          {mealDay && (
            <div className="flex flex-col items-center justify-center gap-2 w-full p-4">
              <div className="font-semibold text-sm">
                {mealDay?.totalAttendees > 0 ? (
                  <h3>Attendees ({mealDay.totalAttendees})</h3>
                ) : (
                  <h3 className="font-medium text-gray-400">No attendees</h3>
                )}
              </div>

              {mealDay.totalAttendees > 0 && <Attendees mealDay={mealDay} />}

              {/* Show diet preferences to the admin to not clutter the UI */}
              {user.admin && (
                <div className="flex gap-2 flex-wrap opacity-80 text-black">
                  {(veganCount || vegetarianCount || pescetarianCount) && (
                    <p className="w-fit text-xs">
                      {[
                        veganCount &&
                          `${veganCount} Vegan${veganCount > 1 ? "s" : ""}`,
                        vegetarianCount &&
                          `${vegetarianCount} Vegetarian${vegetarianCount > 1 ? "s" : ""}`,
                        pescetarianCount &&
                          `${pescetarianCount} Pescetarian${pescetarianCount > 1 ? "s" : ""}`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-full max-h-full w-full overflow-y-auto flex flex-col justify-between">
        {mealDay?.meals?.length > 0 ? (
          <ScrollArea
            orientation="horizontal"
            className="flex flex-col my-2 h-full max-h-full w-full overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              {mealDay?.meals
                ?.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .map((meal, i) => (
                  <div className="relative h-full w-full" key={i}>
                    <MealCard
                      title={meal?.meal?.title}
                      imageUrl={meal?.meal?.image}
                      link={`/meals/${meal.meal._id}`}
                      view="grid"
                      startTime={meal?.startTime}
                      endTime={meal?.endTime}
                      hideTags
                      size="sm"
                      dynamic
                    />

                    {user.admin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="z-50 hover:opacity-80 duration-300 ease-in-out absolute m-4 bg-white p-2 top-0 right-0 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300">
                          <Ellipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAddMeal(
                                formattedDate,
                                meal?.meal._id,
                                meal?.meal?.startTime,
                                meal?.meal?.endTime,
                                "removeMeal",
                              )
                            }
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="flex flex-col gap-1 text-left bg-neutral-100 rounded-xl p-6 mt-2">
            <h3 className="font-semibold text-sm text-center text-black opacity-30">
              No meals yet
            </h3>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col gap-2 px-4 h-fit justify-end",
            isMonthView && "px-0",
          )}
        >
          {user.admin && (
            <ManageMeals
              allMeals={allMeals}
              handleAddMeal={handleAddMeal}
              day={formattedDate}
            />
          )}

          {/* Dont show attend button if user is admin */}
          {user && !user.admin && !isMonthView && (
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
              {isUserAttending ? "Don't attend" : "Attend"}
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
      </div>
    </motion.div>
  );
}
