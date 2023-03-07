import { NavalClip } from "@/types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

loadEnvConfig("");

const generateEmbeddings = async (clips: NavalClip[]) => {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];

    const { file, content, seconds } = clip;

    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: content
    });

    const [{ embedding }] = embeddingResponse.data.data;

    const { data, error } = await supabase
      .from("naval_clips")
      .insert({
        file,
        content,
        seconds,
        embedding
      })
      .select("*");

    if (error) {
      console.log("error", error);
    } else {
      console.log("saved", i);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

(async () => {
  const json = JSON.parse(fs.readFileSync("scripts/clips.json", "utf8"));

  await generateEmbeddings(json);
})();
