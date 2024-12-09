import { cn } from "~/lib/utils";

const Ribbon = ({ children, className }) => {
  return (
    <section
      className={cn(
        "flex flex-col justify-center items-center py-14 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-screen-contentWrapperXL",
        className,
      )}
    >
      {children}
    </section>
  );
};

export default Ribbon;
