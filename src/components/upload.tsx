/* eslint-disable @next/next/no-img-element */
"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCompletion } from "ai/react";

export default function Upload() {
  const [status, setStatus] = useState<
    "" | "processing" | "analyzing" | "done"
  >("");
  const { complete, completion, isLoading } = useCompletion({
    onFinish: () => setStatus("done"),
  });
  // Function to convert a frame to Base64
  function frameToBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL();
    return dataUrl;
  }

  // Main function to capture video frames and convert them to Base64
  function captureVideoFrames(videoSelector: string, frameRate = 1) {
    const video = document.querySelector(videoSelector) as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.width;
    canvas.height = video.height;

    const base64Frames: string[] = [];
    let intervalId: any = null;

    video.addEventListener("loadeddata", () => {
      // Ensure the video is playing
      // speed up the video
      video.play().then(() => {
        intervalId = setInterval(() => {
          const video = document.querySelector(videoSelector) as HTMLVideoElement;
          if (video.paused || video.ended) {
            clearInterval(intervalId);
            // Here you can use base64Frames as needed
            return;
          }
          const base64Frame = frameToBase64(video, canvas, context!);
          base64Frames.push(base64Frame);
        }, 1000 / frameRate); // Capture frame every (1000/frameRate) milliseconds
      });
    });

    video.addEventListener("ended", () => {
      // displayFramesAsGallery(base64Frames);
      clearInterval(intervalId);
      if (base64Frames.length === 0) {
        alert("No frames captured");
        return;
      }
      if (isLoading || status === "analyzing") {
        return;
      }
      setStatus("analyzing");
      complete("", {
        body: base64Frames,
      });
    });
  }

//   function displayFramesAsGallery(base64Frames: string[]) {
//     const container = document.getElementById('framesContainer');

//     base64Frames.forEach(base64Image => {
//         const img = document.createElement('img');
//         img.src = base64Image;
//         container!.appendChild(img);
//     });
// }


  return (
    <div className="flex flex-col gap-4 w-full min-h-screen max-w-md p-6 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
      {/* <div id="framesContainer"></div> */}
      <Label htmlFor="video">Upload Video</Label>
      <Input
        accept="video/*"
        type="file"
        name="video"
        onChange={(e) => {
          captureVideoFrames("#video", 3); // Adjust frameRate as needed
          const videoEl = document.getElementById("video") as HTMLVideoElement;
          if (videoEl) {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
              return;
            }
            videoEl.src = URL.createObjectURL(file);
            setStatus("processing");
          }
        }}
      />{" "}
      <video
        id="video"
        width={500}
        height={500}
        onClick={(e) => {
          // replay
          (e.target as HTMLVideoElement).currentTime = 0;
          (e.target as HTMLVideoElement).play();
        }}
      ></video>
      <span className="text-lg animate-pulse text-gray-500 dark:text-gray-400">
        {/* status */}
        {status === "processing" && "Processing video..."}
        {status === "analyzing" && "Analyzing video..."}
      </span>
      {status !== "" && completion}
      {/* retry button */}
      {status === "done" && (
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
