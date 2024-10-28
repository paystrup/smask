import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";

/* eslint-disable react/prop-types */
export default function MealCard({
  title,
  description,
  seasons,
  tags,
  allergies,
  imageUrl,
  link,
}) {
  const tagsToDisplay = 2;

  return (
    <Link to={link}>
      <div className="rounded-2xl shadow-sm w-full h-fit relative text-white">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-80 object-cover rounded-2xl"
            />
          ) : (
            <div className="flex items-center justify-center text-3xl bg-slate-50 w-full h-80 object-cover rounded-2xl">
              <p>🍔</p>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl" />

          {seasons.length > 0 && (
            <div className="absolute top-0 left-0 p-4">
              {seasons.map((season) => (
                <Badge key={season}>{season}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-b-2xl flex flex-col gap-2 absolute bottom-0 left-0">
          <div>
            <h3 className="text-2xl font-bold first-letter:capitalize">
              {title}
            </h3>
            <p className="opacity-80 first-letter:capitalize line-clamp-1">
              {description}
            </p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {tags.length > 0 && (
              <>
                {tags.slice(0, tagsToDisplay).map((tag) => (
                  <li key={tag} className="list-none">
                    <Badge>{tag.name}</Badge>
                  </li>
                ))}
              </>
            )}

            {allergies.length > 0 && (
              <>
                {allergies.slice(0, tagsToDisplay).map((allergy, i) => (
                  <li key={allergy + i} className="list-none">
                    <Badge>{allergy}</Badge>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    </Link>
  );
}
