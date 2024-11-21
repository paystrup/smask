import {
  Bell,
  Calendar,
  ChevronsUpDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
  Settings,
  Sparkles,
  User,
  Users,
  Utensils,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import { Separator } from "./separator";
import Avatar from "~/_components/Avatar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "All Meals",
    url: "/meals/all",
    icon: Utensils,
  },
  {
    title: "Add Meal",
    url: "/meals/new",
    icon: PlusCircle,
  },
];

// User drop down items
const userItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const user = useLoaderData();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="mt-2">
          <svg
            width="auto"
            height="20"
            viewBox="0 0 332 94"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.75 0C39.25 0 46.25 2.79167 51.75 8.375C57.3333 13.9583 60.125 21.1667 60.125 30C60.2083 30 52.8333 30 38 30C38 24.3333 35.5833 21.4583 30.75 21.375C28.75 21.375 27.0417 21.875 25.625 22.875C24.2083 23.7917 23.5 25.3333 23.5 27.5C23.5 29.5 24.4167 31.25 26.25 32.75C28.1667 34.25 30.5 35.4167 33.25 36.25C36.0833 37.0833 39.125 38.2083 42.375 39.625C45.625 41.0417 48.6667 42.625 51.5 44.375C54.3333 46.125 56.6667 48.7917 58.5 52.375C60.4167 55.9583 61.375 60.2083 61.375 65.125C61.375 73.625 58.5417 80.5 52.875 85.75C47.125 90.9167 39.75 93.5 30.75 93.5C21.75 93.5 14.4167 90.625 8.75 84.875C3.08333 79.125 0.25 71.6667 0.25 62.5H22.625C22.5417 68.5 25.25 71.5 30.75 71.5C36.0833 71.5 38.7917 69.375 38.875 65.125C38.875 62.9583 37.5417 61.0833 34.875 59.5C32.2917 57.8333 29.1667 56.375 25.5 55.125C21.8333 53.875 18.1667 52.3333 14.5 50.5C10.8333 48.6667 7.70833 45.7917 5.125 41.875C2.54167 37.9583 1.25 33.1667 1.25 27.5C1.25 19.1667 3.95833 12.5 9.375 7.5C14.7917 2.5 21.9167 0 30.75 0Z"
              fill="black"
            />
            <path
              d="M93.04 73.75L85.79 50.625V92H63.29V1.625H85.79C85.79 1.54167 90.7067 16.1667 100.54 45.5L115.415 1.625C115.498 1.625 123.04 1.625 138.04 1.625V92H115.415V50.25L108.04 73.75H93.04Z"
              fill="black"
            />
            <path
              d="M175.25 31.75L170.25 57.25H180L175.25 31.75ZM187.75 92L184.5 76.75H166L162.5 92H140L163.25 1.625H187.375L210.25 92H187.75Z"
              fill="black"
            />
            <path
              d="M236.42 0C244.92 0 251.92 2.79167 257.42 8.375C263.003 13.9583 265.795 21.1667 265.795 30C265.878 30 258.503 30 243.67 30C243.67 24.3333 241.253 21.4583 236.42 21.375C234.42 21.375 232.712 21.875 231.295 22.875C229.878 23.7917 229.17 25.3333 229.17 27.5C229.17 29.5 230.087 31.25 231.92 32.75C233.837 34.25 236.17 35.4167 238.92 36.25C241.753 37.0833 244.795 38.2083 248.045 39.625C251.295 41.0417 254.337 42.625 257.17 44.375C260.003 46.125 262.337 48.7917 264.17 52.375C266.087 55.9583 267.045 60.2083 267.045 65.125C267.045 73.625 264.212 80.5 258.545 85.75C252.795 90.9167 245.42 93.5 236.42 93.5C227.42 93.5 220.087 90.625 214.42 84.875C208.753 79.125 205.92 71.6667 205.92 62.5H228.295C228.212 68.5 230.92 71.5 236.42 71.5C241.753 71.5 244.462 69.375 244.545 65.125C244.545 62.9583 243.212 61.0833 240.545 59.5C237.962 57.8333 234.837 56.375 231.17 55.125C227.503 53.875 223.837 52.3333 220.17 50.5C216.503 48.6667 213.378 45.7917 210.795 41.875C208.212 37.9583 206.92 33.1667 206.92 27.5C206.92 19.1667 209.628 12.5 215.045 7.5C220.462 2.5 227.587 0 236.42 0Z"
              fill="black"
            />
            <path
              d="M315.295 46.75C315.212 46.75 320.587 61.8333 331.42 92H306.92L295.67 57H290.92V92H268.42V1.625H290.92V37.375H295.67L306.92 1.625H331.42L315.295 46.75Z"
              fill="black"
            />
          </svg>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {user ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          style={({ isActive }) => {
                            return {
                              fontWeight: isActive ? "bold" : "",
                            };
                          }}
                        >
                          <item.icon />
                          <p>{item.title}</p>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/users"
                        style={({ isActive }) => {
                          return {
                            fontWeight: isActive ? "bold" : "",
                          };
                        }}
                      >
                        <Users />
                        <p>Users</p>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup className="px-4 mt-6 text-center">
            <p>
              You must login or create a user to access all features of Smask
            </p>
          </SidebarGroup>
        )}
      </SidebarContent>

      {user ? (
        <SidebarFooter>
          <Separator />
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <div className="flex items-center gap-2">
                        <Avatar name={user.firstName} />
                        <p>
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Sparkles />
                      Suggest a feature
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {userItems.map((item) => (
                      <DropdownMenuItem key={item.title}>
                        <Link
                          to={item.url}
                          className="flex items-center gap-2 w-full"
                        >
                          <item.icon />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Form action="/logout" method="post" className="w-full">
                      <button
                        aria-label="Log out"
                        className="flex gap-2 items-center w-full"
                      >
                        <LogOut />
                        Logout
                      </button>
                    </Form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      ) : (
        <SidebarFooter>
          <Separator />

          <SidebarMenu>
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/login" className="flex items-center gap-2">
                    <LogIn />
                    Login
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
