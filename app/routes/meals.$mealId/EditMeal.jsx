import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "@remix-run/react";
import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DialogClose, DialogContent } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { AllergyType, Seasons } from "~/db/constants";

export default function EditMeal({ actionData, meal, onSubmit }) {
  const [selectedAllergies, setSelectedAllergies] = useState(meal.allergies);
  const [selectedSeasons, setSelectedSeasons] = useState(meal.seasons);
  const [image, setImage] = useState(meal.image);

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
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Image size must be less than 1MB.");
      event.target.value = "";
    }
  };

  return (
    <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen py-12">
      <DialogTitle className="text-2xl font-semibold tracking-tight mb-6 text-center">
        Edit meal
      </DialogTitle>
      <Form
        method="post"
        encType="multipart/form-data"
        className="flex flex-col gap-2"
        onSubmit={onSubmit}
      >
        <fieldset className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="mb-1 block">
              Title
            </label>
            <Input
              type="text"
              name="title"
              id="title"
              placeholder="Title"
              defaultValue={meal.title}
              className={`border ${
                actionData?.errors?.title ? "border-red-500" : ""
              }`}
            />
            {actionData?.errors?.title && (
              <p className="mt-1 text-red-500">{actionData.errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block">
              Description
            </label>
            <Textarea
              name="description"
              id="description"
              placeholder="Description"
              defaultValue={meal.description}
              className={`border ${
                actionData?.errors?.description ? "border-red-500" : ""
              }`}
            />
            {actionData?.errors?.description && (
              <p className="mt-1 text-red-500">
                {actionData.errors.description}
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
              defaultValue={meal.tags.map((tag) => tag.name).join(",")}
              className={`border ${
                actionData?.errors?.tags ? "border-red-500" : ""
              }`}
            />
            {actionData?.errors?.tags && (
              <p className="mt-1 text-red-500">{actionData.errors.tags}</p>
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
                  checked={selectedAllergies.includes(allergy.value)}
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
        {actionData?.errors?.allergies && (
          <p className="mt-1 text-red-500">{actionData.errors.allergies}</p>
        )}

        <fieldset className="mt-8">
          <legend className="mb-2 block">Seasons</legend>
          <div className="flex flex-wrap gap-2">
            {seasonOptions.map((season) => (
              <Badge
                key={season.value}
                variant={
                  selectedSeasons.includes(season.value) ? "default" : "outline"
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
        {actionData?.errors?.seasons && (
          <p className="mt-1 text-red-500">{actionData.errors.seasons}</p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="image" className="mb-1 block">
            Upload Image
          </label>
          <Input
            type="file"
            name="image"
            id="image"
            onChange={handleImageChange}
          />
          <div className="flex w-full items-center justify-center">
            {image && (
              <img
                src={image}
                alt="Selected"
                className="mt-4 h-48 w-full object-cover rounded-lg"
              />
            )}
          </div>
          {actionData?.errors?.image && (
            <p className="mt-1 text-red-500">{actionData.errors.image}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-8">
          <Button type="submit" name="actionType" value="save">
            Save
          </Button>
          <DialogClose className="w-full">
            <Button className="w-full" variant="destructive">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="link" name="actionType" value="saveAsNew">
            Save as new
          </Button>
        </div>
      </Form>
    </DialogContent>
  );
}
