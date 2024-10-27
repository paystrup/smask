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
  return (
    <Link to={link}>
      <div className="rounded-2xl shadow-md w-full h-fit">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-72 object-cover rounded-t-2xl"
            />
          ) : (
            <div className="flex items-center justify-center text-3xl bg-slate-50 w-full h-72 object-cover rounded-t-2xl">
              <p>🍔</p>
            </div>
          )}

          {seasons.length > 0 && (
            <div className="absolute top-0 left-0 p-4">
              {seasons.map((season) => (
                <Badge key={season}>{season}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-b-2xl">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p>{description}</p>

          {tags.length > 0 && (
            <div>
              {tags.map((tag) => (
                <Badge key={tag}>{tag.name}</Badge>
              ))}
            </div>
          )}

          {allergies.length > 0 && (
            <div>
              {allergies.map((allergy) => (
                <Badge key={allergy}>{allergy}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
