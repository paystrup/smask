/* eslint-disable react/prop-types */
import { endOfWeek, format, startOfWeek } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

export default function WeeklyAttendance({ mealDays }) {
  const today = new Date();
  const hideWeekends = true;

  // Helper to get the current week's days
  const getWeekDays = (hideWeekends = true) => {
    let startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;

    if (isWeekend) {
      startOfWeekDate = startOfWeek(
        new Date(today.setDate(today.getDate() + 1)),
        { weekStartsOn: 1 },
      );
    }

    const daysToShow = hideWeekends ? 5 : 7;

    return Array.from({ length: daysToShow }).map((_, index) => {
      const day = new Date(startOfWeekDate);
      day.setDate(day.getDate() + index);
      return {
        date: day.toISOString().split("T")[0],
        dayLabel: day.toLocaleString("en-US", { weekday: "short" }),
      };
    });
  };

  const weekDays = getWeekDays(hideWeekends);

  // Map mealDays to current week
  const chartData = weekDays.map(({ date, dayLabel }) => {
    const mealDay = mealDays.find(
      (meal) => new Date(meal.date).toISOString().split("T")[0] === date,
    );
    return {
      day: dayLabel,
      attendees: mealDay ? mealDay.totalAttendees : 0,
    };
  });

  // Calculate total attendees for current and previous weeks
  const currentWeekTotal = chartData.reduce(
    (sum, day) => sum + day.attendees,
    0,
  );

  // Get previous week's data
  const previousWeekDays = getWeekDays(hideWeekends).map(({ date }) => {
    const previousDate = new Date(
      new Date(date).setDate(new Date(date).getDate() - 7),
    );
    return previousDate.toISOString().split("T")[0];
  });

  const previousWeekTotal = previousWeekDays.reduce((sum, date) => {
    const mealDay = mealDays.find(
      (meal) => new Date(meal.date).toISOString().split("T")[0] === date,
    );
    return sum + (mealDay ? mealDay.totalAttendees : 0);
  }, 0);

  // Calculate the difference
  const difference = currentWeekTotal - previousWeekTotal;

  // Determine the icon and color
  const isPositive = difference > 0;
  const trendIcon = isPositive ? (
    <TrendingUp className="text-green-500 h-5 w-5" />
  ) : (
    <TrendingDown className="text-red-500 h-5 w-5" />
  );
  const trendColor = isPositive ? "text-green-500" : "text-red-500";

  return (
    <Card className="w-full h-full border-0 bg-slate-100 text-black">
      <CardContent className="pt-6 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <CardTitle className="mb-16 space-y-1">
            <h3 className="text-2xl font-semibold tracking-tighter">
              Weekly Attendance
            </h3>
            <p className="text-lg opacity-80 font-normal">
              {format(startOfWeek(today, { weekStartsOn: 1 }), "MMM d")} -{" "}
              {format(endOfWeek(today, { weekStartsOn: 1 }), "MMM d")}
            </p>
          </CardTitle>
          <div className="flex items-center gap-4 justify-end">
            <p className="opacity-60 text-lg tracking-tighter text-black">
              Since last week
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

        <ChartContainer
          config={{
            attendees: {
              label: "Attendees",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <ResponsiveContainer>
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
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
