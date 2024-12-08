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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import CalendarGrid from "./CalendarGrid";

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
          localField: "attendees.user", // Field to match in the 'attendees' array
          foreignField: "_id", // Foreign field in the 'users' collection
          as: "attendeeDetails", // Alias for the populated attendees
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
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/calendar";
  const { user, mealDays, allMeals } = useLoaderData();
  const submit = useSubmit();
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
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
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

  return (
    <section className="flex flex-col w-full h-[100svh]">
      <div className="w-full flex justify-end items-center min-h-10 mt-4 px-4 ps-20 gap-2">
        {!isCurrentPeriod && (
          <Button className="self-end" onClick={showCurrentPeriod}>
            Go to current {isMonthView ? "month" : "week"}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={toggleView}
          aria-label={isMonthView ? "View week" : "View month"}
        >
          View {isMonthView ? "week" : "month"}
        </Button>
      </div>

      <header className="flex items-center justify-between bg-white py-8 px-8">
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
            "flex-1 h-full grid gap-2 mx-4 overflow-auto",
            isMonthView
              ? "grid-cols-7"
              : hideWeekends
                ? "grid-cols-1 md:grid-cols-5"
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

  // Helper functions
  const handleAttend = (mealDay, userId) => {
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
    mealDay.meals.push({
      meal: mealId,
      startTime: mealStart,
      endTime: mealEnd,
    });
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

    switch (actionType) {
      case "attend":
        handleAttend(mealDay, user._id);
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
