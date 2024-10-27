import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { useState } from "react";
import mongoose from "mongoose";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { PlusIcon, MinusIcon } from "lucide-react";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await mongoose.models.User.findById(user._id);

  return json({ user, userData });
};

export default function CreateMealDays() {
  const actionData = useActionData();
  const { user } = useLoaderData();
  const userId = user._id;
  const [selectedDates, setSelectedDates] = useState([]);
  const [attendees, setAttendees] = useState({});

  const handleDateSelect = (dates) => {
    setSelectedDates(dates);
    const newAttendees = { ...attendees };
    dates.forEach((date) => {
      const dateString = date.toISOString().split("T")[0];
      if (!newAttendees[dateString]) {
        newAttendees[dateString] = 1;
      }
    });
    setAttendees(newAttendees);
  };

  const handleAttendeeChange = (dateString, change) => {
    setAttendees((prev) => ({
      ...prev,
      [dateString]: Math.max(1, (prev[dateString] || 1) + change),
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Create Meal Days</h1>
      <Form method="post" className="space-y-4">
        <div className="flex flex-col items-center">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
        <div className="space-y-2">
          <Label>Selected Dates and Attendees</Label>
          {selectedDates.map((date) => {
            const dateString = date.toISOString().split("T")[0];
            return (
              <div key={dateString} className="flex items-center space-x-2">
                <Input
                  type="date"
                  name="dates[]"
                  value={dateString}
                  readOnly
                  className="w-40"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAttendeeChange(dateString, -1)}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  name="attendees[]"
                  value={attendees[dateString] || 1}
                  onChange={(e) =>
                    handleAttendeeChange(
                      dateString,
                      parseInt(e.target.value) - (attendees[dateString] || 1),
                    )
                  }
                  min="1"
                  className="w-20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAttendeeChange(dateString, 1)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
        <input type="hidden" name="userId" value={userId} />
        <Button type="submit">Create/Update Meal Days</Button>
      </Form>
      {actionData?.error && (
        <p className="mt-4 text-red-500">{actionData.error}</p>
      )}
    </div>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const userId = form.get("userId");
  const dates = form.getAll("dates[]");
  const attendeeCounts = form.getAll("attendees[]");

  try {
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const attendeeCount = parseInt(attendeeCounts[i]);

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
    }

    return redirect("/profile");
  } catch (error) {
    console.error(error);
    return json(
      { error: "Failed to create/update meal days" },
      { status: 400 },
    );
  }
};
