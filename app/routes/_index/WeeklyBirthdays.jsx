import {
  compareAsc,
  endOfWeek,
  format,
  isSameDay,
  isSameWeek,
  isValid,
  parseISO,
  startOfWeek,
} from "date-fns";
import Avatar from "~/components/_feature/avatar/Avatar";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

export default function WeeklyBirthdays({ users }) {
  const today = new Date();

  const birthdaysThisWeek = users
    .filter((user) => {
      if (!user.birthday) return false;

      const birthday = parseISO(user.birthday);
      if (!isValid(birthday)) return false;

      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate(),
      );
      return isSameWeek(today, thisYearBirthday, { weekStartsOn: 1 }); // Week starts on Monday
    })
    // Sort by birthday
    .sort((a, b) => {
      const dateA = parseISO(a.birthday);
      const dateB = parseISO(b.birthday);
      const thisYearA = new Date(
        today.getFullYear(),
        dateA.getMonth(),
        dateA.getDate(),
      );
      const thisYearB = new Date(
        today.getFullYear(),
        dateB.getMonth(),
        dateB.getDate(),
      );
      return compareAsc(thisYearA, thisYearB);
    });

  return (
    <Card className="w-full h-full border-0 bg-primary-dark text-white flex flex-col justify-between gap-8">
      <CardTitle className="p-7 pb-2 flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Birthdays</h3>
          <p className="text-base font-medium opacity-50">
            {format(startOfWeek(today, { weekStartsOn: 1 }), "MMM d")} -{" "}
            {format(endOfWeek(today, { weekStartsOn: 1 }), "MMM d")}
          </p>
        </div>
        <p className="text-base font-medium opacity-50">
          Week {format(today, "I")}
        </p>
      </CardTitle>
      <CardContent>
        {birthdaysThisWeek.length > 0 ? (
          <ul className="space-y-2">
            {birthdaysThisWeek.map((user) => {
              const birthday = parseISO(user.birthday);
              const isBirthdayToday = isSameDay(
                today,
                new Date(
                  today.getFullYear(),
                  birthday.getMonth(),
                  birthday.getDate(),
                ),
              );
              return (
                <li key={user._id} className="flex items-center space-x-2">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.firstName + " " + user.lastName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar name={user.firstName} />
                  )}

                  <div>
                    <h5>
                      {user.firstName} {user.lastName} {isBirthdayToday && "🎉"}
                    </h5>
                    <p className="text-xs opacity-60">
                      {isValid(birthday)
                        ? format(birthday, "MMM d")
                        : "Invalid date"}
                      {isBirthdayToday && " (Today)"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-base font-medium opacity-50">
            No birthdays this week
          </p>
        )}
      </CardContent>
    </Card>
  );
}
