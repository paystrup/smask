import {
  Form,
  Link,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import mongoose from "mongoose";
import ErrorMessage from "~/components/_foundation/errorhandling/ErrorMessage";
import { Diets } from "~/db/models";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { sendintroMail } from "~/utils/server/nodeMailer.server";
import { authenticator } from "~/services/auth.server";
import Stepper from "~/components/_feature/Stepper/Stepper";
import { Card, CardFooter } from "~/components/ui/card";
import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import LoadingButton from "~/components/_foundation/pending/LoadingButton";

export async function loader({ params, request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const locationId = params.locationId;

  // Validate that the locationId is provided
  if (!locationId) {
    return redirect("/signup/location");
  }

  try {
    // Check if the location exists in the database
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      throw new Error("Invalid ObjectId format");
    }

    const objectId = new mongoose.Types.ObjectId(locationId);
    const locationExists = await mongoose.models.Location.findById(objectId);

    if (!locationExists) {
      return redirect("/signup/location");
    }

    return json(locationId);
  } catch (error) {
    console.error("Error loading location:", error.message);
    return redirect("/signup/location");
  }
}

export default function SignUpPage() {
  const navigation = useNavigation();
  const locationId = useLoaderData();
  const actionData = useActionData();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    location: locationId,
    email: "",
    firstName: "",
    lastName: "",
    birthday: "",
    password: "",
    confirmPassword: "",
    diet: "",
    favoriteMeal: "",
  });

  useEffect(() => {
    if (actionData?.step) {
      setStep(actionData.step);
      setErrors(actionData.fieldErrors || {});
    }
  }, [actionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for the field
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, diet: value }));
    setErrors((prev) => ({ ...prev, diet: "" }));
  };

  const validateStep = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const nameRegex = /^[a-zA-Z]{2,}$/;

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = "Email is required.";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "Password must be at least 8 characters long and contain at least one letter and one number.";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    } else if (step === 2) {
      if (!formData.firstName) {
        newErrors.firstName = "First Name is required.";
      } else if (!nameRegex.test(formData.firstName)) {
        newErrors.firstName =
          "First Name must be at least 2 characters long and contain only letters.";
      }

      if (!formData.lastName) {
        newErrors.lastName = "Last Name is required.";
      } else if (!nameRegex.test(formData.lastName)) {
        newErrors.lastName =
          "Last Name must be at least 2 characters long and contain only letters.";
      }

      if (!formData.birthday) {
        newErrors.birthday = "Birthday is required.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <section className="grid grid-cols-12 h-full pt-12 px-4 lg:px-0 lg:pt-0">
      <section className="hidden lg:flex lg:flex-col lg:gap-8 col-span-6 bg-primary-blue h-full p-12 items-center justify-center">
        <h2 className="text-white text-lg tracking-tighter max-w-[40ch] text-center opacity-40">
          What is better than gathering over a great meal? <b>Smask.</b> We help
          you doing just that - but with ease.
        </h2>
      </section>

      <section className="flex flex-col items-center lg:px-8 2xl:px-0 col-span-12 lg:col-span-6 lg:h-full">
        <div className="flex flex-col items-center justify-center gap-4 max-w-xl w-full lg:h-full lg:pb-14">
          <SimpleHeader
            title="Sign up to use Smask"
            description="We just need to know a couple of things about you to get started"
          />

          <Stepper maxSteps={3} currentStep={step} />

          <Card className="w-full mt-8 p-6">
            <Form method="post" className="flex flex-col w-full gap-4">
              <input type="hidden" name="location" value={locationId} />
              <input type="hidden" name="email" value={formData.email} />
              <input
                type="hidden"
                name="firstName"
                value={formData.firstName}
              />
              <input type="hidden" name="lastName" value={formData.lastName} />
              <input type="hidden" name="birthday" value={formData.birthday} />
              <input type="hidden" name="password" value={formData.password} />
              <input type="hidden" name="diet" value={formData.diet} />

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="email">Email*</label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your email"
                        required
                      />
                      {actionData?.errors?.email && (
                        <p className="mt-1 mb-0 text-red-500">
                          {actionData.errors.email.message}
                        </p>
                      )}

                      {errors.email && (
                        <p className="mt-1 mb-0 text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="password">Password*</label>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Your password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      {actionData?.errors?.password && (
                        <p className="mt-1 mb-0 text-red-500">
                          {actionData.errors.password.message}
                        </p>
                      )}
                      {errors.password && (
                        <p className="mt-1 mb-0 text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="confirmPassword">Confirm Password*</label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 mb-0 text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 w-full">
                    <div className="flex flex-col gap-1 w-full">
                      <label htmlFor="firstName">First Name*</label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Your first name"
                        required
                      />
                      {actionData?.errors?.firstName && (
                        <p className="mt-1 mb-0 text-red-500">
                          {actionData.errors.firstName.message}
                        </p>
                      )}
                      {errors.firstName && (
                        <p className="mt-1 mb-0 text-red-500">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <label htmlFor="lastName">Last Name*</label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Your last name"
                        required
                      />
                      {actionData?.errors?.lastName && (
                        <p className="mt-1 mb-0 text-red-500">
                          {actionData.errors.lastName.message}
                        </p>
                      )}
                      {errors.lastName && (
                        <p className="mt-1 mb-0 text-red-500">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="birthday">Birthday*</label>
                    <Input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleChange}
                      required
                      className="flex justify-between w-full"
                    />
                    {actionData?.errors?.birthday && (
                      <p className="mt-1 mb-0 text-red-500">
                        {actionData.errors.birthday.message}
                      </p>
                    )}
                    {errors.birthday && (
                      <p className="mt-1 mb-0 text-red-500">
                        {errors.birthday}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mt-8">
                    <label htmlFor="diet">Your diet preferences</label>
                    <Select
                      id="diet"
                      name="diet"
                      value={formData.diet}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Diets).map((diet) => (
                            <SelectItem key={diet} value={diet}>
                              {diet.charAt(0).toUpperCase() + diet.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {actionData?.errors?.diet && (
                      <p className="mt-1 mb-0 text-red-500">
                        {actionData.errors.diet.message}
                      </p>
                    )}
                    {errors.diet && (
                      <p className="mt-1 mb-0 text-red-500">{errors.diet}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="mb-8">
                      Let us say the chef wants to suprise you on your birthday.
                      What do you want to eat?
                    </p>
                    <label htmlFor="favoriteMeal">Favorite meal</label>
                    <Input
                      id="favoriteMeal"
                      name="favoriteMeal"
                      value={formData.favoriteMeal}
                      onChange={handleChange}
                      placeholder="Your favorite meal"
                    />
                    {actionData?.errors?.favoriteMeal && (
                      <p className="mt-1 mb-0 text-red-500">
                        {actionData.errors.favoriteMeal.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 -mb-4">
                {step === 3 &&
                  (navigation.state === "submitting" ? (
                    <LoadingButton />
                  ) : (
                    <Button type="submit">Sign Up</Button>
                  ))}
              </div>
            </Form>

            <CardFooter className="flex flex-col w-full p-0 mt-6">
              <div className="flex flex-col gap-2 w-full">
                {step < 3 && (
                  <Button type="button" className="w-full" onClick={nextStep}>
                    Next
                  </Button>
                )}

                {step > 1 && (
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                )}
              </div>

              <Link
                to="/login"
                className="hover:opacity-60 transition-all mt-2"
              >
                Already have an account? <u>Go to login.</u>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
    </section>
  );
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const {
    location,
    email,
    firstName,
    lastName,
    password,
    birthday,
    diet,
    favoriteMeal,
  } = Object.fromEntries(form);

  try {
    const emailExists = await mongoose.models.User.findOne({ email });

    if (emailExists) {
      return json(
        { fieldErrors: { email: "Email already exists." }, step: 1 },
        { status: 400 },
      );
    }

    const locationExists = await mongoose.models.Location.findById(location);

    if (!locationExists) {
      return json(
        { fieldErrors: { location: "Invalid location." }, step: 1 },
        { status: 400 },
      );
    }

    const newUser = new mongoose.models.User({
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
      diet: diet,
      location: locationExists._id,
      favoriteMeal: favoriteMeal,
    });

    await newUser.save();
    await sendintroMail(newUser.email, newUser.firstName);
    return redirect("/");
  } catch (error) {
    console.log(error);
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
      { status: 400 },
    );
  }
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorMessage
        title={error.status + " " + error.statusText}
        message={error.data}
      />
    );
  } else if (error instanceof Error) {
    return <ErrorMessage title={error.message} message={error.stack} />;
  } else {
    return <ErrorMessage title="Unknown Error" />;
  }
}
