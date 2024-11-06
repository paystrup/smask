/* eslint-disable react/prop-types */
export default function Avatar({ name }) {
  return (
    <div className="h-8 w-8 font-semibold text-md rounded-full flex items-center justify-center bg-black text-white leading-none">
      <p>{name ? name?.charAt(0).toUpperCase() : "?"}</p>
    </div>
  );
}
