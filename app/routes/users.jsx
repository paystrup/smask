import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import Avatar from "~/_components/Avatar";
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

export function meta() {
  return [{ title: "smask | Your workspace" }];
}

export async function loader() {
  try {
    const users = await mongoose.models.User.find();
    return json({ users });
  } catch (error) {
    console.error(error);
    return json(
      { error: "An error occurred while loading data" },
      { status: 500 },
    );
  }
}

export default function Users() {
  const { users } = useLoaderData();
  console.log(users);

  return (
    <section>
      <div className="text-center my-20 flex flex-col gap-2 items-center justify-center">
        <h1 className="text-5xl font-semibold tracking-tight">All users</h1>
        <p className="text-lg">A list of all users in your current workspace</p>

        <div className="flex gap-2 mt-6">
          <Badge className="text-sm w-fit" variant="primary">
            AKQA + Uncle Grey Aarhus
          </Badge>
          {/* <Badge className="text-sm w-fit">Total users: {users.length}</Badge> */}
        </div>
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
            <TableHead>Workspace</TableHead>
            <TableHead>User type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium flex gap-2 items-center">
                <Avatar name={user.firstName} />
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>Not specified</TableCell>
              <TableCell>AKQA + Uncle Grey Aarhus, Denmark</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
