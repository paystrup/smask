/* eslint-disable react/prop-types */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import MealCard from "../cards/MealCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import { Button } from "~/components/ui/button";

export function MealCarousel({ cards, title }) {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handlePrevious = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const handleNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  if (!cards.length) {
    return <></>;
  }

  return (
    <div className="w-full mx-auto mt-10 lg:mt-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold tracking-tight">
          {title || "Related Meals"}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {cards.map((card, i) => (
            <CarouselItem
              key={i}
              className="pl-2 md:pl-4 sm:basis-[75%] lg:basis-[28.5%]"
            >
              <MealCard
                link={`/meals/${card._id}`}
                title={card.title}
                description={card.description}
                tags={card.tags || []}
                allergies={card.allergies || []}
                seasons={card.seasons || []}
                imageUrl={card.image}
                view={"grid"}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="py-2 text-center">
        {Array.from({ length: count }).map((_, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 rounded-full mx-1 p-0 ${
              i === current ? "bg-primary" : "bg-primary/20"
            }`}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
