import { addDays, format } from "date-fns";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { formatDateWithDateFns } from "~/utils/client/formatDate";

export default function DailyMealCard({ mealDays }) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let displayDate = today;
  if (isWeekend) {
    // If it's weekend, set the display date to next Monday
    displayDate = addDays(today, (1 + 7 - dayOfWeek) % 7);
  }

  const formattedDate = formatDateWithDateFns(displayDate.toISOString());
  const relevantMealday = mealDays.find(
    (meal) => formatDateWithDateFns(meal.date) === formattedDate,
  );

  const dateString = format(displayDate, "EEE, MMM d");

  return (
    <Card className="p-6 h-full flex flex-col justify-between border-0 bg-primary-blue text-white">
      <CardTitle className="flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold tracking-tighter">
            Menu of the day
          </h3>

          {isWeekend && (
            <p className="text-lg opacity-80 font-normal">(Next workday)</p>
          )}
        </div>
        <p className="text-lg opacity-50 font-normal">{dateString}</p>
      </CardTitle>

      <CardContent className="p-0">
        {relevantMealday?.meals?.length > 0 ? (
          <>
            {relevantMealday.meals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-4">
                <h3>{meal.name}</h3>
                <p>{meal.description}</p>
              </div>
            ))}
          </>
        ) : (
          <p className="opacity-80">No meals planned for today</p>
        )}
      </CardContent>
    </Card>
  );
}
