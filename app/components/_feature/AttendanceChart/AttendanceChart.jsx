import { Bar, BarChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

export function AttendanceChart({ userMeals }) {
  const currentYear = new Date().getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize data for all months
  const monthlyAttendance = monthNames.map((month) => ({ month, count: 0 }));

  // Count attendance for each month in the current year
  if (userMeals) {
    userMeals.forEach((meal) => {
      const mealDate = new Date(meal.date);
      if (mealDate.getFullYear() === currentYear) {
        const monthIndex = mealDate.getMonth();
        monthlyAttendance[monthIndex].count++;
      }
    });
  }

  return (
    <Card className="bg-primary-dark text-white border-none w-full h-full">
      <CardHeader className="flex justify-between flex-col w-full">
        <h3 className="text-2xl font-semibold tracking-tight">Attendance</h3>
        <p className="text-base font-medium opacity-50">{currentYear}</p>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col justify-between h-full gap-2">
        {userMeals.length === 0 ? (
          <p className="text-base font-medium opacity-50">No data yet</p>
        ) : (
          <ChartContainer
            config={{
              count: {
                label: "Attendance",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="text-base text-primary-dark h-[200px]"
          >
            <BarChart
              accessibilityLayer
              data={monthlyAttendance}
              barGap={2}
              barCategoryGap={0}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                dataKey="month"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                radius={40}
                width={20}
                fill="#FFF"
                barSize={20}
                margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
                padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
