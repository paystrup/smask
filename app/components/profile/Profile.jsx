import { addYears, differenceInDays } from "date-fns";
import PropTypes from "prop-types";
import { Badge } from "~/components/ui/badge";
import Avatar from "../avatar/Avatar";

export default function Profile({ user, userData }) {
  Profile.propTypes = {
    user: PropTypes.object.isRequired,
    userData: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  };
  // Display amount of days till user's birthday
  const today = new Date();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    new Date(user.birthday).getMonth(),
    new Date(user.birthday).getDate(),
  );
  const nextBirthday =
    birthdayThisYear < today ? addYears(birthdayThisYear, 1) : birthdayThisYear;
  const daysUntilBirthday = differenceInDays(nextBirthday, today);

  if (!userData || !user) {
    return (
      <div>
        <h1>User not found. Please try again.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 items-center justify-center w-full mb-12">
        <Avatar
          className="w-16 h-16 text-2xl font-medium"
          name={userData.firstName}
        />
        <h1 className="text-4xl font-semibold tracking-tight text-center">
          {userData.firstName} {userData.lastName}
        </h1>

        <a
          href={`mailto:${userData.email}`}
          className="hover:opacity-50 transition-opacity duration-300 ease-in-out"
        >
          {userData.email}
        </a>

        <div className="flex gap-2 my-6">
          <Badge variant="primary" className="text-sm capitalize">
            {user.diet === "none" ? "No diet preference" : user.diet}
          </Badge>

          <Badge className="text-sm">
            Created {new Date(userData.createdAt).toLocaleDateString()}
          </Badge>

          {user.birthday && (
            <Badge className="text-sm">
              🎉 Birthday in {daysUntilBirthday} days
            </Badge>
          )}
        </div>

        <h3 className="text-xl tracking-tight">
          Favourite dish is <b>boller i karry</b>
        </h3>
      </div>

      <div className="justify-start items-start">
        <h2>Latest attendance</h2>
      </div>
      <p>{JSON.stringify(user, null, 4)}</p>
      <p>{JSON.stringify(userData, null, 4)}</p>
    </div>
  );
}
