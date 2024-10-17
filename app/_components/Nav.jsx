import { Link } from "@remix-run/react";

export default function Nav() {
  return (
    <header className="mb-4 border-b-2 pb-3">
      <Link to="/" className="text-blue-600 hover:underline">
        smask
      </Link>
      <Link to="/meals/new" className="ml-3 text-blue-600 hover:underline">
        Add new meal
      </Link>
    </header>
  );
}
