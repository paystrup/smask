import { Card, CardContent, CardTitle } from "~/components/ui/card";

export default function Announcements() {
  return (
    <Card className="w-full h-full border-0 bg-slate-100 text-black flex flex-col justify-between gap-8">
      <CardTitle className="p-6 flex justify-between items-start">
        <h3 className="text-2xl font-semibold tracking-tighter">
          Announcements
        </h3>
      </CardTitle>
      <CardContent>
        <p className="opacity-80">No announcements right now</p>
      </CardContent>
    </Card>
  );
}
