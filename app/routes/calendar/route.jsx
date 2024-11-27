import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { useState } from "react";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  getWeek,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import Avatar from "~/components/_feature/avatar/Avatar";
import { cn } from "~/lib/utils";

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
  const { user, mealDays, userMeals } = useLoaderData();
  const actionData = useActionData();
  console.log(mealDays);

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const isCurrentWeek = isSameDay(currentWeek, new Date());
  const hideWeekends = true;

  const weekNumber = getWeek(currentWeek);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Use date-fns to filter out weekends
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).filter(
    (day) => !(hideWeekends && (getDay(day) === 0 || getDay(day) === 6)),
  );

  const mealDaysMap = mealDays.reduce((acc, mealDay) => {
    const formattedDate = format(new Date(mealDay.date), "yyyy-MM-dd");
    acc[formattedDate] = mealDay;
    return acc;
  }, {});

  const navigateWeek = (direction) => {
    setCurrentWeek((prevWeek) =>
      addWeeks(prevWeek, direction === "next" ? 1 : -1),
    );
  };

  const showCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  return (
    <section className="flex flex-col w-full h-[100svh]">
      <div className="w-full flex justify-end min-h-10 mt-4 px-4">
        {!isCurrentWeek && (
          <Button className="self-end" onClick={showCurrentWeek}>
            Go to current week
          </Button>
        )}
      </div>

      <header className="flex items-center justify-between bg-white py-8 px-8">
        <Button
          onClick={() => navigateWeek("prev")}
          aria-label="Previous week"
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex flex-col items-center justify-center ps-8">
          <h2 className="text-2xl lg:text-4xl font-semibold tracking-tight">
            Week {weekNumber} {isCurrentWeek && "(Current)"}
          </h2>
          <h3 className="text-md lg:text-lg opacity-60">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
          </h3>
        </div>

        <Button
          onClick={() => navigateWeek("next")}
          aria-label="Next week"
          variant="outline"
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </header>

      <div
        className={`flex-1 h-full grid grid-cols-1 ${
          hideWeekends ? "md:grid-cols-5" : "md:grid-cols-7"
        } overflow-auto`}
      >
        {days.map((day, i) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const mealDay = mealDaysMap[dayKey];
          const sliceCount = 5;
          const isUserAttending = mealDay?.attendees.some(
            (attendee) => attendee.user.toString() === user._id,
          );

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "group flex relative flex-col justify-between shadow text-center h-full overflow-hidden pb-8 transition-colors duration-500 ease-in-out",
                i % 2 === 0 ? "bg-gray-50" : "bg-white",
              )}
            >
              {/* <div className="hidden opacity-0 group-hover:block group-hover:opacity-100 absolute top-[50%] left-0 z-10 h-full w-full bg-black text-white bg-opacity-20 transition-all duration-500 ease-in-out">
                <p>Click to attend</p>
              </div> */}
              <div>
                <div
                  className={cn(
                    "p-4  border-b",
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

                <div>
                  {mealDay && (
                    <div className="flex flex-col gap-2 self-end w-full items-center justify-between text-center p-6">
                      {/* Attendee Title */}
                      <div className="font-semibold text-sm">
                        {mealDay?.totalAttendees > 0 ? (
                          <h3>Attendees ({mealDay.totalAttendees})</h3>
                        ) : (
                          <h3 className="font-medium">No attendees</h3>
                        )}
                      </div>

                      {/* Attendee Avatars */}
                      {mealDay.totalAttendees > 0 && (
                        <ul className="flex flex-wrap items-center justify-center gap-2 p-2 -ms-4 w-full">
                          {/* Render actual attendees */}
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

                          {/* Add missing avatars if attendeeDetails < totalAttendees */}
                          {Array.from(
                            {
                              length: Math.min(
                                sliceCount - mealDay.attendeeDetails.length,
                                mealDay.totalAttendees -
                                  mealDay.attendeeDetails.length,
                              ),
                            },
                            (_, index) => (
                              <li
                                key={`placeholder-${index}`}
                                className="-me-4"
                              >
                                <Avatar name="?" />
                              </li>
                            ),
                          )}

                          {/* Show "+x more" if totalAttendees > 5 */}
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

                {!mealDay && (
                  <div className="flex flex-col gap-2 self-end w-fullborder-b">
                    <div className="p-4 text-sm font-medium text-gray-400">
                      <h3>No attendees</h3>
                    </div>
                  </div>
                )}
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
                {user && (
                  <Form method="post" className="p-4 w-full self-end">
                    <input
                      type="hidden"
                      name="date"
                      value={day.toISOString()}
                    />
                    <input type="hidden" name="userId" value={user._id} />
                    {isUserAttending ? (
                      // Render Remove Button if the user is already attending
                      <Button
                        type="submit"
                        name="action"
                        value="remove"
                        className="mt-2 w-full"
                        variant="destructive"
                      >
                        Remove Attendance
                      </Button>
                    ) : (
                      // Render Attend Button otherwise
                      <>
                        <input
                          type="number"
                          name="attendeeCount"
                          defaultValue={1}
                          className="border rounded p-2 w-full"
                          min={1}
                          max={10}
                        />
                        <Button
                          type="submit"
                          name="action"
                          value="attend"
                          className="mt-2 w-full"
                        >
                          Attend
                        </Button>
                      </>
                    )}
                  </Form>
                )}
              </div>
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
  const actionType = form.get("action"); // Check for attend or remove action

  try {
    const mealDay = await mongoose.models.Mealday.findOne({ date });

    if (mealDay) {
      if (actionType === "remove") {
        // Remove the user from the attendees list
        mealDay.attendees = mealDay.attendees.filter(
          (a) => a.user.toString() !== userId,
        );
      } else if (actionType === "attend") {
        // Add or update attendance
        const attendeeCount = parseInt(form.get("attendeeCount"));
        const existingAttendee = mealDay.attendees.find(
          (a) => a.user.toString() === userId,
        );
        if (existingAttendee) {
          existingAttendee.numberOfPeople = attendeeCount;
        } else {
          mealDay.attendees.push({
            user: userId,
            numberOfPeople: attendeeCount,
          });
        }
      }
      await mealDay.save();
    } else if (actionType === "attend") {
      // Create a new MealDay if not found and the action is "attend"
      await mongoose.models.Mealday.create({
        date,
        meals: [],
        attendees: [
          { user: userId, numberOfPeople: parseInt(form.get("attendeeCount")) },
        ],
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to update meal day" }, { status: 400 });
  }
};
