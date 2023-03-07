import { supabaseAdmin } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, apiKey, matches } = (await req.json()) as {
      query: string;
      apiKey: string;
      matches: number;
    };

    const input = query.replace(/\n/g, " ");

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await res.json();
    const embedding = json.data[0].embedding;

    const { data: posts, error: postsError } = await supabaseAdmin.rpc("naval_posts_search", {
      query_embedding: embedding,
      similarity_threshold: 0.01,
      match_count: matches
    });

    if (postsError) {
      console.error(postsError);
      return new Response("Posts Error", { status: 500 });
    }

    const { data: clips, error: clipsError } = await supabaseAdmin.rpc("naval_clips_search", {
      query_embedding: embedding,
      similarity_threshold: 0.01,
      match_count: 1
    });

    if (clipsError) {
      console.error(clipsError);
      return new Response("Clips Error", { status: 500 });
    }

    return new Response(JSON.stringify({ posts, clips }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
