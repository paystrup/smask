import { useNavigate } from "@remix-run/react";
import { MoveLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <button onClick={goBack} className="flex gap-2 mb-8">
      <MoveLeft size={20} />
      <p>Back</p>
    </button>
  );
}
