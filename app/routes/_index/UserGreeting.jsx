import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function UserGreeting({ userData, isAdmin }) {
  return (
    <div className="relative">
      {isAdmin && (
        <div className="h-5 w-5 text-center rounded-full bg-neutral-100 shadow-2xl flex items-center justify-center absolute left-0 top-0 z-50">
          <p className="text-xs">✨</p>
        </div>
      )}

      <Avatar className="w-14 h-14">
        <AvatarImage src={userData?.image} />
        {userData?.firstName && (
          <AvatarFallback>{userData?.firstName?.slice(0, 1)}</AvatarFallback>
        )}
      </Avatar>
    </div>
  );
}
