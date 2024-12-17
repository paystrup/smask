import { addDays, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Attendees from "../calendar/Attendees";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Carrot,
  Check,
  Fish,
  LeafyGreen,
  Loader2,
  Minus,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { Form } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { AnimatePresence, motion } from "motion/react";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Diets } from "~/db/constants";

export function DailyAttendanceCard({
  mealDays = [],
  onSubmit = () => {},
  isUserAttending = false,
  isSubmitting = false,
  onGuestSubmit = () => {},
  userGuestsToday = [],
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
  const relevantMealday =
    mealDays && mealDays.length > 0
      ? mealDays.find(
          (meal) =>
            meal &&
            meal.date &&
            formatDateWithDateFns(meal.date) === formattedDate,
        )
      : null;
  const attendance =
    relevantMealday && typeof relevantMealday.totalAttendees === "number"
      ? relevantMealday.totalAttendees
      : 0;
  const dietCounts = [
    ...(relevantMealday?.attendeeDetails || []),
    ...(relevantMealday?.guestDetails || []),
  ].reduce((counts, person) => {
    if (person && person.diet) {
      counts[person.diet] = (counts[person.diet] || 0) + 1;
    }
    return counts;
  }, {});

  const userGuestDietCounts =
    userGuestsToday?.reduce((counts, guest) => {
      if (guest && guest.diet) {
        counts[guest.diet] = (counts[guest.diet] || 0) + 1;
      }
      return counts;
    }, {}) || {};

  const dateString = format(displayDate, "EEE, MMM d");

  const getDietIcon = (diet) => {
    switch (diet) {
      case "vegan":
        return <Carrot strokeWidth={1.7} className="w-4 h-4" />;
      case "vegetarian":
        return <LeafyGreen strokeWidth={1.7} className="w-4 h-4" />;
      case "pescetarian":
        return <Fish strokeWidth={1.7} className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "p-7 border-none bg-primary-dark text-white relative h-full w-full flex flex-col justify-between transition-all duration-300 ease-in-out",
        isUserAttending && "bg-primary-green text-primary-dark",
      )}
    >
      <CardTitle className="flex flex-col gap-2 justify-between z-[2]">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold tracking-tight">
              {isWeekend ? "Next workday" : "Today"}
            </h3>
            <p
              className={cn(
                "text-base font-medium opacity-50",
                isUserAttending && "opacity-80",
              )}
            >
              {dateString}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onSubmit}
              className={cn(
                "tracking-tight font-medium",
                isUserAttending
                  ? "bg-red-500"
                  : "bg-green-500 hover:bg-green-600",
              )}
              variant={isUserAttending ? "destructive" : "default"}
              size="sm"
              disabled={isSubmitting}
              aria-label={isUserAttending ? "Don't attend today" : "Attend"}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isUserAttending ? (
                <X strokeWidth={3} />
              ) : (
                <Check strokeWidth={3} />
              )}
              {isUserAttending ? "Don't attend" : "Attend"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="secondary" size="sm">
                  <UserRound className="w-6 h-6" />
                  {userGuestsToday?.length || 0}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Your guests ({userGuestsToday?.length || 0})
                  </DialogTitle>
                  <DialogDescription className="text-sm opacity-70">
                    Add guests below by their diet preferences
                  </DialogDescription>
                </DialogHeader>

                <Form className="grid grid-cols-6 gap-4 mt-4">
                  {Object.values(Diets).map((diet) => (
                    <Card
                      key={diet}
                      className="overflow-hidden col-span-6 md:col-span-3 border-0 bg-gray-100"
                    >
                      <CardHeader className="bg-black text-white p-4">
                        <CardTitle className="flex items-center justify-between text-md p-0">
                          <span>
                            {diet.charAt(0).toUpperCase() + diet.slice(1)}
                          </span>
                          {diet === "vegan" && (
                            <Carrot className="w-6 h-6 text-primary-foreground opacity-30" />
                          )}
                          {diet === "vegetarian" && (
                            <LeafyGreen className="w-6 h-6 text-primary-foreground opacity-30" />
                          )}
                          {diet === "pescetarian" && (
                            <Fish className="w-6 h-6 text-primary-foreground opacity-30" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() =>
                              onGuestSubmit(diet.toString(), "removeGuest")
                            }
                            aria-label={`Remove ${diet} guest`}
                            disabled={!userGuestDietCounts?.[diet]}
                          >
                            <Minus className="h-2 w-2" />
                          </Button>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={userGuestDietCounts?.[diet] || 0}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="text-xl lg:text-4xl font-bold"
                            >
                              {userGuestDietCounts?.[diet] || 0}
                            </motion.span>
                          </AnimatePresence>
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => {
                              onGuestSubmit(diet.toString(), "attendGuest");
                            }}
                            aria-label={`Add ${diet} guest`}
                          >
                            <Plus className="h-2 w-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Form>

                {/* Form to remove all guests */}
                <Form method="post" className="mt-4">
                  <input type="hidden" name="date" value={formattedDate} />
                  <input type="hidden" name="action" value="removeAllGuests" />

                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={userGuestsToday?.length === 0}
                    className={cn(
                      "w-full",
                      userGuestsToday?.length === 0 &&
                        "opacity-50 cursor-not-allowed",
                    )}
                  >
                    Remove all guests
                  </Button>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardTitle>

      <div className="flex w-full items-center justify-center gap-2 py-12 md:py-0">
        <h3
          className={cn(
            "text-[7rem] tracking-tighter font-medium",
            isUserAttending ? "outlineText" : "outlineTextDark",
          )}
        >
          {attendance}
        </h3>
      </div>

      <CardContent className="flex flex-wrap justify-between gap-2 mt-8 p-0 z-[4]">
        {relevantMealday && <Attendees mealDay={relevantMealday} />}

        <div className="flex gap-1 flex-wrap">
          {Object.entries(dietCounts).map(
            ([diet, count]) =>
              diet !== "none" &&
              count !== undefined && (
                <TooltipProvider key={diet}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        size="sm"
                        variant="default"
                        className="w-fit flex items-center justify-center gap-1"
                        aria-label={`${count} ${diet}`}
                      >
                        {getDietIcon(diet)}
                        {count}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{diet}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
