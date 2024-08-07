import { NextResponse } from "next/server";
import OpenAI from "openai";

// Define the system prompt as a string
const systemPrompt =
  "Welcome to HeadstarteAI Customer Support!\n\nHow can I assist you today?";

export async function POST(req) {
  try {
    const openai = new OpenAI();

    // Parse request body
    const data = await req.json();

    // Ensure data is in the correct format
    if (!Array.isArray(data)) {
      return new NextResponse("Invalid request format", { status: 400 });
    }

    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...data],
      model: "gpt-4o-mini",
      stream: true,
    });

    // Create a readable stream from the completion response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
          console.error("Stream Error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
