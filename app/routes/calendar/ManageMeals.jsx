import { useState, useMemo } from "react";
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
import { Plus, PlusCircle } from "lucide-react";

export default function ManageMeals({ day, allMeals, handleAddMeal }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleMeals, setVisibleMeals] = useState(6);

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

  const handleSubmit = () => {
    if (selectedMeal && startTime && endTime) {
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
    setIsDialogOpen(false);
  };

  const handleLoadMore = () => {
    setVisibleMeals((prev) => prev + 6);
  };

  const handleAddDefaultLunch = () => {
    setStartTime("12:00");
    setEndTime("12:30");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger className="bg-white p-6 rounded-lg w-full m-4">
        <Plus className="h-4 w-4" />
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
          <ScrollArea className="h-72 my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedMeals.length > 0 &&
                filteredAndSortedMeals.slice(0, visibleMeals).map((meal) => (
                  <button
                    className={cn(
                      "h-auto col-span-1 md:col-span-2 py-4 px-4 me-6 flex flex-col items-start text-left rounded-lg hover:bg-neutral-100 hover:text-black transition-colors ease-in-out duration-300",
                      selectedMeal?._id === meal?._id.toString() &&
                        "bg-black text-white hover:bg-neutral-800 hover:text-white",
                    )}
                    onClick={() => setSelectedMeal(meal)}
                    key={meal?._id}
                  >
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddDefaultLunch} variant="outline">
              Add Default Lunch (12:00 - 12:30)
            </Button>
          </div>
        </div>
        <DialogFooter className="mt-4 flex flex-col gap-2">
          <Button
            variant="desctructive"
            onClick={handleCancel}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMeal || !startTime || !endTime}
            className="w-full"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
