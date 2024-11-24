export default function ErrorMessage({ title, message, className }) {
  return (
    <div
      className={[
        "rounded border border-red-500 bg-red-100 p-4 text-red-900 m-12",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <p>{message}</p>
    </div>
  );
}
