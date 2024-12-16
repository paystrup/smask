import {
  Bell,
  Calendar,
  ChevronsUpDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  PlusSquare,
  Settings,
  Sparkle,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
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
} from "../../ui/sidebar";
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
import { Separator } from "../../ui/separator";
import Avatar from "~/components/_feature/avatar/Avatar";

// Menu items.
const items = [
  {
    title: "Overview",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Suggestions",
    url: "/suggestions",
    icon: Sparkle,
  },
];

const adminItems = [
  {
    title: "Overview",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Suggestions",
    url: "/suggestions",
    icon: Sparkle,
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
  },
  {
    title: "All Meals",
    url: "/meals/all",
    icon: UtensilsCrossed,
  },
  {
    title: "Add Meal",
    url: "/meals/new",
    icon: PlusSquare,
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
            width="100%"
            height="20"
            viewBox="0 0 387 99"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32.328 98.176C12.488 98.176 0.072 89.088 0.072 74.24H20.424C20.424 79.872 25.288 83.584 32.84 83.584C38.472 83.584 42.44 81.152 42.44 77.184C42.44 72.448 36.808 71.68 29.896 71.04C17.992 69.888 0.456 68.864 0.456 50.56C0.456 36.608 12.872 27.904 31.688 27.904C49.992 27.904 63.56 36.48 63.56 50.048H42.312C42.184 45.44 37.832 42.368 31.688 42.368C26.312 42.368 22.472 44.8 22.472 48.384C22.472 53.376 30.28 53.632 39.112 54.656C51.144 55.936 66.248 58.88 66.248 74.496C66.248 89.216 53.32 98.176 32.328 98.176ZM92.543 96H68.607V29.952H92.415V40.576H93.823C97.663 33.152 104.575 28.288 112.895 28.288C121.343 28.288 129.279 33.408 132.479 40.96H133.759C137.215 33.152 144.383 28.416 153.855 28.416C167.679 28.416 177.663 38.784 177.663 54.016V96H153.599V59.392C153.599 53.376 150.015 48.64 144.127 48.384C138.367 48.384 134.655 52.864 134.655 59.392V96H110.591V59.392C110.591 52.736 107.007 48.384 101.631 48.384C95.999 48.384 92.543 52.736 92.543 59.392V96ZM200.395 97.536C187.339 97.536 178.379 90.624 178.379 78.592C178.379 65.792 188.747 59.008 210.379 56.064L221.899 54.656V51.712C221.899 46.848 218.699 43.52 213.195 43.52C207.947 43.52 204.235 46.848 204.235 52.48H181.067C181.067 37.76 193.739 28.288 213.451 28.288C233.035 28.288 245.963 37.76 245.963 52.608V96H221.899V88.192H220.619C216.907 94.336 208.971 97.536 200.395 97.536ZM209.739 83.072C216.907 83.072 221.899 78.08 221.899 71.296V67.328L211.275 68.864C204.235 69.76 201.419 72.448 201.419 76.288C201.419 80.384 204.491 83.072 209.739 83.072ZM279.753 98.176C259.913 98.176 247.497 89.088 247.497 74.24H267.849C267.849 79.872 272.713 83.584 280.265 83.584C285.897 83.584 289.865 81.152 289.865 77.184C289.865 72.448 284.233 71.68 277.321 71.04C265.417 69.888 247.881 68.864 247.881 50.56C247.881 36.608 260.297 27.904 279.113 27.904C297.417 27.904 310.985 36.48 310.985 50.048H289.737C289.609 45.44 285.257 42.368 279.113 42.368C273.737 42.368 269.897 44.8 269.897 48.384C269.897 53.376 277.705 53.632 286.537 54.656C298.569 55.936 313.673 58.88 313.673 74.496C313.673 89.216 300.745 98.176 279.753 98.176ZM339.968 96H316.032V0.511993H339.968V54.144H341.248L358.4 29.952H386.56L361.984 61.696L386.944 96H358.528L341.248 69.504H339.968V96Z"
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
                  {user.admin ? (
                    <>
                      {adminItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url}>
                              <item.icon />
                              <p>{item.title}</p>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </>
                  ) : (
                    <>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink to={item.url}>
                              <item.icon />
                              <p>{item.title}</p>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/users">
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
          <SidebarGroup className="px-4 mt-6 text-center text-sm">
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
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.firstName + " " + user.lastName}
                            className="h-8 w-8 object-cover rounded-full"
                          />
                        ) : (
                          <Avatar name={user.firstName} />
                        )}

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
                      <NavLink
                        to={item.url}
                        key={item.title}
                        className="w-full"
                      >
                        <DropdownMenuItem className="flex items-center gap-2 w-full cursor-pointer">
                          <item.icon />
                          {item.title}
                        </DropdownMenuItem>
                      </NavLink>
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
                  <NavLink to="/login" className="flex items-center gap-2">
                    <LogIn />
                    Login
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
