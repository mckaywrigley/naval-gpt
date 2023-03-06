import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import { FC } from "react";
import naval from "../public/naval.jpeg";

export const Navbar: FC = () => {
  return (
    <div className="flex h-[60px] border-b border-gray-300 py-2 px-8 items-center justify-between">
      <div className="font-bold text-2xl flex items-center">
        <Image
          className="hidden sm:flex"
          src={naval}
          alt="The Network State GPT"
          height={40}
        />
        <a
          className="ml-2 hover:opacity-50"
          href="https://naval-gpt.vercel.app"
        >
          Naval GPT
        </a>
      </div>
      <div>
        <a
          className="flex items-center hover:opacity-50"
          href="http://www.nav.al"
          target="_blank"
          rel="noreferrer"
        >
          <div className="hidden sm:flex">nav.al</div>

          <IconExternalLink
            className="ml-1"
            size={20}
          />
        </a>
      </div>
    </div>
  );
};
