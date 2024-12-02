import { format } from "date-fns";

export const formatISODate = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
};

export const formatDateWithDateFns = (dateString) => {
  const date = new Date(dateString);
  return format(date, "yyyy-MM-dd");
};
