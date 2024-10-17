import { Form, useActionData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import mongoose from "mongoose";
import { AllergyType, Seasons } from "~/db/models";

export default function CreateMeal() {
  const actionData = useActionData();

  // Map through the enums to create select options
  const allergyOptions = Object.values(AllergyType).map((allergy) => ({
    label: allergy,
    value: allergy.toLowerCase(),
  }));

  const seasonOptions = Object.values(Seasons).map((season) => ({
    label: season,
    value: season.toLowerCase(),
  }));

  return (
    <section className="flex flex-col gap-8">
      <h1 className="mb-4 text-2xl font-bold">Create meal</h1>
      <Form method="post" className="flex flex-col gap-4">
        {/* Title Input */}
        <label htmlFor="title" className="mb-1 block font-semibold">
          Title
        </label>
        <input
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
          Description:
        </label>
        <textarea
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
          Tags (comma-separated):
        </label>
        <input
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

        {/* Allergy Select */}
        <label htmlFor="allergies" className="mb-1 block font-semibold">
          Allergies:
        </label>
        <select
          name="allergies"
          id="allergies"
          multiple
          defaultValue={[]}
          className={`border ${
            actionData?.errors?.allergies ? "border-red-500" : ""
          }`}
        >
          {allergyOptions.map((allergy) => (
            <option key={allergy.value} value={allergy.value}>
              {allergy.label}
            </option>
          ))}
        </select>
        {actionData?.errors?.allergies && (
          <p className="mt-1 text-red-500">{actionData.errors.allergies}</p>
        )}

        {/* Season Select */}
        <select
          name="seasons"
          id="seasons"
          multiple
          defaultValue={[]}
          className={`border ${actionData?.errors?.seasons ? "border-red-500" : ""}`}
        >
          {seasonOptions.map((season) => (
            <option key={season.value} value={season.value}>
              {season.label}
            </option>
          ))}
        </select>
        {actionData?.errors?.seasons && (
          <p className="mt-1 text-red-500">{actionData.errors.seasons}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="mt-3 rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
        >
          Save
        </button>
      </Form>
    </section>
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

  try {
    const newMeal = new mongoose.models.Meal({
      title: title,
      description: description,
      allergies: allergies,
      season: seasons,
      tags: tagIds, // Store tag ObjectIds in the Meal
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
