import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { DailyAttendanceCard } from "./DailyAttendanceCard";
import WeeklyAttendance from "./WeeklyAttendance";
import DailyMealCard from "./DailyMealCard";
import WeeklyBirthdays from "./WeeklyBirthdays";
import { addDays } from "date-fns";
import { formatDateWithDateFns } from "~/utils/client/formatDate";
import Announcements from "./Announcements";
import { Badge } from "~/components/ui/badge";
import UserGreeting from "./UserGreeting";

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

  const isAdmin = userData.admin;

  return json({ userData, mealDays, allUsersInWorkspace, isAdmin });
}

export default function Index() {
  const { mealDays, userData, allUsersInWorkspace, isAdmin } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/?index";
  const today = new Date();

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

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

  const userGuestsToday = relevantMealday?.guestDetails?.filter(
    (guest) => guest.addedBy === userData._id,
  );

  const todayOrNextWorkday = isEndOfWeek ? "next workday" : "today";

  return (
    <section className="flex flex-col lg:h-[100svh] p-2 md:px-4 lg:p-8 pt-14">
      <div className="flex flex-col lg:flex-row items-start justify-between w-full mb-6 lg:mb-12">
        <div className="flex gap-2">
          <UserGreeting userData={userData} isAdmin={isAdmin} />

          <div className="flex flex-col justify-between">
            <h1 className="text-2xl font-medium tracking-tighter">
              Hi, {userData.firstName}
            </h1>
            <p className="text-base font-medium tracking-tight opacity-70">
              {isUserAttending
                ? `You're attending ${todayOrNextWorkday}🍽️`
                : `Not attending ${todayOrNextWorkday}😢`}
            </p>
          </div>
        </div>

        <div className="flex mt-6 lg:mt-0 lg:flex-col justify-between w-full lg:w-fit lg:items-end gap-2">
          <h2 className="text-md lg:text-2xl tracking-tighter font-medium">
            {todayFormatted}
          </h2>
          <Badge className="text-xs bg-primary-blue text-white">
            {userData.location.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-grow overflow-hidden">
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <DailyMealCard mealDays={mealDays} isAdmin={isAdmin} />
          <WeeklyAttendance mealDays={mealDays} />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <DailyAttendanceCard
            mealDays={mealDays}
            isUserAttending={isUserAttending}
            isSubmitting={isSubmitting}
            onSubmit={() =>
              handleUserAttend(relevantMealday?.date || formattedDate)
            }
            onGuestSubmit={(diet, action) =>
              handleGuestAttend(
                relevantMealday?.date || formattedDate,
                diet,
                action,
              )
            }
            userGuestsToday={userGuestsToday}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 lg:grid lg:grid-rows-8 gap-4">
          <div className="lg:row-span-3">
            <Announcements />
          </div>
          <div className="lg:row-span-5">
            <WeeklyBirthdays users={allUsersInWorkspace} />
          </div>
        </div>
      </div>
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

  try {
    let mealDay = await mongoose.models.Mealday.findOne({ date }).populate(
      "guests",
    );

    if (!mealDay && actionType === "attend") {
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
