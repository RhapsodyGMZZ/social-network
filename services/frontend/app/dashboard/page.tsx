import Link from "next/link";
import { Button } from "@/app/ui/button";
import Posts from "@/app/ui/posts/posts";
import Pagination from "@/app/ui/dashboard/pagination";
import { fetchPageNumber } from "../lib/data";

export default async function Page(
  {
    searchParams,
  }: {
    searchParams?: {
      page?: string;
    };
  },
) {
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchPageNumber();
  return (
    <div className="w-auto">
      <Button>
        <Link href="/dashboard/posts/create">
          Create Post
        </Link>
      </Button>
      <Posts page={currentPage} />
      <Pagination totalPages={totalPages ?? 0} />
    </div>
  );
}
