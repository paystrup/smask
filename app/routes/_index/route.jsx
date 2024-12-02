import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { DailyAttendanceCard } from "./DailyAttendanceCard";
import WeeklyAttendance from "./WeeklyAttendance";
import DailyMealCard from "./DailyMealCard";
import WeeklyBirthdays from "./WeeklyBirthdays";
import { addDays } from "date-fns";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Announcements from "./Announcements";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await mongoose.models.User.findById(user._id).populate(
    "location",
  );

  const allUsersInWorkspace = await mongoose.models.User.find({
    location: userData.location._id,
  });

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
          $sum: "$attendees.numberOfPeople",
        },
      },
    },
  ]);

  return json({ user, userData, mealDays, allUsersInWorkspace });
}

export default function Index() {
  const { mealDays, userData, allUsersInWorkspace } = useLoaderData();
  const submit = useSubmit();
  const today = new Date();

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const maxAttendeeCount = 10;

  const dayOfWeek = today.getDay();
  const isEndOfWeek = dayOfWeek === 0 || dayOfWeek === 6;
  let displayDate = today;
  if (isEndOfWeek) {
    // If it's weekend, set the display date to next Monday
    displayDate = addDays(today, (1 + 7 - dayOfWeek) % 7);
  }

  const formattedDate = formatDateWithDateFns(displayDate.toISOString());
  const relevantMealday = mealDays.find(
    (meal) => formatDateWithDateFns(meal.date) === formattedDate,
  );

  const userAttendance = relevantMealday?.attendees.find(
    (attendee) => attendee.user.toString() === userData._id,
  );
  const isUserAttending = !!userAttendance;
  const userAttendeeCount = userAttendance ? userAttendance.numberOfPeople : 0;

  const handleAttendeeCountChange = (day, userId, currentCount, change) => {
    const newCount = Math.min(
      Math.max(0, currentCount + change),
      maxAttendeeCount,
    );
    const formData = new FormData();
    formData.append("date", day);
    formData.append("userId", userId);
    formData.append("attendeeCount", newCount.toString());
    formData.append("action", newCount === 0 ? "remove" : "attend");
    submit(formData, { method: "post" });
  };

  return (
    <section className="flex flex-col h-[100svh] p-8 pt-14">
      <div className="flex items-center justify-between w-full mb-12">
        <div className="flex gap-2">
          <Avatar className="w-14 h-14">
            <AvatarImage src={userData.image} />
            <AvatarFallback>{userData.firstName}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-between">
            <h1 className="text-2xl font-medium tracking-tighter">
              Hi, {userData.firstName}
            </h1>
            <p className="text-base opacity-60">{todayFormatted}</p>
          </div>
        </div>

        <h2 className="text-lg tracking-tight">
          {isUserAttending
            ? "You are attending today. See you in the office! 👋"
            : " Looks like you are not eating in the office today?😢"}
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-grow overflow-hidden">
        <div className="col-span-5 flex flex-col gap-4 overflow-auto">
          <DailyMealCard mealDays={mealDays} />
          <WeeklyAttendance mealDays={mealDays} />
        </div>

        <div className="col-span-3 overflow-auto">
          <DailyAttendanceCard
            mealDays={mealDays}
            isUserAttending={isUserAttending}
            onSubmit={() =>
              handleAttendeeCountChange(
                relevantMealday.date,
                userData._id,
                userAttendeeCount,
                isUserAttending ? -1 : 1,
              )
            }
          />
        </div>

        <div className="col-span-4 overflow-auto grid grid-rows-8 gap-4">
          <div className="row-span-3">
            <Announcements />
          </div>
          <div className="row-span-5">
            <WeeklyBirthdays users={allUsersInWorkspace} />
          </div>
        </div>
      </div>
    </section>
  );
}

export const action = async ({ request }) => {
  const maxAttendeeCount = 10;
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
