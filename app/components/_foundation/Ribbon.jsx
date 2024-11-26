import { cn } from "~/lib/utils";

const Ribbon = ({ children, className }) => {
  return (
    <section className={cn("py-14 px-4 sm:px-6 lg:px-8 mx-auto", className)}>
      {children}
    </section>
  );
};

export default Ribbon;