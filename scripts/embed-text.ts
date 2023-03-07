import { NavalJSON, NavalSection } from "@/types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

loadEnvConfig("");

const generateEmbeddings = async (sections: NavalSection[]) => {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    for (let j = 0; j < section.subsections.length; j++) {
      const subsection = section.subsections[j];

      const { title, subtitle, html, content, length, tokens } = subsection;

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: content
      });

      const [{ embedding }] = embeddingResponse.data.data;

      const { data, error } = await supabase
        .from("naval_posts")
        .insert({
          title,
          subtitle,
          html,
          content,
          length,
          tokens,
          embedding
        })
        .select("*");

      if (error) {
        console.log("error", error);
      } else {
        console.log("saved", i, j);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
};

(async () => {
  const book: NavalJSON = JSON.parse(fs.readFileSync("scripts/naval.json", "utf8"));

  await generateEmbeddings(book.sections);
})();
