import Image from "next/image";
import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import Signin from "./login";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if ((status != "loading") && (!session)) {
      router.push('/login'); // Redirect if not admin
    }
  }, [session, status]);

  // if (!session) {
  //   return <Signin />
  // }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >Home Page
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
