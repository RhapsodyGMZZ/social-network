import Image from "next/image";
import { fetchUser } from "@/app/lib/data";
import { auth } from "@/auth";
import Link from "next/link";

export default async function Page() {
  const user = await fetchUser();
  const session = await auth();


  return (
    <div className="flex flex-col w-2/3 m-auto mt-10 ">
      <Link href="/dashboard/group" className="p-3 h-10 rounded-lg bg-purple-700 px-4 text-sm font-medium text-white transition-colors hover:bg-purple-900">
        Create Group
      </Link>
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="flex justify-around">
        <Image
          src={`${session?.user?.picture}`}
          alt="Profile Picture"
          width={200}
          height={200}
          className="rounded-full"
        />
      </div>
      <div>
        <p>UUID: {user?.uuid}</p>
        <p>Email: {user?.email}</p>
        <p>First Name: {user?.firstName}</p>
        <p>Last Name: {user?.lastName}</p>
        <p>Date of Birth: {user?.dateOfBirth}</p>
        {user?.nickname && <p>Nickname: {user?.nickname}</p>}
        {user?.about && <p>About: {user?.about}</p>}
      </div>
    </div>
  );
}
