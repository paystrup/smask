import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

/* eslint-disable react/prop-types */
export default function MealCard({
  title,
  description,
  seasons,
  tags,
  // allergies,
  imageUrl,
  link,
  view = "grid" | "list",
}) {
  const tagsToDisplay = 2;
  if (view === "list")
    return (
      <Link to={link} className="w-full h-fit">
        <div className="flex gap-4">
          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="h-32 w-32 object-cover rounded-2xl"
              />
            ) : (
              <div className="flex items-center justify-center text-5xl bg-neutral-50 h-32 w-32 object-cover rounded-2xl">
                <p>🍔</p>
              </div>
            )}
          </div>

          <div className="flex justify-between w-full">
            <div>
              <h3 className="text-2xl font-semibold first-letter:capitalize">
                {title}
              </h3>
              <p className="opacity-70 first-letter:capitalize line-clamp-1 max-w-[50ch]">
                {description}
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {seasons.length > 0 && (
                <>
                  {seasons.map((season) => (
                    <li key={season}>
                      <Badge variant="primary">{season}</Badge>
                    </li>
                  ))}
                </>
              )}

              {tags.length > 0 && (
                <>
                  {tags.slice(0, tagsToDisplay).map((tag) => (
                    <li key={tag} className="list-none">
                      <Badge>{tag.name}</Badge>
                    </li>
                  ))}
                </>
              )}

              {/* {allergies.length > 0 && (
              <>
                {allergies.slice(0, tagsToDisplay).map((allergy, i) => (
                  <li key={allergy + i} className="list-none">
                    <Badge>{allergy}</Badge>
                  </li>
                ))}
              </>
            )} */}
            </ul>
          </div>
        </div>

        <Separator className="mt-8" />
      </Link>
    );
  if (view === "grid")
    return (
      <Link to={link} className="rounded-2xl">
        <div className="rounded-2xl shadow-sm w-full h-fit relative text-white">
          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-80 object-cover rounded-2xl"
              />
            ) : (
              <div className="flex items-center justify-center text-5xl bg-neutral-50 w-full h-80 object-cover rounded-2xl">
                <p>🍔</p>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl" />
          </div>

          <div className="p-6 rounded-b-2xl flex flex-col gap-2 absolute bottom-0 left-0">
            <div>
              <h3 className="text-2xl font-semibold first-letter:capitalize">
                {title}
              </h3>
              <p className="opacity-80 first-letter:capitalize line-clamp-1">
                {description}
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {seasons.length > 0 && (
                <>
                  {seasons.map((season) => (
                    <li key={season}>
                      <Badge variant="primary">{season}</Badge>
                    </li>
                  ))}
                </>
              )}

              {tags.length > 0 && (
                <>
                  {tags.slice(0, tagsToDisplay).map((tag) => (
                    <li key={tag} className="list-none">
                      <Badge>{tag.name}</Badge>
                    </li>
                  ))}
                </>
              )}

              {/* {allergies.length > 0 && (
              <>
                {allergies.slice(0, tagsToDisplay).map((allergy, i) => (
                  <li key={allergy + i} className="list-none">
                    <Badge>{allergy}</Badge>
                  </li>
                ))}
              </>
            )} */}
            </ul>
          </div>
        </div>
      </Link>
    );
}
