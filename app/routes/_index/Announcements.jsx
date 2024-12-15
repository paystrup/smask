import Avatar from "~/components/_feature/avatar/Avatar";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

// TODO Add announcement route and fetch data from db
export default function Announcements() {
  return (
    <Card className="w-full h-full border-0 bg-primary-purple text-primary-dark flex flex-col justify-between gap-8">
      <CardTitle className="p-7 pb-0 flex justify-between items-start">
        <h3 className="text-2xl font-semibold tracking-tight">Announcements</h3>
      </CardTitle>
      <CardContent className="flex gap-4 items-end">
        <Avatar size="lg" />
        <div className="flex flex-col gap-2 justify-end w-full">
          <p className="text-sm self-end">December 24 - 12:33</p>
          <div className="bg-white/30 w-full p-6 rounded-3xl relative rounded-bl-md">
            <p>
              Happy holidays everyone. The office will open again the 3rd of
              January 25, cya there! 👋🧑‍🎄🎄 Enjoy it!
              <br />
              <br />
              <b>Chef</b>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
