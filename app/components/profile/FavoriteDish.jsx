import { Utensils } from "lucide-react";
import { Card } from "../ui/card";

export default function FavoriteDish({ dish }) {
  return (
    <Card className="bg-primary-lime relative overflow-hidden text-primary-dark border-none w-full h-full flex flex-col justify-between">
      <div
        className="flex items-center justify-between
       gap-2 flex-wrap p-7"
      >
        <h3 className="text-2xl w-fit font-semibold tracking-tight">
          Favorite dish
        </h3>
        <Utensils className="w-56 h-56 text-primary-dark opacity-10 translate-x-10 translate-y-10 absolute bottom-0 right-0" />
      </div>
      <div className="p-7 text-xl flex flex-col justify-end items-start gap-2">
        <h4 className="text-lg font-normal tracking-tight opacity-50">
          {dish ? dish : "No favorite dish 😢"}
        </h4>
      </div>
    </Card>
  );
}
