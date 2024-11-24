export default function ProfilePlaceholder({ name }) {
  return (
    <div>
      <p>{name ? name.charAt(0) : ""}</p>
    </div>
  );
}
