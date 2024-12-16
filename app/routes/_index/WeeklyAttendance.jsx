import { useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ArrowDown, TrendingUpIcon } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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
    <TrendingUpIcon className="h-5 w-5 text-white" />
  ) : (
    <ArrowDown className="h-5 w-5 text-white" />
  );
  const trendColor = isPositive ? "text-green-500" : "text-red-500";

  return (
    <Card className="w-full h-full border-0 bg-primary-peach text-primary-dark">
      <CardContent className="pt-6 flex flex-col justify-between h-full gap-2">
        <div className="flex items-start justify-between">
          <CardTitle className="mb-8 2xl:mb-16">
            <h3 className="text-2xl font-semibold tracking-tight">
              {view === "week" ? "Week" : "Month"}
            </h3>
            <p className="text-base font-medium opacity-50">
              {format(days[0].date, "MMM d")} -{" "}
              {format(days[days.length - 1].date, "MMM d")}
            </p>
          </CardTitle>
          <div className="flex flex-col items-center gap-6 justify-between h-full">
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant={view === "week" ? "default" : "outline"}
                onClick={() => setView("week")}
                size="sm"
                className="px-4 border-none"
              >
                Week
              </Button>
              <Button
                variant={view === "month" ? "default" : "outline"}
                onClick={() => setView("month")}
                size="sm"
                className="px-4 border-none"
              >
                Month
              </Button>
            </div>

            <div className="flex gap-2 items-center justify-end">
              {trendIcon}
              <p className="opacity-60 text-base tracking-tighter text-black">
                {isPositive ? "+" : ""}
                {difference} Since last {view}
              </p>
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
          className="text-base text-primary-dark"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            barGap={2}
            barCategoryGap={0}
          >
            <XAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              dataKey="day"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="attendees"
              radius={40}
              width={20}
              fill="#FFF"
              barSize={view === "week" ? 50 : 20}
              margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
              padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
