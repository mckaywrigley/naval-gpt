import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      <div className="hidden sm:flex"></div>

      <div className="hidden sm:flex italic text-sm">
        Created by
        <a
          className="hover:opacity-50 mx-1"
          href="https://twitter.com/mckaywrigley"
          target="_blank"
          rel="noreferrer"
        >
          Mckay Wrigley
        </a>
        based on
        <a
          className="hover:opacity-50 mx-1"
          href="https://twitter.com/naval"
          target="_blank"
          rel="noreferrer"
        >
          Naval Ravikant's
        </a>
        Twitter thread
        <a
          className="hover:opacity-50 ml-1"
          href="https://twitter.com/naval/status/1002103360646823936?lang=en"
          target="_blank"
          rel="noreferrer"
        >
          How To Get Rich
        </a>
        .
      </div>

      <div className="flex space-x-4">
        <a
          className="flex items-center hover:opacity-50"
          href="https://twitter.com/mckaywrigley"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter size={24} />
        </a>

        <a
          className="flex items-center hover:opacity-50"
          href="https://github.com/mckaywrigley/naval-gpt"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>
    </div>
  );
};
