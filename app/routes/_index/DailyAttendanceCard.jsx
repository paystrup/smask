import { addDays, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Attendees from "../calendar/Attendees";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Carrot,
  Fish,
  LeafyGreen,
  Loader2,
  Minus,
  Plus,
  User,
} from "lucide-react";
import { Diets } from "~/db/models";
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

export function DailyAttendanceCard({
  mealDays,
  onSubmit,
  isUserAttending,
  isSubmitting,
  onGuestSubmit,
  userGuestsToday,
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
  const dietCounts = [
    ...(relevantMealday?.attendeeDetails || []),
    ...(relevantMealday?.guestDetails || []),
  ].reduce((counts, person) => {
    counts[person.diet] = (counts[person.diet] || 0) + 1;
    return counts;
  }, {});

  const userGuestDietCounts = userGuestsToday?.reduce((counts, guest) => {
    counts[guest.diet] = (counts[guest.diet] || 0) + 1;
    return counts;
  }, {});

  const veganCount = dietCounts?.vegan || null;
  const vegetarianCount = dietCounts?.vegetarian || null;
  const pescetarianCount = dietCounts?.pescetarian || null;
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
          {veganCount && (
            <Badge variant="default" className="w-fit">
              {veganCount} Vegan{veganCount > 1 && "s"}
            </Badge>
          )}
          {vegetarianCount && (
            <Badge variant="default" className="w-fit">
              {vegetarianCount} Vegetarian{vegetarianCount > 1 && "s"}
            </Badge>
          )}
          {pescetarianCount && (
            <Badge variant="default" className="w-fit">
              {pescetarianCount} Pescetarian{pescetarianCount > 1 && "s"}
            </Badge>
          )}
        </div>
      </CardTitle>

      <div className="flex w-full items-center justify-center gap-2">
        <h3 className="text-9xl tracking-tighter font-medium">{attendance}</h3>
      </div>

      <CardContent className="flex flex-col gap-2 mt-8 p-0 z-[4]">
        <Button
          onClick={onSubmit}
          size="lg"
          className={cn(
            isUserAttending ? "bg-red-500" : "bg-green-500 hover:bg-green-600",
          )}
          variant={isUserAttending ? "destructive" : "default"}
          disabled={isSubmitting}
          aria-label={isUserAttending ? "Don't attend today" : "Attend"}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isUserAttending ? <Minus /> : <Plus />}
        </Button>

        <Dialog>
          <DialogTrigger>
            <Button size="lg" className="w-full" variant="secondary">
              <User className="w-6 h-6" />
              Your guests ({userGuestsToday?.length || 0})
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
      </CardContent>
    </Card>
  );
}
