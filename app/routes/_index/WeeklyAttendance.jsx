import { useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Button } from "~/components/ui/button";

export default function AttendanceChart({ mealDays }) {
  const [view, setView] = useState("week");
  const today = new Date();
  const hideWeekends = true;

  // Helper to get the current week's or month's days
  const getDays = (isMonth = false, hideWeekends = true) => {
    const startDate = isMonth
      ? startOfMonth(today)
      : startOfWeek(today, { weekStartsOn: 1 });
    const endDate = isMonth
      ? endOfMonth(today)
      : endOfWeek(today, { weekStartsOn: 1 });
    const daysToShow = isMonth
      ? endDate.getDate() - startDate.getDate() + 1
      : hideWeekends
        ? 5
        : 7;

    return Array.from({ length: daysToShow })
      .map((_, index) => {
        const day = addDays(startDate, index);
        if (!isMonth && hideWeekends && [0, 6].includes(day.getDay())) {
          return null;
        }
        return {
          date: format(day, "yyyy-MM-dd"),
          dayLabel: isMonth ? format(day, "d") : format(day, "EEE"),
        };
      })
      .filter(Boolean);
  };

  const days = getDays(view === "month", hideWeekends);

  // Map mealDays to current week/month
  const chartData = days.map(({ date, dayLabel }) => {
    const mealDay = mealDays.find(
      (meal) => format(new Date(meal.date), "yyyy-MM-dd") === date,
    );
    return {
      day: dayLabel,
      attendees: mealDay ? mealDay.totalAttendees : 0,
    };
  });

  // Calculate total attendees for current and previous periods
  const currentTotal = chartData.reduce((sum, day) => sum + day.attendees, 0);

  // Get previous period's data
  const previousDays = getDays(view === "month", hideWeekends).map(
    ({ date }) => {
      const previousDate = addDays(new Date(date), view === "month" ? -30 : -7);
      return format(previousDate, "yyyy-MM-dd");
    },
  );

  const previousTotal = previousDays.reduce((sum, date) => {
    const mealDay = mealDays.find(
      (meal) => new Date(meal.date).toISOString().split("T")[0] === date,
    );
    return sum + (mealDay ? mealDay.totalAttendees : 0);
  }, 0);

  // Calculate the difference
  const difference = currentTotal - previousTotal;

  // Determine the icon and color
  const isPositive = difference > 0;
  const trendIcon = isPositive ? (
    <TrendingUp className="text-green-500 h-5 w-5" />
  ) : (
    <TrendingDown className="text-red-500 h-5 w-5" />
  );
  const trendColor = isPositive ? "text-green-500" : "text-red-500";

  return (
    <Card className="w-full h-full border-0 bg-neutral-200/50 text-black">
      <CardContent className="pt-6 flex flex-col justify-between h-full gap-2">
        <div className="flex items-start justify-between">
          <CardTitle className="mb-16 space-y-1">
            <h3 className="text-2xl font-semibold tracking-tighter">
              {view === "week" ? "Weekly" : "Monthly"} Attendance
            </h3>
            <p className="text-lg opacity-80 font-normal">
              {format(days[0].date, "MMM d")} -{" "}
              {format(days[days.length - 1].date, "MMM d")}
            </p>
          </CardTitle>
          <div className="flex flex-col items-center gap-6 justify-between h-full">
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant={view === "week" ? "default" : "outline"}
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button
                variant={view === "month" ? "default" : "outline"}
                onClick={() => setView("month")}
              >
                Month
              </Button>
            </div>

            <div className="flex gap-2 items-center justify-end">
              <p className="opacity-60 text-base tracking-tighter text-black">
                Since last {view}
              </p>
              <div className="flex gap-1">
                {trendIcon}
                <span className={`font-base ${trendColor}`}>
                  {isPositive ? "+" : ""}
                  {difference}{" "}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ChartContainer
          config={{
            attendees: {
              label: "Attendees",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            barGap={2}
            barCategoryGap={0}
          >
            <CartesianGrid
              vertical={false}
              color="#22222"
              strokeDasharray="3 3"
            />
            <XAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              dataKey="day"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="attendees"
              radius={10}
              width={10}
              fill="#0e3cf6"
              barSize={view === "week" ? 40 : 20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
