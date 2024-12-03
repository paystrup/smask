/* eslint-disable react/prop-types */
// Display attendees list with avatars
// Slice added and a plus is displayed if there are more attendees
// Attendees are sorted by first name
// Attendees are limited to slicecount

import Avatar from "~/components/_feature/avatar/Avatar";

// Props: mealDay
export default function Attendees({ mealDay, maxAvatars }) {
  const sliceCount = maxAvatars || 5;

  if (!mealDay) {
    return <></>;
  }

  return (
    <>
      {mealDay.totalAttendees > 0 && (
        <ul className="flex flex-wrap items-center justify-center gap-2 p-2 -ms-4 w-fit">
          {mealDay.attendeeDetails
            .sort((a, b) => {
              const firstNameA = a?.firstName?.toLowerCase() || "";
              const firstNameB = b?.firstName?.toLowerCase() || "";
              return firstNameA.localeCompare(firstNameB);
            })
            .slice(0, sliceCount)
            .map((attendee) => (
              <li key={attendee?.user?._id || Math.random()} className="-me-4">
                {attendee?.image ? (
                  <img
                    src={attendee?.image}
                    alt={`${attendee?.firstName || "Guest"} ${
                      attendee?.lastName || ""
                    }`}
                    className="h-8 w-8 border rounded-full object-cover"
                  />
                ) : (
                  <Avatar
                    className="border text-xs"
                    name={attendee?.firstName || "?"}
                  />
                )}
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
              <li key={`placeholder-${index}`} className="-me-4">
                <Avatar name="?" />
              </li>
            ),
          )}

          {mealDay.totalAttendees > sliceCount && (
            <li className="flex items-center justify-center h-8 w-8 bg-primary-blue text-white text-xs font-bold rounded-full">
              +{mealDay.totalAttendees - sliceCount}
            </li>
          )}
        </ul>
      )}
    </>
  );
}
