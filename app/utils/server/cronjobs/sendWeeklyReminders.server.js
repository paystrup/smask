import { json } from "@remix-run/node";
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns";
import mongoose from "mongoose";
import { sendReminder } from "../nodeMailer.server";

export async function sendWeeklyReminders() {
  try {
    // Calculate next week's date range (Monday to Sunday)
    const today = new Date();
    const nextWeekStart = startOfWeek(addWeeks(today, 1), {
      weekStartsOn: 1,
    });
    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

    // Find mealDays for next week
    const nextWeekMealDays = await mongoose.models.Mealday.find({
      date: { $gte: nextWeekStart, $lte: nextWeekEnd },
    });

    // Get all user IDs attending next week's meals
    const attendingUserIds = new Set(
      nextWeekMealDays.flatMap((mealDay) =>
        mealDay.attendees.map((attendee) => attendee.user.toString()),
      ),
    );

    // Find users not attending any meals next week
    const nonAttendingUsers = await mongoose.models.User.find({
      _id: { $nin: Array.from(attendingUserIds) },
    });

    // Create user objects with missing attendance information
    const usersWithMissingAttendance = nonAttendingUsers.map((user) => {
      const missingDays = nextWeekMealDays
        .map((mealDay) => {
          if (
            !mealDay.attendees.some(
              (attendee) => attendee.user.toString() === user._id.toString(),
            )
          ) {
            return format(mealDay.date, "EEEE"); // Return the day name (e.g., "Monday")
          }
          return null;
        })
        .filter(Boolean);

      return {
        firstName: user.firstName,
        email: user.email,
        missingDays,
      };
    });

    // Send out emails using the sendReminder function
    await Promise.all(
      usersWithMissingAttendance.map(async (user) => {
        try {
          await sendReminder(user.email, user.firstName, user.missingDays);
          console.log(
            `Reminder email sent to ${user.email}, ${user.firstName}, Missing days: ${user.missingDays},`,
          );
        } catch (error) {
          console.error(
            `Failed to send reminder email to ${user.email}:`,
            error,
          );
        }
      }),
    );

    return json(
      {
        message: "Weekly attendance reminders sent",
        usersNotified: usersWithMissingAttendance.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in sendWeeklyReminders cron job:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
