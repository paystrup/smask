import { easeInOut } from "motion";
import { AnimatePresence, motion } from "motion/react";
import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import Ribbon from "~/components/_foundation/Ribbon";

export const meta = () => {
  return [
    { title: "SMASK | Suggestions" },
    {
      property: "og:title",
      content: "SMASK | Suggestions",
    },
    {
      name: "description",
      content: "Add suggestions for the canteen",
    },
  ];
};

export default function Suggestions() {
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
              title="Suggestions will be coming soon..."
              description="Stay tuned for more feature updates coming 🔔"
            />
          </motion.div>
        </AnimatePresence>
      </ContentWrapper>
    </Ribbon>
  );
}
