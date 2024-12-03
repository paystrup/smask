import { createCookieSessionStorage } from "@remix-run/node";
import { createToastUtilsWithCustomSession } from "remix-toast";

const session = createCookieSessionStorage({
  cookie: {
    name: "smask",
    secrets: ["some-secret"],
  },
});

export const {
  getToast,
  redirectWithToast,
  redirectWithSuccess,
  redirectWithError,
  redirectWithInfo,
  redirectWithWarning,
  dataWithSuccess,
  dataWithError,
  dataWithInfo,
  dataWithWarning,
} = createToastUtilsWithCustomSession(session);
