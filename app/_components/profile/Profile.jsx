import PropTypes from "prop-types";
import { Badge } from "~/components/ui/badge";

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
        <div className="h-20 w-20 bg-black rounded-full mb-2"></div>
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
          <Badge className="text-sm">
            Created {new Date(userData.createdAt).toLocaleDateString()}
          </Badge>

          <Badge className="text-sm">🎉 Birthday in X days</Badge>
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