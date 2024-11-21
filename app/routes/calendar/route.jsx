import { Form, useLoaderData } from "@remix-run/react";
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

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  const userMeals = await mongoose.models.Mealday.find({
    attendees: { $elemMatch: { user: user._id } },
  });
  const mealDays = await mongoose.models.Mealday.find();
  return json({ user, userData, mealDays, userMeals });
};
// Sample events data
const eventsData = {
  "2024-10-30": [
    {
      id: 1,
      title: "Breakfast",
      startTime: "09:00",
      endTime: "10:00",
      meal: "Test",
    },
    {
      id: 2,
      title: "Lunch",
      startTime: "14:00",
      endTime: "15:30",
      meal: "Test",
    },
  ],
  "2024-10-31": [
    {
      id: 3,
      title: "Lunch",
      startTime: "11:00",
      endTime: "12:00",
      meal: "Test",
    },
  ],
};
export default function CreateMealDays() {
  const { user, mealDays, userMeals } = useLoaderData();
  console.log(mealDays, userMeals);

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

  const navigateWeek = (direction) => {
    setCurrentWeek((prevWeek) =>
      addWeeks(prevWeek, direction === "next" ? 1 : -1),
    );
  };

  const showCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  return (
    <section className="flex flex-col w-full mt-12 h-[70vh]">
      <div>
        {!isCurrentWeek && (
          <Button onClick={showCurrentWeek}>Go to current week</Button>
        )}
      </div>

      <header className="flex items-center justify-between bg-white border-b pb-8">
        <Button
          onClick={() => navigateWeek("prev")}
          aria-label="Previous week"
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex flex-col items-center justify-center">
          <h2 className="text-4xl font-semibold tracking-tight">
            Week {weekNumber}
          </h2>
          <h1 className="text-lg opacity-60">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
          </h1>
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
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`flex flex-col justify-between shadow text-center h-full overflow-hidden ${
              isToday(day) ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div>
              <div
                className={`p-4 ${isToday(day) ? "bg-blue-50" : "bg-gray-50"} border-b`}
              >
                <h2
                  className={`font-semibold text-xl ${
                    isToday(day) ? "text-blue-800" : "text-gray-800"
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

              <ScrollArea className="mt-8">
                <div className="space-y-2">
                  {eventsData[format(day, "yyyy-MM-dd")]?.map((event) => (
                    <div
                      key={event.id}
                      className="bg-blue-50 border border-blue-200 p-4 rounded-lg"
                    >
                      <h3 className="font-semibold text-blue-800">
                        {event.title}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="text-sm ">{event.meal}</p>
                    </div>
                  ))}
                  {!eventsData[format(day, "yyyy-MM-dd")] && (
                    <p className="text-gray-500 text-center">No meals yet</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Attend Button Form */}
            {user && (
              <Form method="post" className="p-4 w-full self-end">
                <input type="hidden" name="date" value={day.toISOString()} />
                <input type="hidden" name="userId" value={user._id} />
                <input
                  type="number"
                  name="attendeeCount"
                  defaultValue={1}
                  className="border rounded p-2 w-full"
                  min={1}
                  max={10}
                />
                <Button type="submit" className="mt-2 w-full">
                  Attend
                </Button>
              </Form>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const userId = form.get("userId");
  const date = new Date(form.get("date"));
  const attendeeCount = parseInt(form.get("attendeeCount"));

  try {
    let mealDay = await mongoose.models.Mealday.findOne({ date });

    if (mealDay) {
      // Update existing MealDay
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
    } else {
      // Create new MealDay
      mealDay = new mongoose.models.Mealday({
        date,
        meals: [],
        attendees: [{ user: userId, numberOfPeople: attendeeCount }],
      });
    }

    await mealDay.save();
    return redirect("/profile");
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to create/update meal day" }, { status: 400 });
  }
};
