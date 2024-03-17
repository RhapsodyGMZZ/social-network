import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { fetchUser } from "@/app/lib/data";
import { auth } from "@/auth";
import axios from "axios";

export default async function SideNav() {
  const session = await auth();

  return (
    <div className="flex flex-col px-3 py-4 md:px-2">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="mb-2 flex h-50 items-end justify-center rounded-md bg-purple-700 p-4 md:h-50">
          <Link href="/dashboard/profile">
            <div className="flex flex-col items-center mb-2">
              <Image
                src={`${session?.user?.picture}`}
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full"
              />
              <h1 className="text-2xl font-bold">
                <span className="text-white hover:text-purple-200">
                  {session?.user?.name}
                </span>
              </h1>
            </div>
          </Link>
        </div>
      </Suspense>
      {/* <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block shadow-xl">
        </div>
      </div> */}
    </div>
  );
}
