import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled } from "@tabler/icons-react";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";

interface PlayerProps {
  src: string;
  startTime: number;
}

export const Player: FC<PlayerProps> = ({ src, startTime }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime - 5);
  const [duration, setDuration] = useState(0);

  const handlePlay = () => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.play();
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    setIsPlaying(false);
    audioRef.current.pause();
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = +event.target.value;
  };

  const handleSkipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime -= 15;
  };

  const handleSkipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 15;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = currentTime;
    setDuration(audioRef.current.duration);
  }, []);

  return (
    <div className="p-4">
      <audio
        ref={audioRef}
        src={src}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="flex flex-col items-center">
        <div className="mb-4">
          <span>{formatTime(currentTime)}</span>
          <span className="mx-2">/</span>
          <span>215:35</span>
        </div>

        <div
          className="w-full mb-4"
          style={{ display: "flex", alignItems: "center" }}
        >
          <input
            type="range"
            value={currentTime}
            min="0"
            max={`${duration}`}
            step="15"
            onChange={handleSliderChange}
            style={{ flexGrow: 1 }}
          />
        </div>

        <div className="flex align-middle">
          <button
            className="p-2 rounded-full bg-blue-500 text-white mr-3 hover:bg-blue-600"
            onClick={handleSkipBackward}
          >
            <div className="flex items-center">
              <IconPlayerSkipBackFilled size={14} />
              <div className="ml-1 text-sm">15s</div>
            </div>
          </button>

          <button
            className="p-2 rounded-full bg-blue-500 text-white mr-3 hover:bg-blue-600 ml-4"
            onClick={isPlaying ? handlePause : handlePlay}
          >
            {isPlaying ? <IconPlayerPauseFilled size={36} /> : <IconPlayerPlayFilled size={36} />}
          </button>

          <button
            className="ml-4 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleSkipForward}
          >
            <div className="flex items-center">
              <div className="mr-1 text-sm">15s</div>
              <IconPlayerSkipForwardFilled size={14} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
