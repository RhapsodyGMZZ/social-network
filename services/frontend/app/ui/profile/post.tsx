import { fetchPageNumber, fetchUser } from "@/app/lib/data";
import Pagination from "../dashboard/pagination";
import Posts from "../posts/posts";
import { Param } from "@/app/lib/definitions";
// import { auth } from "@/auth";

export default async function UserPosts({param}:{param?:Param}){
    const user = await fetchUser();
    // const session = await auth();
    const currentPage = Number(param?.page) || 1;
    const totalPages = await fetchPageNumber('user', `UUID=${param?.user ? param?.user : user?.uuid}`);
    return(
        <div >
        <div className="overflow-y-auto max-h-[230px]">
          <Posts page={currentPage} urlSegment={"user/posts"} param={`UUID=${param?.user ? param?.user : user?.uuid}`} />
        </div>
        <Pagination totalPages={totalPages ?? 0} />
      </div>
    )
}