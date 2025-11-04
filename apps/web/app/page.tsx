import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return (
    <>
      <h1 className="text-red-500">Next.js + Serwist - app router!</h1>
    </>
  );
}
