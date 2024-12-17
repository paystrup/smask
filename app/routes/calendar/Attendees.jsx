// Display attendees list with avatars
// Slice added and a plus is displayed if there are more attendees
// Attendees are sorted by first name
// Attendees are limited to slicecount

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// Props: mealDay
export default function Attendees({ mealDay, maxAvatars }) {
  const sliceCount = maxAvatars || 5;

  if (!mealDay) {
    return <></>;
  }

  return (
    <>
      {mealDay.totalAttendees > 0 && (
        <ul className="flex -space-x-2 overflow-hidden">
          {mealDay.attendeeDetails
            .sort((a, b) => {
              const firstNameA = a?.firstName?.toLowerCase() || "";
              const firstNameB = b?.firstName?.toLowerCase() || "";
              return firstNameA.localeCompare(firstNameB);
            })
            .slice(0, sliceCount)
            .map((attendee) => (
              <li key={attendee?.user?._id || Math.random()}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="inline-block size-8 rounded-full relative">
                      {attendee?.image ? (
                        <img
                          src={attendee?.image}
                          alt={`${attendee?.firstName || "Guest"} ${
                            attendee?.lastName || ""
                          }`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full size-8 h-full rounded-full object-cover bg-neutral-800 text-white flex items-center justify-center relative">
                          <p className="text-xs absolute inset-0 flex items-center justify-center">
                            {attendee?.firstName?.charAt(0) || "?"}
                          </p>
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{attendee?.firstName + " " + attendee?.lastName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}

          {Array.from(
            {
              length: Math.min(
                sliceCount - mealDay.attendeeDetails.length,
                mealDay.totalAttendees - mealDay.attendeeDetails.length,
              ),
            },
            (_, index) => (
              <li
                key={`placeholder-${index}`}
                className="inline-block size-8 rounded-full"
              >
                <div className="w-full h-full rounded-full object-cover bg-white text-black flex items-center justify-center relative">
                  <p className="text-xs absolute inset-0 flex items-center justify-center">
                    ?
                  </p>
                </div>
              </li>
            ),
          )}

          {mealDay.totalAttendees > sliceCount && (
            <li className="inline-block size-8 rounded-full">
              <div className="w-full h-full rounded-full object-cover bg-primary-blue text-white flex items-center justify-center relative">
                <p className="text-xs font-semibold absolute inset-0 flex items-center justify-center">
                  +{mealDay.totalAttendees - sliceCount}
                </p>
              </div>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
