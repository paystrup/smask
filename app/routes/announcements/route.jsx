import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import Ribbon from "~/components/_foundation/Ribbon";

export default function Announcements() {
  return (
    <Ribbon>
      <ContentWrapper>
        <div className="flex items-center justify-center w-full">
          <SimpleHeader
            title="Announcements will be coming soon..."
            description="Stay tuned for more feature updates coming 🔔"
          />
        </div>
      </ContentWrapper>
    </Ribbon>
  );
}
