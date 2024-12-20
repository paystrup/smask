import { useFetcher } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import mongoose from "mongoose";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import Ribbon from "~/components/_foundation/Ribbon";
import { Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { uploadImage } from "~/utils/server/uploadImage.server";
import { authenticator } from "~/services/auth.server";
import SimpleHeader from "~/components/_feature/SimpleHeader/SimpleHeader";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { openai } from "~/utils/server/openAi.server";
import {
  createMealDescriptionPrompt,
  createMealImagePrompt,
  createMealPrompt,
} from "~/utils/prompts/createMealPrompt";
import { AnimatePresence, motion } from "motion/react";
import { easeInOut } from "motion";
import { sanitizeInputs } from "~/utils/client/simpleSanitization";
import fetch from "node-fetch";
import { base64ToFile } from "~/utils/server/encodeImageUrl.server";
import {
  AllergyType,
  generatorStringMaxLength,
  mealDescriptionMaxLength,
  Seasons,
} from "~/db/constants";

export const meta = () => {
  return [
    { title: "SMASK | Add new meal" },
    {
      property: "og:title",
      content: "SMASK | Add new meal",
    },
    {
      name: "description",
      content: "Add a new meal or generate one with AI for your SMASK library.",
    },
  ];
};

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!user.admin) {
    return redirect("/");
  }

  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData });
}

export default function CreateMeal() {
  const fetcher = useFetcher();
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [image, setImage] = useState(null);
  const [generatedDescription, setGeneratedDescription] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const emojis = ["🍳", "🥘", "🍲", "🥗", "🍝", "🍔", "🍕", "🍣", "🍱", "🍰"];
  const isSubmitting = fetcher.state === "submitting";
  const isGenerating =
    isSubmitting && fetcher.formData?.get("action") === "generateMeal";
  const isSaving =
    isSubmitting && fetcher.formData?.get("action") === "saveMeal";
  const isGeneratingImage =
    isSubmitting && fetcher.formData?.get("action") === "generateImage";
  const isGeneratingDescription =
    isSubmitting && fetcher.formData?.get("action") === "generateDescription";

  useEffect(() => {
    if (fetcher.data?.meal) {
      setSelectedAllergies(fetcher.data.meal.allergies || []);
      setSelectedSeasons(fetcher.data.meal.seasons || []);
      setGeneratedMeal(fetcher.data.meal);
      // Force re-render of the form
      setFormKey((prevKey) => prevKey + 1);
    }
    if (fetcher.data?.generatedImage) {
      setImage(fetcher.data.generatedImage);
    }
    if (fetcher.data?.generatedDescription) {
      setGeneratedDescription(fetcher.data.generatedDescription);
    }
  }, [fetcher.data]);

  useEffect(() => {
    let interval;
    if (isGeneratingImage) {
      interval = setInterval(() => {
        setCurrentEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isGeneratingImage]);

  const allergyOptions = Object.values(AllergyType).map((allergy) => ({
    label: allergy,
    value: allergy.toLowerCase(),
  }));

  const seasonOptions = Object.values(Seasons).map((season) => ({
    label: season,
    value: season.toLowerCase(),
  }));

  const handleAllergyToggle = (value) => {
    setSelectedAllergies((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSeasonToggle = (value) => {
    setSelectedSeasons((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file.size < 1000000) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result); // Set the image state
      };
      reader.readAsDataURL(file);
    } else {
      alert("Image size must be less than 1MB.");
      event.target.value = "";
    }
  };

  return (
    <Ribbon>
      <div className="flex flex-col items-center justify-center max-w-3xl w-full px-4 overflow-hidden">
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
              title="Add a new meal"
              description="Create a new meal and add it to your library, or use our AI features to generate it for you"
            />
          </motion.div>
        </AnimatePresence>

        {showGenerator ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: easeInOut }}
              className="w-full"
            >
              <fetcher.Form className="w-full mb-12" method="post">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="mealPrompt" className="mb-1 block">
                      What should the meal be inspired by?
                    </label>
                    <Badge variant="primary" className="mb-2 text-xs">
                      ✨ AI
                    </Badge>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-2">
                    <Input
                      type="text"
                      name="mealPrompt"
                      id="mealPrompt"
                      maxLength={generatorStringMaxLength}
                      placeholder="Enter a prompt for meal inspiration"
                      defaultValue={""}
                      className={`border ${
                        fetcher.data?.errors?.mealPrompt ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="submit"
                      name="action"
                      value="generateMeal"
                      aria-label="Generate meal"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : generatedMeal ? (
                        "Generate again?"
                      ) : (
                        "Generate"
                      )}
                    </Button>
                  </div>
                  {fetcher.data?.errors?.mealPrompt && (
                    <p className="mt-1 text-red-500 text-sm">
                      {fetcher.data.errors.mealPrompt}
                    </p>
                  )}
                </div>
              </fetcher.Form>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex items-center justify-center"
            aria-label="Show generator input field"
          >
            <Button onClick={() => setShowGenerator(true)} className="mb-12">
              ✨ Generate meal with AI
            </Button>
          </motion.div>
        )}

        {generatedMeal && !isGenerating && (
          <div className="w-full flex items-center justify-center">
            <p className="mb-4 text-center text-lg tracking-tight">
              🪄 Generated meal
            </p>
          </div>
        )}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 19 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: easeInOut,
            }}
          >
            {isGenerating ? (
              <div className="w-full flex flex-col gap-4 items-center justify-center my-12">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-base opacity-70 text-black text-center max-w-[20ch] animate-pulse">
                  Please wait while we are cooking your meal 🪄🔥
                </p>
              </div>
            ) : (
              <Card className="max-w-3xl pt-6" key={formKey}>
                <CardContent>
                  <fetcher.Form
                    method="post"
                    encType="multipart/form-data"
                    className="flex flex-col gap-2"
                  >
                    <fieldset className="flex flex-col gap-6">
                      <div>
                        <label htmlFor="title" className="mb-1 block">
                          Title*
                        </label>
                        <Input
                          type="text"
                          name="title"
                          id="title"
                          placeholder="Title"
                          defaultValue={generatedMeal?.title || ""}
                          className={`border ${
                            fetcher.data?.errors?.title ? "border-red-500" : ""
                          }`}
                        />
                        {fetcher.data?.errors?.title && (
                          <p className="mt-1 text-red-500 text-sm">
                            {fetcher.data.errors.title}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <label htmlFor="description" className="mb-1 block">
                            Description*
                          </label>
                          <Button
                            type="submit"
                            name="action"
                            value="generateDescription"
                            size="sm"
                            disabled={isGeneratingDescription}
                            className="mb-2"
                          >
                            {isGeneratingDescription ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : generatedDescription ? (
                              "Generate again?"
                            ) : (
                              "🪄 Generate"
                            )}
                          </Button>
                        </div>
                        <Textarea
                          name="description"
                          id="description"
                          placeholder="Description"
                          defaultValue={
                            generatedMeal?.description ||
                            generatedDescription ||
                            ""
                          }
                          maxLength={mealDescriptionMaxLength}
                          disabled={isGeneratingDescription}
                          className={`border ${
                            fetcher.data?.errors?.description
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {fetcher.data?.errors?.description && (
                          <p className="mt-1 text-red-500 text-sm">
                            {fetcher.data.errors.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="tags" className="mb-1 block">
                          Tags (comma-separated)
                        </label>
                        <Input
                          type="text"
                          name="tags"
                          id="tags"
                          placeholder="e.g. spicy,vegan"
                          defaultValue={generatedMeal?.tags?.join(", ") || ""}
                          className={`border ${
                            fetcher.data?.errors?.tags ? "border-red-500" : ""
                          }`}
                        />
                        {fetcher.data?.errors?.tags && (
                          <p className="mt-1 text-red-500 text-sm">
                            {fetcher.data.errors.tags}
                          </p>
                        )}
                      </div>
                    </fieldset>

                    <fieldset className="mt-8">
                      <legend className="mb-2 block">Allergies</legend>
                      <div className="flex flex-wrap gap-2">
                        {allergyOptions.map((allergy) => (
                          <Badge
                            key={allergy.value}
                            variant={
                              selectedAllergies.includes(allergy.value)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer w-fit"
                            onClick={() => handleAllergyToggle(allergy.value)}
                          >
                            <Input
                              type="checkbox"
                              name="allergies"
                              value={allergy.value}
                              checked={selectedAllergies.includes(
                                allergy.value,
                              )}
                              onChange={() => {}}
                              className="sr-only w-fit"
                            />
                            {allergy.label}
                            {selectedAllergies.includes(allergy.value) && (
                              <X className="ml-1 h-3 w-3" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </fieldset>
                    {fetcher.data?.errors?.allergies && (
                      <p className="mt-1 text-red-500 text-sm">
                        {fetcher.data.errors.allergies}
                      </p>
                    )}
                    <fieldset className="mt-8">
                      <legend className="mb-2 block">Seasons</legend>
                      <div className="flex flex-wrap gap-2">
                        {seasonOptions.map((season) => (
                          <Badge
                            key={season.value}
                            variant={
                              selectedSeasons.includes(season.value)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer w-fit"
                            onClick={() => handleSeasonToggle(season.value)}
                          >
                            <Input
                              type="checkbox"
                              name="seasons"
                              value={season.value}
                              checked={selectedSeasons.includes(season.value)}
                              onChange={() => {}}
                              className="sr-only w-fit"
                            />
                            {season.label}
                            {selectedSeasons.includes(season.value) && (
                              <X className="ml-1 h-3 w-3" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </fieldset>
                    {fetcher.data?.errors?.seasons && (
                      <p className="mt-1 text-red-500">
                        {fetcher.data.errors.seasons}
                      </p>
                    )}

                    <div className="mt-6 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="image" className="mb-1 block">
                          Image
                        </label>
                        <Button
                          type="submit"
                          name="action"
                          value="generateImage"
                          size="sm"
                          disabled={isGeneratingImage}
                        >
                          {isGeneratingImage ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : image ? (
                            "Generate again?"
                          ) : (
                            "🪄 Generate"
                          )}
                        </Button>
                      </div>
                      {!isGeneratingImage && (
                        <>
                          {/* Hidden input to store the base64 image */}
                          <input
                            type="hidden"
                            name="generatedImage"
                            value={image || ""}
                          />
                          <Input
                            type="file"
                            name="image"
                            id="image"
                            onChange={handleImageChange}
                          />
                        </>
                      )}

                      {isGeneratingImage && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <motion.div
                            key={currentEmojiIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl"
                          >
                            {emojis[currentEmojiIndex]}
                          </motion.div>
                          <p className="max-w-[25ch] text-center text-sm opacity-70 animate-pulse mt-4">
                            Please wait while we are painting your image
                          </p>
                        </div>
                      )}
                      <div className="flex w-full items-center justify-center">
                        {image && (
                          <div className="relative">
                            <img
                              src={image}
                              alt="Selected or Generated"
                              className="mt-4 h-48 w-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setImage(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {fetcher.data?.errors?.image && (
                        <p className="mt-1 text-red-500 text-sm">
                          {fetcher.data.errors.image}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      name="action"
                      value="saveMeal"
                      disabled={
                        isSaving || isGeneratingImage || isGeneratingDescription
                      }
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Add meal"
                      )}
                    </Button>
                  </fetcher.Form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Ribbon>
  );
}

export async function action({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (!user.admin) {
    console.error("User is not an admin");
    return redirect("/");
  }

  const form = await request.formData();
  const { title, description, tags, mealPrompt, action } =
    Object.fromEntries(form);

  const allergies = form.getAll("allergies");
  const seasons = form.getAll("seasons");

  // Check all inputs for sanitization
  const { sanitizedInputs, errors } = sanitizeInputs({
    title,
    description,
    tags,
    mealPrompt,
  });

  // If there are any sanitization errors, return them immediately
  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  // Use sanitized inputs from here on
  const {
    title: sanitizedTitle,
    description: sanitizedDescription,
    tags: sanitizedTags,
    mealPrompt: sanitizedMealPrompt,
  } = sanitizedInputs;

  if (action === "generateMeal") {
    if (!sanitizedMealPrompt) {
      return json(
        { errors: { mealPrompt: "Please enter a meal prompt" } },
        { status: 400 },
      );
    }

    if (sanitizedMealPrompt.length > generatorStringMaxLength) {
      return json(
        {
          errors: {
            mealPrompt: `Meal prompt must be less than ${generatorStringMaxLength} characters`,
          },
        },
        { status: 400 },
      );
    }

    try {
      const chatGptResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful professional chef working on a new menu for your restaurant",
          },
          {
            role: "user",
            content: createMealPrompt(sanitizedMealPrompt),
          },
        ],
      });

      const mealData = chatGptResponse.choices[0].message.content.trim();
      const formattedMeal = JSON.parse(mealData);

      return json({ meal: formattedMeal, generated: true });
    } catch (error) {
      console.error(error);
      return json({ error: "Error generating meal data." }, { status: 500 });
    }
  }

  if (action === "saveMeal") {
    const tagArray = sanitizedTags
      ? sanitizedTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const tagIds = await Promise.all(
      tagArray.map(async (tagName) => {
        let tag = await mongoose.models.Tag.findOne({ name: tagName });

        if (!tag) {
          tag = new mongoose.models.Tag({ name: tagName });
          await tag.save();
        }

        return tag._id;
      }),
    );

    const image = form.get("generatedImage");
    let imageUrl = null;

    if (image) {
      // Check if the image is already a File
      if (image instanceof File && image.size > 0) {
        imageUrl = await uploadImage(image); // Upload the file directly
      } else if (typeof image === "string") {
        // If it's a base64 string, convert it to a File
        const base64File = base64ToFile(image, `title-${Date.now()}.png`);
        imageUrl = await uploadImage(base64File); // Upload the converted file
      }
    }

    try {
      const newMeal = new mongoose.models.Meal({
        title: sanitizedTitle,
        description: sanitizedDescription,
        allergies: allergies,
        seasons: seasons,
        tags: tagIds,
        image: imageUrl || undefined,
        location: user.location,
      });
      await newMeal.save();
      return redirect(`/meals/${newMeal._id}`);
    } catch (error) {
      console.error(error);
      const errors = {};
      if (error.errors) {
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        });
      }
      return json({ errors: errors }, { status: 400 });
    }
  }

  if (action === "generateImage") {
    try {
      if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
        return json(
          { errors: { title: "Title is required" } },
          { status: 400 },
        );
      }

      const dalleImage = await openai.images.generate({
        model: "dall-e-3",
        prompt: createMealImagePrompt(sanitizedTitle),
      });

      const imageUrl = dalleImage.data[0].url;

      // Fetch the image file from the generated URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }

      // Convert the image to Buffer (Base64)
      const imageBuffer = await imageResponse.buffer();
      const generatedImage = imageBuffer.toString("base64");

      return json({
        generatedImage: `data:image/png;base64,${generatedImage}`,
      });
    } catch (error) {
      console.error(error);
      return json(
        { errors: { image: "Error generating meal image" } },
        { status: 500 },
      );
    }
  }

  if (action === "generateDescription") {
    if (!sanitizedTitle || sanitizedTitle.trim().length === 0) {
      return json(
        { errors: { title: "Please enter a title" } },
        { status: 400 },
      );
    }

    try {
      const chatGptResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful professional chef working on a new menu for your restaurant",
          },
          {
            role: "user",
            content: createMealDescriptionPrompt(sanitizedTitle),
          },
        ],
      });

      const generatedDescription =
        chatGptResponse.choices[0].message.content.trim();

      return json({
        generatedDescription: generatedDescription,
      });
    } catch (error) {
      console.error(error);
      return json(
        { error: "Error generating meal description." },
        { status: 500 },
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}
