import { Form } from "@remix-run/react";
import { Carrot, Fish, LeafyGreen, Minus, Plus, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Diets } from "~/db/models";
import { cn } from "~/lib/utils";

export default function AddGuestsDialog({
  formattedDate,
  userGuestsToday,
  isSubmitting,
  handleGuestAttend,
  userGuestDietCounts,
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "w-full",
            userGuestsToday?.length === 0 || userGuestsToday === undefined
              ? "bg-neutral-200"
              : "bg-black text-white hover:bg-neutral-700",
          )}
          variant="secondary"
        >
          <User className="w-6 h-6" />
          {userGuestsToday?.length === 0 || userGuestsToday === undefined
            ? "Add guests"
            : "Your guests"}{" "}
          ({userGuestsToday?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Your guests ({userGuestsToday?.length || 0})
          </DialogTitle>
          <DialogDescription className="text-sm opacity-70">
            Add guests below by their diet preferences
          </DialogDescription>
        </DialogHeader>

        <Form className="grid grid-cols-6 gap-4 mt-4">
          {Object.values(Diets).map((diet) => (
            <Card
              key={diet}
              className="overflow-hidden col-span-6 md:col-span-3 border-0 bg-gray-100"
            >
              <CardHeader className="bg-black text-white p-4">
                <CardTitle className="flex items-center justify-between text-md p-0">
                  <span>{diet.charAt(0).toUpperCase() + diet.slice(1)}</span>
                  {diet === "vegan" && (
                    <Carrot className="w-6 h-6 text-primary-foreground opacity-30" />
                  )}
                  {diet === "vegetarian" && (
                    <LeafyGreen className="w-6 h-6 text-primary-foreground opacity-30" />
                  )}
                  {diet === "pescetarian" && (
                    <Fish className="w-6 h-6 text-primary-foreground opacity-30" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() =>
                      handleGuestAttend(formattedDate, diet, "removeGuest")
                    }
                    aria-label={`Remove ${diet} guest`}
                    disabled={!userGuestDietCounts?.[diet]}
                  >
                    <Minus className="h-2 w-2" />
                  </Button>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={userGuestDietCounts?.[diet] || 0}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-xl lg:text-4xl font-bold"
                    >
                      {userGuestDietCounts?.[diet] || 0}
                    </motion.span>
                  </AnimatePresence>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() =>
                      handleGuestAttend(formattedDate, diet, "attendGuest")
                    }
                    aria-label={`Add ${diet} guest`}
                  >
                    <Plus className="h-2 w-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </Form>

        <div className="flex flex-col gap-2 mt-10">
          {/* Form to remove all guests */}
          <Form method="post">
            <input type="hidden" name="date" value={formattedDate} />
            <input type="hidden" name="action" value="removeAllGuests" />

            <Button
              type="submit"
              variant="destructive"
              disabled={userGuestsToday?.length === 0 || isSubmitting}
              className={cn(
                "w-full",
                userGuestsToday?.length === 0 &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              Remove all guests
            </Button>
          </Form>

          <DialogClose className="w-full">
            <Button className="w-full bg-neutral-200" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
