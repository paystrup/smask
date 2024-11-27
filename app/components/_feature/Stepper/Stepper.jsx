export default function Stepper({ currentStep, maxSteps }) {
  return (
    <div className="flex gap-2">
      <div className="flex gap-2">
        {Array.from({ length: maxSteps }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`transition-colors duration-300 ease-in-out h-8 w-8 rounded-full flex items-center font-bold justify-center ${
                index + 1 === currentStep
                  ? "bg-primary-blue text-white"
                  : "border border-gray-400 text-black"
              } ${index + 1 < currentStep ? "bg-gray-200" : ""}`}
            >
              <p>{index + 1}</p>
            </div>
            {index < maxSteps - 1 && (
              <div className="h-[2px] w-8 bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
