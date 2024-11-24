import { Form, useActionData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import mongoose from "mongoose";
import { AllergyType, Seasons } from "~/db/models";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import ContentWrapper from "~/components/_foundation/ContentWrapper";
import Ribbon from "~/components/_foundation/Ribbon";
import { X } from "lucide-react";
import { useState } from "react";
import { uploadImage } from "~/utils/server/uploadImage.server";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userData = await mongoose.models.User.findById(user._id);
  return json({ user, userData });
}

export default function CreateMeal() {
  const actionData = useActionData();
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [image, setImage] = useState(null);

  // Map through the enums to create options
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
    if (file.size < 500000) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Image size must be less than 0.5MB.");
      event.target.value = "";
    }
  };

  return (
    <Ribbon className="flex flex-col gap-8 max-w-full">
      <ContentWrapper>
        <h1 className="mb-4 text-2xl font-bold">Add new meal</h1>
        <Form
          method="post"
          encType="multipart/form-data"
          className="flex flex-col gap-4"
        >
          {/* Title Input */}
          <label htmlFor="title" className="mb-1 block font-semibold">
            Title
          </label>
          <Input
            type="text"
            name="title"
            id="title"
            placeholder="Title"
            defaultValue={""}
            className={`border ${
              actionData?.errors?.title ? "border-red-500" : ""
            }`}
          />
          {actionData?.errors?.title && (
            <p className="mt-1 text-red-500">{actionData.errors.title}</p>
          )}

          {/* Description Input */}
          <label htmlFor="description" className="mb-1 block font-semibold">
            Description
          </label>
          <Textarea
            name="description"
            id="description"
            placeholder="Description"
            defaultValue={""}
            className={`border ${
              actionData?.errors?.description ? "border-red-500" : ""
            }`}
          />
          {actionData?.errors?.description && (
            <p className="mt-1 text-red-500">{actionData.errors.description}</p>
          )}

          {/* Tags Input */}
          <label htmlFor="tags" className="mb-1 block font-semibold">
            Tags (comma-separated)
          </label>
          <Input
            type="text"
            name="tags"
            id="tags"
            placeholder="e.g. spicy,vegan"
            defaultValue={""}
            className={`border ${
              actionData?.errors?.tags ? "border-red-500" : ""
            }`}
          />
          {actionData?.errors?.tags && (
            <p className="mt-1 text-red-500">{actionData.errors.tags}</p>
          )}

          {/* Allergy Badges */}
          <fieldset>
            <legend className="mb-1 block font-semibold">Allergies</legend>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map((allergy) => (
                <Badge
                  key={allergy.value}
                  variant={
                    selectedAllergies.includes(allergy.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleAllergyToggle(allergy.value)}
                >
                  <Input
                    type="checkbox"
                    name="allergies"
                    value={allergy.value}
                    checked={selectedAllergies.includes(allergy.value)}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  {allergy.label}
                  {selectedAllergies.includes(allergy.value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </fieldset>
          {actionData?.errors?.allergies && (
            <p className="mt-1 text-red-500">{actionData.errors.allergies}</p>
          )}

          {/* Season Badges */}
          <fieldset>
            <legend className="mb-1 block font-semibold">Seasons</legend>
            <div className="flex flex-wrap gap-2">
              {seasonOptions.map((season) => (
                <Badge
                  key={season.value}
                  variant={
                    selectedSeasons.includes(season.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleSeasonToggle(season.value)}
                >
                  <Input
                    type="checkbox"
                    name="seasons"
                    value={season.value}
                    checked={selectedSeasons.includes(season.value)}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  {season.label}
                  {selectedSeasons.includes(season.value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </fieldset>
          {actionData?.errors?.seasons && (
            <p className="mt-1 text-red-500">{actionData.errors.seasons}</p>
          )}

          {/* Image Upload */}
          <label htmlFor="image" className="mb-1 block font-semibold">
            Upload Image
          </label>
          <Input
            type="file"
            name="image"
            id="image"
            onChange={handleImageChange}
          />
          {image && (
            <img
              src={image}
              alt="Selected"
              className="mt-4 h-48 w-48 object-cover rounded-lg"
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="mt-3 rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
          >
            Add Meal
          </button>
        </Form>
      </ContentWrapper>
    </Ribbon>
  );
}

export async function action({ request }) {
  const form = await request.formData();
  const { title, description, tags } = Object.fromEntries(form);

  const allergies = form.getAll("allergies"); // Get all selected allergies
  const seasons = form.getAll("seasons"); // Get all selected seasons

  // Parse the comma-separated tags string into an array and trim whitespace
  const tagArray = tags
    ? tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const tagIds = await Promise.all(
    tagArray.map(async (tagName) => {
      // Try to find the tag by name
      let tag = await mongoose.models.Tag.findOne({ name: tagName });

      // If the tag doesn't exist, create it
      if (!tag) {
        tag = new mongoose.models.Tag({ name: tagName });
        await tag.save();
      }

      // Return the ObjectId of the tag
      return tag._id;
    }),
  );

  // Handle image upload
  const image = form.get("image");
  let imageUrl = null;
  if (image && image.size > 0) {
    imageUrl = await uploadImage(image); // Assuming uploadImage returns the URL or path of the uploaded image
  }

  try {
    const newMeal = new mongoose.models.Meal({
      title: title,
      description: description,
      allergies: allergies,
      seasons: seasons,
      tags: tagIds, // Store tag ObjectIds in the Meal
      image: imageUrl || null,
    });
    await newMeal.save();
    return redirect(`/meals/${newMeal._id}`);
  } catch (error) {
    console.log(error);
    // Extract error messages from the Mongoose error object
    const errors = {};
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message; // Get the message for each error field
      });
    }
    return json(
      { errors: errors, values: Object.fromEntries(form) },
      { status: 400 },
    );
  }
}
