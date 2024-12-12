import { json } from "@remix-run/node";
import mongoose from "mongoose";
import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import Ribbon from "~/components/_foundation/Ribbon";
import { authenticator } from "~/services/auth.server";

export const meta = () => {
  return [
    { title: "SMASK | Notifications" },
    {
      property: "og:title",
      content: "SMASK | Notifications",
    },
    {
      name: "description",
      content: "Find your latest notifications",
    },
  ];
};

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData });
}

export default function notifications() {
  return (
    <Ribbon>
      <ContentWrapper>
        <div className="flex items-center justify-center w-full">
          <SimpleHeader
            title="Notifications will be coming soon..."
            description="Stay tuned for more feature updates coming 🔔"
          />
        </div>
      </ContentWrapper>
    </Ribbon>
  );
}
