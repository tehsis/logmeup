import { type ActionFunctionArgs } from "react-router"; // Use Remix imports as react-router often mirrors them
import { LLMService } from "../services/llmService"; // Keep LLMService accessible from server routes

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { text } = await request.json();

    if (typeof text !== "string" || !text.trim()) {
      return { candidates: [] }; // Return empty if no valid text
    }

    // Instantiate the service on the server side for each request
    // Consider if singleton or dependency injection is needed for more complex apps
    const llmService = new LLMService();
    const candidates = await llmService.extractTodos(text);

    return { candidates };
  } catch (error) {
    console.error("API Error extracting todos:", error);
    // Avoid leaking internal error details to the client
    return Response.json({ error: "Failed to extract todos" }, { status: 500 });
  }
}
