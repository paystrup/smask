import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import Avatar from "~/components/_feature/avatar/Avatar";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { authenticator } from "~/services/auth.server";

export function meta() {
  return [{ title: "smask | Your workspace" }];
}

// Find users in the same workspace / location as signed in user
export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await mongoose.models.User.findById(user._id).populate(
    "location",
  );

  try {
    const users = await mongoose.models.User.find({
      location: userData.location._id,
    }).populate("location");
    return json({ users, userData });
  } catch (error) {
    console.error(error);
    return json(
      { error: "An error occurred while loading data" },
      { status: 500 },
    );
  }
}

export default function Users() {
  const { users, userData } = useLoaderData();

  return (
    <section>
      <div className="text-center my-8 flex flex-col gap-2 items-center justify-center">
        <h1 className="text-4xl font-semibold tracking-tight">All users</h1>
        <p className="text-md">A list of all users in your current workspace</p>

        {userData.location.name && (
          <div className="flex gap-2 mt-6">
            <Badge className="text-sm w-fit" variant="primary">
              {userData.location.name}
            </Badge>
            {/* <Badge className="text-sm w-fit">Total users: {users.length}</Badge> */}
          </div>
        )}
      </div>

      <Table>
        <TableCaption>
          A list of all users in your workspace. Total users: {users.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>User type</TableHead>
            <TableHead>Workspace</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <Link to={`/user/${user._id}`}>
                <TableCell className="font-medium flex gap-2 items-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.firstName + " " + user.lastName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar name={user.firstName} />
                  )}
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>Not specified</TableCell>
                <TableCell>{user.location.name}</TableCell>
              </Link>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
