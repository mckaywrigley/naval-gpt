# Naval GPT

AI-powered search & chat for Naval Ravikant's Twitter thread "How To Get Rich."

(adding more content soon)

Everything is 100% open source.

## Dataset

The dataset consists of 2 CSV files containing all text & embeddings used.

Download clips data [here](https://drive.google.com/file/d/1ekj7F2HCCFqyUe0kAUX94JZSb4Rr9qPP/view?usp=share_link).

Download passages data [here](https://drive.google.com/file/d/1-yVP1VYe1D-fKHejijK1ZWLsX-o0Md0Y/view?usp=share_link).

I recommend getting familiar with fetching, cleaning, and storing data as outlined in the scraping and embedding scripts below, but feel free to skip those steps and just use the dataset.

## How It Works

Naval GPT provides 3 things:

1. Search
2. Chat
3. Audio

### Search

Search was created with [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) (`text-embedding-ada-002`).

First, we loop over the passages from Naval's formatted [blog post](https://nav.al/rich) and generate embeddings for each chunk of text.

We do this because we can render the beautifully formatted text in our app by saving the HTML.

In the app, we take the user's search query, generate an embedding, and use the result to find the most similar passages.

The comparison is done using cosine similarity across our database of vectors.

Our database is a Postgres database with the [pgvector](https://github.com/pgvector/pgvector) extension hosted on [Supabase](https://supabase.com/).

Results are ranked by similarity score and returned to the user.

### Chat

Chat builds on top of search. It uses search results to create a prompt that is fed into GPT-3.5-turbo.

This allows for a chat-like experience where the user can ask questions about the topic and get answers.

### Audio

The podcast player is a simple audio player that plays the [podcast](https://content.libsyn.com/p/4/b/0/4b0ce4b1beb1c234/Naval-Ep53.mp3?c_id=59607029&cs_id=59607029&response-content-type=audio%2Fmpeg&Expires=1678166856&Signature=Lfp~zMHa0ETN00JHMVG8xcCGvTnUonsl8ouhpdaH0A4XLHhMISlMySL2mS4e1q6yvONjTZ4pR9L~YDyaSZ~knatkNEVNloDCHjYQZ6-AMy7Qcd0~XwenWZDkRDbjkLj58QE2c6APgDYZqlio1PyO2m9JSIalKdmR1bWnZ02WV3VVymLQUJAaAZcRIX-X3KyO4IT6xbnyK8BiJfJXOo7uITW~xtY9PoaP3Id8yw0Ckna0uSfv60aOO2BDFO~ZyivpkfnfcEtimZYjFQDLhlzIbJCoOw52NRojeaSy2-T~d870-fd9FvSKkTwYAr04cDNrkBcrlKhzhnYRLwT0wWc6Yg__&Key-Pair-Id=K1YS7LZGUP96OI) for this thread.

We use Python and [OpenAI Whisper](https://openai.com/research/whisper) to loop over the podcast to generate embeddings for each 1min chunk of audio.

We then use the same method as search to find the most similar clip.

During our audio processing we saved timestamps for each clip, so we then jump to that timestamp for the podcast in the app.

## Running Locally

Here's a quick overview of how to run it locally.

### Requirements

1. Set up OpenAI

You'll need an OpenAI API key to generate embeddings.

2. Set up Supabase and create a database

Note: You don't have to use Supabase. Use whatever method you prefer to store your data. But I like Supabase and think it's easy to use.

There is a schema.sql file in the root of the repo that you can use to set up the database.

Run that in the SQL editor in Supabase as directed.

I recommend turning on Row Level Security and setting up a service role to use with the app.

### Repo Setup

3. Clone repo

```bash
git clone https://github.com/mckaywrigley/naval-gpt.git
```

4. Install dependencies

```bash
npm i
```

5. Set up environment variables

Create a .env.local file in the root of the repo with the following variables:

```bash
OPENAI_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

You'll also need to save your OpenAI API key as an environment variable in your OS.

```bash
export OPENAI_API_KEY=
```

### Process Text

6. Run text scraping script

```bash
npm run scrape
```

This scrapes the content from Naval's website and saves it to a json file.

7. Run text embedding script

```bash
npm run embed-text
```

This reads the json file, generates embeddings for each passage, and saves the results to your database.

There is a 200ms delay between each request to avoid rate limiting.

This process will take 10-15 minutes.

### Process Audio

8. Download podcast

Download the [podcast](https://content.libsyn.com/p/4/b/0/4b0ce4b1beb1c234/Naval-Ep53.mp3?c_id=59607029&cs_id=59607029&response-content-type=audio%2Fmpeg&Expires=1678167549&Signature=KOxLpDUzvl~zD-yiSE55VedxazspCijG6-Mme~54wcaiwDlnONhDi7t--maXLNPK345FSXDq-G7T0RJNrIVF0z0u8-rc6Nv2r-uh72l2L2isJ4cNpCnCiEk4Hfe31fdu42D17kENRRM9ybiTHa0kst9qtZ4t6WIeACbT1Tdvf1GfI9s7TZxI4IceHHM~GEhxGdpMEMOrN8zKVJvKxuV9RXI9vMbhGPnOCtHAIw1~7gaXu-Ag3k3aOoD~gptl~cqk4aIEZLjjdeJg1evx48t4RCye5YtKZZIjYyrgyIji-HOXWPDan04oJymijc8AEMyL27E9F2ikOfQ6DVIQsx4qfA__&Key-Pair-Id=K1YS7LZGUP96OI) and add it as "podcast.mp3" to the public directory.

9. Run the audio processing script

Note: You'll need to have Python installed on your machine.

```bash
cd scripts

python3 main.py
```

This splits the podcast into 1min chunks and generates embeddings for each chunk.

The results are saved to a json file.

There is a 1.2s delay between each request to avoid rate limiting.

It will take 20-30 minutes to run.

10. Run audio embedding script

```bash
npm run embed-audio
```

This reads the json file, generates embeddings for each clip, and saves the results to your database.

There is a 200ms delay between each request to avoid rate limiting.

This process will take about 5 minutes.

### App

11. Run app

```bash
npm run dev
```

## Credits

Thanks to [Naval Ravikant](https://twitter.com/naval) for publicizing his thoughts - they've proven to be an invaluable source of wisdom for all of us.

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/mckaywrigley)!

## Notes

I sacrificed composability for simplicity in the app.

You can split up a lot of the stuff in index.tsx into separate components.
