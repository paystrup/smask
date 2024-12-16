import { addYears, differenceInDays } from "date-fns";
import { Badge } from "~/components/ui/badge";
import Avatar from "../_feature/avatar/Avatar";
import { AttendanceChart } from "../_feature/AttendanceChart/AttendanceChart";
import Ribbon from "../_foundation/Ribbon";
import FavoriteDish from "./FavoriteDish";

export default function Profile({ userData, userMeals }) {
  // Display amount of days till user's birthday
  const today = new Date();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    new Date(userData?.birthday).getMonth(),
    new Date(userData?.birthday).getDate(),
  );
  const nextBirthday =
    birthdayThisYear < today ? addYears(birthdayThisYear, 1) : birthdayThisYear;
  const daysUntilBirthday = differenceInDays(nextBirthday, today);

  if (!userData) {
    return (
      <div>
        <h1>User not found. Please try again.</h1>
      </div>
    );
  }

  return (
    <Ribbon>
      <div className="flex flex-col justify-center items-center w-full">
        <div className="flex flex-col gap-2 items-center justify-center w-full mb-12">
          {userData?.image ? (
            <img
              src={userData?.image}
              alt={userData?.firstName + " " + userData?.lastName}
              className="w-20 h-20 object-cover rounded-full"
            />
          ) : (
            <Avatar
              className="w-20 h-20 text-2xl font-medium"
              name={userData?.firstName}
            />
          )}
          <h1 className="text-4xl font-semibold tracking-tight text-center">
            {userData?.firstName} {userData?.lastName}
          </h1>

          <a
            href={`mailto:${userData?.email}`}
            className="hover:opacity-50 transition-opacity duration-300 ease-in-out"
          >
            {userData?.email}
          </a>

          <div className="flex flex-col gap-2 my-6">
            <div className="flex gap-2 flex-wrap items-center justify-center">
              <Badge className="text-sm bg-black text-white">
                Created{" "}
                {new Date(userData?.createdAt).toLocaleDateString("en-US")}
              </Badge>

              {userData?.location?.name && (
                <Badge variant="primary" className="text-sm capitalize">
                  {userData?.location?.name}
                </Badge>
              )}
            </div>

            <div className="flex gap-2 flex-wrap items-center justify-center">
              <Badge variant="primary" className="text-sm capitalize">
                {userData?.diet === "none"
                  ? "No diet preference"
                  : userData?.diet}
              </Badge>

              {userData?.birthday && (
                <Badge className="text-sm">
                  🎉 Birthday in {daysUntilBirthday} days
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="col-span-1">
            <FavoriteDish dish={userData?.favoriteMeal || null} />
          </div>

          <div className="col-span-1">
            <AttendanceChart userMeals={userMeals} userData={userData} />
          </div>
        </div>
      </div>
    </Ribbon>
  );
}
