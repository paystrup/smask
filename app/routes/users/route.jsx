import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useCallback, useState } from "react";
import Avatar from "~/components/_feature/avatar/Avatar";
import { SortableTableHeader } from "~/components/_feature/SortableTableHeader/SortableTableHeader";
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
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const sortedUsers = useCallback(() => {
    let sortableUsers = [...users];
    if (sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        if (sortConfig.key === "location.name") {
          return sortConfig.direction === "ascending"
            ? a.location.name.localeCompare(b.location.name)
            : b.location.name.localeCompare(a.location.name);
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="text-center my-8 flex flex-col gap-2 items-center justify-center">
        <h1 className="text-4xl font-semibold tracking-tight">All users</h1>
        <p className="text-md">A list of all users in your current workspace</p>

        {userData.location.name && (
          <div className="flex gap-2 mt-6">
            <Badge className="text-sm w-fit" variant="primary">
              {userData.location.name}
            </Badge>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>
            A list of all users in your workspace. Total users: {users.length}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <SortableTableHeader
                label="Name"
                sortKey="firstName"
                currentSort={sortConfig}
                onSort={requestSort}
              />
              <SortableTableHeader
                label="Email"
                sortKey="email"
                currentSort={sortConfig}
                onSort={requestSort}
                className="hidden sm:table-cell"
              />
              <SortableTableHeader
                label="Created at"
                sortKey="createdAt"
                currentSort={sortConfig}
                onSort={requestSort}
                className="hidden md:table-cell"
              />
              <SortableTableHeader
                label="User type"
                sortKey="admin"
                currentSort={sortConfig}
                onSort={requestSort}
                className="hidden lg:table-cell"
              />
              <SortableTableHeader
                label="Workspace"
                sortKey="location.name"
                currentSort={sortConfig}
                onSort={requestSort}
                className="hidden xl:table-cell"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers().map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Link
                    to={`/user/${user._id}`}
                    className="font-medium flex gap-2 items-center"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.firstName + " " + user.lastName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar name={user.firstName} />
                    )}
                    <span className="hidden sm:inline">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="sm:hidden">{user.firstName}</span>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {user.email}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {user.admin ? "Admin" : "Not specified"}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {user.location.name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
