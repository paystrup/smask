import { useLoaderData, useSubmit } from "@remix-run/react";
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
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import Avatar from "~/components/_feature/avatar/Avatar";
import { cn } from "~/lib/utils";
import { Switch } from "~/components/ui/switch";

const maxAttendeeCount = 10;

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  // Fetch all MealDays and calculate the total number of attendees
  const mealDays = await mongoose.models.Mealday.aggregate([
    {
      $lookup: {
        from: "users", // Adjust collection name to match your User model
        localField: "attendees.user",
        foreignField: "_id",
        as: "attendeeDetails",
      },
    },
    {
      $addFields: {
        totalAttendees: {
          $sum: "$attendees.numberOfPeople",
        },
      },
    },
  ]);

  // Fetch user's meal days
  const userMeals = await mongoose.models.Mealday.find({
    attendees: { $elemMatch: { user: user._id } },
  });
  return json({ user, userData, mealDays, userMeals });
};

export default function CreateMealDays() {
  const { user, mealDays } = useLoaderData();
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

  const handleAttendeeCountChange = (day, userId, currentCount, change) => {
    const newCount = Math.min(
      Math.max(0, currentCount + change),
      maxAttendeeCount,
    );
    const formData = new FormData();
    formData.append("date", day.toISOString());
    formData.append("userId", userId);
    formData.append("attendeeCount", newCount.toString());
    formData.append("action", newCount === 0 ? "remove" : "attend");
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

      <div
        className={cn(
          "flex-1 h-full grid overflow-auto",
          isMonthView
            ? "grid-cols-7"
            : hideWeekends
              ? "grid-cols-1 md:grid-cols-5"
              : "grid-cols-1 md:grid-cols-7",
        )}
      >
        {days.map((day, i) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const mealDay = mealDaysMap[dayKey];
          const sliceCount = 5;
          const userAttendance = mealDay?.attendees.find(
            (attendee) => attendee.user.toString() === user._id,
          );
          const isUserAttending = !!userAttendance;
          const attendeeCount = userAttendance
            ? userAttendance.numberOfPeople
            : 0;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "group flex relative flex-col justify-between text-center h-full overflow-hidden pb-8 transition-colors duration-500 ease-in-out",
                i % 2 === 0
                  ? "bg-gradient-to-b from-gray-100 to-white"
                  : "bg-white",
                isUserAttending && "bg-gradient-to-b from-green-100 to-white",
              )}
            >
              <div>
                <div
                  className={cn(
                    "p-4 border-b",
                    isToday(day) ? "bg-blue-50" : "bg-gray-100",
                    isUserAttending && "bg-green-100",
                  )}
                >
                  <h2
                    className={`font-semibold text-xl ${
                      isToday(day) ? "text-primary-blue" : "text-gray-800"
                    }`}
                  >
                    {format(day, "EEE")}
                  </h2>
                  <p
                    className={`text-sm ${
                      isToday(day) ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {format(day, "MMMM d")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mt-8 h-full">
                <div className="space-y-2">
                  {mealDay?.meals?.length > 0 ? (
                    <p>There is meals</p>
                  ) : (
                    <p className="text-gray-500 text-center text-sm">
                      No meals yet
                    </p>
                  )}
                </div>
              </div>

              <div>
                {!mealDay && (
                  <div className="flex flex-col gap-2 self-end w-full border-b">
                    <div className="p-4 text-sm font-medium text-gray-400">
                      <h3>No attendees</h3>
                    </div>
                  </div>
                )}

                {mealDay && (
                  <div className="flex flex-col gap-2 self-end w-full items-center justify-between text-center p-6">
                    <div className="font-semibold text-sm">
                      {mealDay?.totalAttendees > 0 ? (
                        <h3>Attendees ({mealDay.totalAttendees})</h3>
                      ) : (
                        <h3 className="font-medium text-gray-400">
                          No attendees
                        </h3>
                      )}
                    </div>

                    {mealDay.totalAttendees > 0 && (
                      <ul className="flex flex-wrap items-center justify-center gap-2 p-2 -ms-4 w-full">
                        {mealDay.attendeeDetails
                          .sort((a, b) => {
                            const firstNameA =
                              a?.firstName?.toLowerCase() || "";
                            const firstNameB =
                              b?.firstName?.toLowerCase() || "";
                            return firstNameA.localeCompare(firstNameB);
                          })
                          .slice(0, sliceCount)
                          .map((attendee) => (
                            <li
                              key={attendee?.user?._id || Math.random()}
                              className="-me-4"
                            >
                              {attendee?.image ? (
                                <img
                                  src={attendee?.image}
                                  alt={`${attendee?.firstName || "Guest"} ${
                                    attendee?.lastName || ""
                                  }`}
                                  className="h-8 w-8 border rounded-full object-cover"
                                />
                              ) : (
                                <Avatar
                                  className="border"
                                  name={attendee?.firstName || "?"}
                                />
                              )}
                            </li>
                          ))}

                        {Array.from(
                          {
                            length: Math.min(
                              sliceCount - mealDay.attendeeDetails.length,
                              mealDay.totalAttendees -
                                mealDay.attendeeDetails.length,
                            ),
                          },
                          (_, index) => (
                            <li key={`placeholder-${index}`} className="-me-4">
                              <Avatar name="?" />
                            </li>
                          ),
                        )}

                        {mealDay.totalAttendees > sliceCount && (
                          <li className="flex items-center justify-center h-8 w-8 bg-primary-blue text-white text-xs font-bold rounded-full">
                            +{mealDay.totalAttendees - sliceCount}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {user && !isMonthView && (
                <div className="p-4 w-full self-end">
                  {isUserAttending ? (
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        type="button"
                        className="rounded-full"
                        onClick={() =>
                          handleAttendeeCountChange(
                            day,
                            user._id,
                            attendeeCount,
                            -1,
                          )
                        }
                        variant="outline"
                        size="icon"
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                      <span className="text-md font-semibold">
                        {attendeeCount}
                      </span>
                      <Button
                        type="button"
                        className="rounded-full"
                        onClick={() =>
                          handleAttendeeCountChange(
                            day,
                            user._id,
                            attendeeCount,
                            1,
                          )
                        }
                        variant="outline"
                        size="icon"
                      >
                        <Plus className="h-2 w-2" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() =>
                        handleAttendeeCountChange(day, user._id, 0, 1)
                      }
                      className="w-full"
                    >
                      Attend
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const userId = form.get("userId");
  const date = new Date(form.get("date"));
  const actionType = form.get("action");
  const attendeeCount = Math.min(
    parseInt(form.get("attendeeCount")),
    maxAttendeeCount,
  );

  try {
    let mealDay = await mongoose.models.Mealday.findOne({ date });

    if (!mealDay && actionType === "attend") {
      mealDay = await mongoose.models.Mealday.create({
        date,
        meals: [],
        attendees: [],
      });
    }

    if (mealDay) {
      const existingAttendeeIndex = mealDay.attendees.findIndex(
        (a) => a.user.toString() === userId,
      );

      if (actionType === "remove" || attendeeCount === 0) {
        if (existingAttendeeIndex !== -1) {
          mealDay.attendees.splice(existingAttendeeIndex, 1);
        }
      } else if (actionType === "attend") {
        if (existingAttendeeIndex !== -1) {
          mealDay.attendees[existingAttendeeIndex].numberOfPeople = Math.min(
            attendeeCount,
            maxAttendeeCount,
          );
        } else {
          mealDay.attendees.push({
            user: userId,
            numberOfPeople: Math.min(attendeeCount, maxAttendeeCount),
          });
        }
      }

      await mealDay.save();
    }

    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to update meal day" }, { status: 400 });
  }
};
