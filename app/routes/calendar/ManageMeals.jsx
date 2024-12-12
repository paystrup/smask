import { useState, useMemo, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Utensils } from "lucide-react";

export default function ManageMeals({ day, allMeals, handleAddMeal }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleMeals, setVisibleMeals] = useState(6);
  const [timeError, setTimeError] = useState("");

  const filteredAndSortedMeals = useMemo(() => {
    return allMeals
      .filter((meal) =>
        meal.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortOrder === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortOrder === "asc") {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
  }, [allMeals, searchQuery, sortOrder]);

  useEffect(() => {
    validateTimes();
  }, [startTime, endTime]);

  const validateTimes = () => {
    if (startTime && endTime) {
      if (endTime <= startTime) {
        setTimeError("End time must be after start time");
      } else {
        setTimeError("");
      }
    } else {
      setTimeError("");
    }
  };

  const handleSubmit = () => {
    if (selectedMeal && startTime && endTime && !timeError) {
      handleAddMeal(
        day,
        selectedMeal._id,
        new Date(`${day}T${startTime}`).toISOString(),
        new Date(`${day}T${endTime}`).toISOString(),
        "addMeal",
      );
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedMeal(null);
    setStartTime("");
    setEndTime("");
    setTimeError("");
    setIsDialogOpen(false);
  };

  const handleLoadMore = () => {
    setVisibleMeals((prev) => prev + 6);
  };

  const handleAddDefaultLunch = () => {
    setStartTime("12:00");
    setEndTime("12:30");
  };

  const handleAddDefaultBreakfast = () => {
    setStartTime("08:00");
    setEndTime("10:00");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Utensils className="h-4 w-4" />
          Add meal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tighter mb-6">
            Add meal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8 flex flex-col w-full max-w-3xl">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-72 my-6 bg-neutral-50 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedMeals.length > 0 &&
                filteredAndSortedMeals.slice(0, visibleMeals).map((meal) => (
                  <button
                    className={cn(
                      "h-auto col-span-1 md:col-span-2 py-4 px-4 me-2 flex flex-col items-start text-left rounded-lg hover:bg-neutral-100 hover:text-black transition-colors ease-in-out duration-300",
                      selectedMeal?._id === meal?._id.toString() &&
                        "bg-black text-white hover:bg-neutral-800 hover:text-white",
                    )}
                    onClick={() => setSelectedMeal(meal)}
                    key={meal?._id}
                  >
                    <div className="flex gap-4">
                      <div className="relative aspect-square min-w-24 min-h-24 max-h-24 max-w-24">
                        {meal?.image ? (
                          <img
                            src={meal?.image}
                            alt={meal?.title}
                            className="h-full w-full object-cover rounded-xl scale-100"
                          />
                        ) : (
                          <div className="flex items-center justify-center text-xl bg-neutral-200 h-full w-full object-cover rounded-2xl">
                            <p>🍽️</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold line-clamp-2">
                          {meal?.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {meal?.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(meal?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              {filteredAndSortedMeals.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center text-black opacity-80 p-28">
                  <p>No meals found</p>
                </div>
              )}
            </div>
            {visibleMeals < filteredAndSortedMeals.length && (
              <div className="mt-4 text-center">
                <Button onClick={handleLoadMore}>Load More</Button>
              </div>
            )}
          </ScrollArea>

          <div className="space-y-4 mt-10">
            <div className="space-y-2">
              <Label className="text-lg tracking-tight">
                Pick a start and end time
              </Label>
              {(() => {
                const timeOptions = [];
                for (let hour = 7; hour <= 24; hour++) {
                  for (let min = 0; min < 60; min += 30) {
                    if (hour === 24 && min > 0) break;
                    const timeString = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                    timeOptions.push({
                      value: timeString,
                      label: timeString,
                    });
                  }
                }

                return (
                  <div className="flex gap-2 w-full">
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })()}
            </div>
            <div className="flex w-full items-end justify-items-end space-x-2 pt-2 pb-4">
              <Button
                onClick={handleAddDefaultBreakfast}
                variant="default"
                size="sm"
              >
                Breakfast (08:00 - 10:00)
              </Button>
              <Button
                onClick={handleAddDefaultLunch}
                variant="default"
                size="sm"
              >
                Lunch (12:00 - 12:30)
              </Button>
            </div>
            {timeError && (
              <p className="text-red-500 text-sm mt-2">{timeError}</p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4 flex flex-col space-x-2">
          <Button
            variant="destructive"
            onClick={handleCancel}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMeal || !startTime || !endTime || timeError}
            className="w-full m-0"
          >
            Add meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
