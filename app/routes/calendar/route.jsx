import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { useState } from "react";
import {
  addWeeks,
  addMonths,
  eachDayOfInterval,
  endOfWeek,
  endOfMonth,
  format,
  getDay,
  getWeek,
  isSameDay,
  isToday,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import { Button } from "~/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Loader2,
  Rows3,
  Table,
  Wrench,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import CalendarGrid from "./CalendarGrid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  try {
    const userData = await mongoose.models.User.findById(user._id);

    const mealDays = await mongoose.models.Mealday.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "attendees.user",
          foreignField: "_id",
          as: "attendeeDetails",
        },
      },
      {
        $addFields: {
          totalAttendees: {
            $sum: [
              { $size: { $ifNull: ["$attendees", []] } },
              { $size: { $ifNull: ["$guests", []] } },
            ],
          },
        },
      },
      {
        $addFields: {
          guests: {
            $map: {
              input: "$guests",
              as: "guestId",
              in: { $toObjectId: "$$guestId" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "guests",
          localField: "guests",
          foreignField: "_id",
          as: "guestDetails",
        },
      },
      {
        $lookup: {
          from: "meals",
          localField: "meals.meal",
          foreignField: "_id",
          as: "populatedMeals",
        },
      },
      {
        $addFields: {
          meals: {
            $map: {
              input: "$meals",
              as: "mealItem",
              in: {
                $mergeObjects: [
                  "$$mealItem",
                  {
                    meal: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$populatedMeals",
                            cond: { $eq: ["$$this._id", "$$mealItem.meal"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          populatedMeals: 0,
        },
      },
    ]);

    // Fetch user's meal days
    const userMeals = await mongoose.models.Mealday.find({
      attendees: { $elemMatch: { user: user._id } },
    });

    const allMeals = await mongoose.models.Meal.find().populate("tags");
    return json({ user, userData, mealDays, userMeals, allMeals });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to fetch meal days" }, { status: 400 });
  }
};

export default function CreateMealDays() {
  const { user, mealDays, allMeals } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.formAction === "/calendar";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthView, setIsMonthView] = useState(false);
  const isCurrentPeriod = isSameDay(currentDate, new Date());
  const hideWeekends = true;

  const mealDaysMap = mealDays.reduce((acc, mealDay) => {
    const formattedDate = format(new Date(mealDay.date), "yyyy-MM-dd");
    acc[formattedDate] = mealDay;
    return acc;
  }, {});

  const navigatePeriod = (direction) => {
    setCurrentDate((prevDate) =>
      isMonthView
        ? addMonths(prevDate, direction === "next" ? 1 : -1)
        : addWeeks(prevDate, direction === "next" ? 1 : -1),
    );
  };

  const showCurrentPeriod = () => {
    setCurrentDate(new Date());
  };

  const toggleView = () => {
    setIsMonthView((prev) => !prev);
    setCurrentDate(new Date()); // Reset to current period when toggling
  };

  const getDaysToRender = () => {
    if (isMonthView) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      let days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Filter out weekends (Saturday and Sunday)
      if (hideWeekends) {
        days = days.filter((day) => getDay(day) !== 0 && getDay(day) !== 6);
      }

      return days;
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd }).filter(
        (day) => !(hideWeekends && (getDay(day) === 0 || getDay(day) === 6)),
      );
    }
  };

  const days = getDaysToRender();

  const handleUserAttend = (day) => {
    const formData = new FormData();
    formData.append("date", day);
    formData.append("action", "attend");
    submit(formData, { method: "post" });
  };

  const handleGuestAttend = (day, diet, action) => {
    const formData = new FormData();
    formData.append("date", day);
    formData.append("diet", diet);
    formData.append("action", action); // action 'attendGuest' or 'removeGuest'
    submit(formData, { method: "post" });
  };

  const handleMeal = (day, meal, startTime, endTime, action) => {
    const formData = new FormData();
    formData.append("date", day);
    formData.append("meal", meal);
    formData.append("mealStart", startTime);
    formData.append("mealEnd", endTime);
    formData.append("action", action); // action 'removeMeal' or 'addMeal'
    submit(formData, { method: "post" });
  };

  const handleAttendPeriod = (action) => {
    const daysToAttend = getDaysToRender().map(
      // Make sure all dates are format as 'yyyy-MM-dd'
      (day) => format(day, "yyyy-MM-dd"),
    );
    const formData = new FormData();
    // Send array of dates as a JSON string
    formData.append("action", action);
    formData.append("dates", JSON.stringify(daysToAttend));
    formData.append("action", "attendAll");
    submit(formData, { method: "post" });
  };

  return (
    <section
      className={cn(
        "flex flex-col w-full h-full",
        !isMonthView && "lg:h-[100svh]",
      )}
    >
      <div className="w-full flex justify-end items-center min-h-10 mt-4 px-4 ps-20 gap-2">
        {!isCurrentPeriod && (
          <Button className="self-end" onClick={showCurrentPeriod}>
            Go to current {isMonthView ? "month" : "week"}
          </Button>
        )}

        <Button
          as="div"
          variant="outline"
          onClick={toggleView}
          aria-label={isMonthView ? "View week" : "View month"}
        >
          {isMonthView ? <Columns3 /> : <Rows3 />}
          View {isMonthView ? "week" : "month"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Wrench className="h-4 w-4" />
              Attend {isMonthView ? "month" : "week"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAttendPeriod("attendPeriod")}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Attend {isMonthView ? "month" : "week"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAttendPeriod("removePeriodAttendance")}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove {isMonthView ? "month" : "week"} attendance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <header className="flex items-center justify-between bg-white pb-8 pt-4 px-8">
        <Button
          onClick={() => navigatePeriod("prev")}
          aria-label={`Previous ${isMonthView ? "month" : "week"}`}
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex flex-col items-center justify-center ps-8">
          <h2 className="text-2xl lg:text-4xl font-semibold tracking-tight">
            {isMonthView
              ? format(currentDate, "MMMM yyyy")
              : `Week ${getWeek(currentDate)} ${isCurrentPeriod ? "(Current)" : ""}`}
          </h2>
          <h3 className="text-md lg:text-lg opacity-60">
            {isMonthView
              ? `${format(startOfMonth(currentDate), "MMMM d")} - ${format(endOfMonth(currentDate), "MMMM d, yyyy")}`
              : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMMM d, yyyy")}`}
          </h3>
        </div>

        <Button
          onClick={() => navigatePeriod("next")}
          aria-label={`Next ${isMonthView ? "month" : "week"}`}
          variant="outline"
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={isMonthView ? "month" : "week"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex-1 h-full grid gap-12 lg:gap-2 mx-4 overflow-auto",
            isMonthView
              ? hideWeekends
                ? "grid-cols-5 gap-y-10 lg:gap-y-12"
                : "grid-cols-7 gap-y-10 lg:gap-y-12"
              : hideWeekends
                ? "grid-cols-1 lg:grid-cols-5"
                : "grid-cols-1 md:grid-cols-7",
          )}
        >
          {days.map((day, i) => {
            return (
              <CalendarGrid
                day={day}
                i={i}
                user={user}
                handleGuestAttend={handleGuestAttend}
                mealDaysMap={mealDaysMap}
                isMonthView={isMonthView}
                handleUserAttend={handleUserAttend}
                handleAddMeal={handleMeal}
                isToday={isToday}
                key={i}
                isSubmitting={isSubmitting}
                allMeals={allMeals}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export const action = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const form = await request.formData();
  const date = new Date(form.get("date"));
  const actionType = form.get("action");
  const guestDiet = form.get("diet");
  const mealId = form.get("meal");
  const mealStart = form.get("mealStart");
  const mealEnd = form.get("mealEnd");
  const dates = JSON.parse(form.get("dates") || "[]");

  // Helper functions
  const handleAttend = async (mealDay, userId) => {
    const userIndex = mealDay.attendees.findIndex(
      (attendee) => attendee.user.toString() === userId,
    );

    if (userIndex > -1) {
      mealDay.attendees.splice(userIndex, 1); // Remove attendee
    } else {
      mealDay.attendees.push({ user: userId }); // Add attendee
    }
  };

  const handleAttendGuest = async (mealDay, diet, userId) => {
    const guest = await mongoose.models.Guest.create({
      diet,
      addedBy: userId,
    });
    mealDay.guests.push(guest._id);
  };

  const handleRemoveGuest = (mealDay, diet, userId) => {
    const guestIndex = mealDay.guests.findIndex(
      (guest) => guest.addedBy.toString() === userId && guest.diet === diet,
    );

    if (guestIndex > -1) {
      mealDay.guests.splice(guestIndex, 1); // Remove guest
      return true;
    }
    return false;
  };

  const handleRemoveAllGuests = async (mealDay, userId) => {
    const guestsToRemove = mealDay.guests.filter(
      (guest) => guest.addedBy.toString() === userId,
    );

    await mongoose.models.Guest.deleteMany({
      _id: { $in: guestsToRemove.map((guest) => guest._id) },
    });

    mealDay.guests = mealDay.guests.filter(
      (guest) => guest.addedBy.toString() !== userId,
    );
  };

  const handleAddMeal = async (mealDay, mealId, mealStart, mealEnd) => {
    if (!user.admin) {
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    mealDay.meals.push({
      meal: mealId,
      startTime: mealStart,
      endTime: mealEnd,
    });
  };

  const handleDeleteMeal = async (mealDay, mealId) => {
    if (!user.admin) {
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    mealDay.meals = mealDay.meals.filter(
      (meal) => meal.meal.toString() !== mealId,
    );
  };

  const attendPeriod = async (dates) => {
    try {
      for (const date of dates) {
        let mealDay = await mongoose.models.Mealday.findOne({ date });

        if (!mealDay) {
          console.log(`Creating mealDay for date: ${date}`);
          mealDay = await mongoose.models.Mealday.create({
            date,
            meals: [],
            attendees: [],
            guests: [],
          });
        }

        const userIndex = mealDay.attendees.findIndex(
          (attendee) => attendee.user.toString() === user._id.toString(),
        );

        if (userIndex === -1) {
          console.log(`Adding user ${user._id} to attendees for date: ${date}`);
          mealDay.attendees.push({ user: user._id });
          await mealDay.save();
        } else {
          console.log(`User ${user._id} is already attending date: ${date}`);
        }
      }

      return json({ success: true });
    } catch (error) {
      console.error("Error attending all week:", error);
      return json({ error: "Failed to attend all week" }, { status: 400 });
    }
  };

  const removePeriodAttendance = async (dates) => {
    try {
      for (const date of dates) {
        let mealDay = await mongoose.models.Mealday.findOne({ date });

        if (!mealDay) {
          console.log(`No mealDay found for date: ${date}, skipping.`);
          continue;
        }

        const userIndex = mealDay.attendees.findIndex(
          (attendee) => attendee.user.toString() === user._id.toString(),
        );

        if (userIndex !== -1) {
          console.log(
            `Removing user ${user._id} from attendees for date: ${date}`,
          );
          mealDay.attendees.splice(userIndex, 1);
          await mealDay.save();
        } else {
          console.log(
            `User ${user._id} is not attending on date: ${date}, skipping.`,
          );
        }
      }

      return json({ success: true });
    } catch (error) {
      console.error("Error removing attendance for all week:", error);
      return json(
        { error: "Failed to remove attendance for all week" },
        { status: 400 },
      );
    }
  };

  try {
    let mealDay = await mongoose.models.Mealday.findOne({ date }).populate(
      "guests",
    );

    if (!mealDay) {
      mealDay = await mongoose.models.Mealday.create({
        date,
        meals: [],
        attendees: [],
        guests: [],
      });
    }

    if (!mealDay) {
      return json({ error: "Meal day not found" }, { status: 404 });
    }

    // Execute actions
    switch (actionType) {
      case "attend":
        await handleAttend(mealDay, user._id);
        break;

      case "attendGuest":
        await handleAttendGuest(mealDay, guestDiet, user._id);
        break;

      case "removeGuest":
        // eslint-disable-next-line no-case-declarations
        const guestRemoved = handleRemoveGuest(mealDay, guestDiet, user._id);
        if (!guestRemoved) {
          return json({ error: "Guest not found to remove" }, { status: 404 });
        }
        break;

      case "removeAllGuests":
        await handleRemoveAllGuests(mealDay, user._id);
        break;

      case "addMeal":
        await handleAddMeal(mealDay, mealId, mealStart, mealEnd);
        break;

      case "removeMeal":
        await handleDeleteMeal(mealDay, mealId);
        break;

      case "attendPeriod":
        await attendPeriod(dates);
        break;

      case "removePeriodAttendance":
        await removePeriodAttendance(dates);
        break;

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }

    await mealDay.save();
    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to update meal day" }, { status: 400 });
  }
};
