import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import Ribbon from "~/components/_foundation/Ribbon";
import { AnimatePresence, motion } from "motion/react";
import { easeInOut } from "motion";

export const meta = () => {
  return [
    { title: "SMASK | Announcements" },
    {
      property: "og:title",
      content: "SMASK | Announcements",
    },
    {
      name: "description",
      content: "The latest announcements. Manage your announcements here.",
    },
  ];
};

export default function Announcements() {
  return (
    <Ribbon>
      <ContentWrapper>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: easeInOut,
            }}
          >
            <SimpleHeader
              title="Announcements will be coming soon..."
              description="Stay tuned for more feature updates coming 🔔"
            />
          </motion.div>
        </AnimatePresence>
      </ContentWrapper>
    </Ribbon>
  );
}
