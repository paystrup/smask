import { Link } from "@remix-run/react";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

const heightMap = {
  sm: "h-48", // 192px
  md: "h-64", // 256px
  lg: "h-96", // 384px
  default: "h-72", // current default (288px)
};

export default function MealCard({
  title,
  description,
  seasons,
  tags,
  // allergies,
  imageUrl,
  link,
  view = "grid" | "list",
  className,
  hideTags = false,
  startTime,
  endTime,
  size,
}) {
  const imageHeight = size ? heightMap[size] : heightMap.default;
  const tagsToDisplay = 2;
  if (view === "list")
    return (
      <Link to={link} className={cn("w-full h-fit", className)}>
        <div className="flex gap-4">
          <div className="relative aspect-square min-w-32 min-h-32 max-h-32 max-w-32">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover rounded-xl scale-100"
              />
            ) : (
              <div className="flex items-center justify-center text-5xl bg-neutral-50 h-full w-full object-cover rounded-2xl">
                <p>🍽️</p>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row justify-between w-full">
            <div>
              <h3 className="text-2xl font-semibold first-letter:capitalize">
                {title}
              </h3>
              <p className="opacity-70 first-letter:capitalize line-clamp-3 mt-2 max-w-[50ch]">
                {description}
              </p>
            </div>

            <ul className="flex flex-wrap gap-2 mt-8 lg:mt-0">
              {seasons.length > 0 && (
                <>
                  {seasons.map((season, i) => (
                    <li key={i}>
                      <Badge variant="primary">{season}</Badge>
                    </li>
                  ))}
                </>
              )}

              {tags.length > 0 && (
                <>
                  {tags.slice(0, tagsToDisplay).map((tag, i) => (
                    <li key={i} className="list-none">
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
      <Link to={link} className="rounded-xl text-start group">
        <div className="rounded-2xl shadow-sm w-full h-fit relative text-white">
          <div
            className={`relative overflow-hidden rounded-2xl  ${imageHeight}`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className={`w-full object-cover rounded-2xl ${imageHeight} group-hover:scale-[102%] transition-all duration-200 ease-in-out`}
              />
            ) : (
              <div
                className={`flex items-center justify-center text-5xl bg-neutral-300 w-full object-cover rounded-2xl ${imageHeight}`}
              >
                <p>🍽️</p>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-700/100 to-transparent rounded-2xl" />
          </div>

          {startTime && endTime && (
            <Badge className="opacity-80 text-xs font-medium tracking-tight absolute top-0 left-0 m-4">
              {format(new Date(startTime), "HH:mm")} -{" "}
              {format(new Date(endTime), "HH:mm")}
            </Badge>
          )}

          {/*             
            We only show seasons, to not clutter the UI
            TODO in the future - add props to toggle tags and allergies */}
          {!startTime && !endTime && !hideTags && seasons.length > 0 && (
            <ul className="flex flex-wrap gap-2 absolute top-0 left-0 m-4">
              {seasons.slice(0, 1).map((season, i) => (
                <li key={i}>
                  <Badge variant="primary">{season}</Badge>
                </li>
              ))}

              {seasons.length > 1 && (
                <li>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary">+{seasons.length - 1}</Badge>
                    </TooltipTrigger>
                    <TooltipContent className="opacity-100">
                      <ul>
                        {seasons.slice(1).map((remainingSeason, i) => (
                          <li key={i}>{remainingSeason}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </li>
              )}
            </ul>
          )}

          <div className="p-6 rounded-b-2xl flex flex-col gap-4 absolute bottom-0 left-0">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold tracking-tight first-letter:capitalize">
                {title}
              </h3>
              {description && (
                <p className="opacity-80 first-letter:capitalize line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
}
