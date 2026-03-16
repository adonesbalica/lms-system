import { ArrowLeftIcon, ShieldXIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotAdminRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 rounded-full w-fit mx-auto p-4">
            <ShieldXIcon className="size-16 text-destructive" />
          </div>

          <CardTitle className="text-2xl">Access Restricted</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            Hey! Your are not an admin, which means you can't create any courses
            or stuff like that...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className={buttonVariants({
              className: "w-full",
            })}
          >
            <ArrowLeftIcon className="mr-1 size-4" />
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
