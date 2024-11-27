export default function SimpleHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-4 my-12 text-center max-w-[45ch]">
      {title && (
        <h1 className="text-5xl font-semibold tracking-tighter">{title}</h1>
      )}
      {description && <p className="text-xl opacity-70">{description}</p>}
    </div>
  );
}
