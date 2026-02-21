import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function CoursesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>

        <Link className={buttonVariants()} href="/admin/courses/create">
          Create Course
        </Link>
      </div>

      <div>
        <h1>Here you see will of the courses</h1>
      </div>
    </>
  );
}
