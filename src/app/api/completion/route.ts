import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
// export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const data = await req.json();
  const images = Object.values(data) as string[];
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 100,
    messages: [
      {
        role: "system",
        content: "You are a golf coach. I am asking you to roast my swing. Keep it short.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `These are frames of a video of a golf swing. Roast my swing!`,
          },
          ...images.filter(Boolean).map((image) => ({
            type: "image_url" as const,
            image_url: {
              url: image,
            },
          })),
        ],
      },
    ],
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
