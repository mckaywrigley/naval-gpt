import os
import openai
from pydub import AudioSegment
import time
import json

openai.api_key = os.getenv("OPENAI_API_KEY")

podcast = AudioSegment.from_mp3("../public/podcast.mp3")

one_min = 60 * 1000
podcast_length_seconds = len(podcast) / 1000
clip_count = (podcast_length_seconds / 60) + 1

clips = []

def create_clips():
    print("Creating clips...")

    clip = podcast[0:one_min]
    clip.export("clips/1.mp3", format="mp3")
    print("Exported clip 1")
    
    for i in range(1, int(clip_count)):
            file_name = str(i + 1) + ".mp3"
            clip = podcast[i * one_min - 1000:(i + 1) * one_min]
            clip.export("clips/" + file_name, format="mp3")
            print("Exported clip " + str(i + 1))

def generate_transcript():
    print("Generating transcript...")

    for i in range(0, int(clip_count)):
        print("Transcribing clip " + str(i + 1) + "...")
        audio_file = open("clips/" + str(i + 1) + ".mp3", "rb")
        prompt = "The transcript is a podcast between Naval Ravikant and Nivi Ravikant about Naval's popular Twitter thread \"How To Get Rich\" Nivi asks Naval questions as they go through the thread."

        transcript = openai.Audio.transcribe("whisper-1", audio_file, prompt)

        if transcript.text:
            text = transcript.text
            text = text.replace("nivald", "naval").replace("Nivald", "Naval")
            print("\n\nTranscribed text:\n\n" + text)

            timestamp = i * 60

            clip = {
                "file": str(i + 1) + ".mp3",
                "seconds": timestamp,
                "content": text
            }

            clips.append(clip)

            print("Waiting 1.2s before next transcription...")
            time.sleep(1.2)
        else:
            print('ERROR:' + str(i + 1))

            clip = {
                "file": str(i + 1) + ".mp3",
                "seconds": timestamp,
                "content": "ERROR"
            }

            clips.append(clip)

            print("Waiting 10s before next transcription...")
            time.sleep(10)

def create_json():
    print("Creating JSON...")

    with open("clips.json", "w") as f:
        json_string = json.dumps(clips)
        f.write(json_string)



create_clips()
generate_transcript()
create_json()
