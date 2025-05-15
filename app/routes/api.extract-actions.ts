import { type ActionFunctionArgs } from "react-router";
import { LLMService } from "../services/llmService";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { text } = await request.json();

    if (typeof text !== "string" || !text.trim()) {
      return { candidates: [] };
    }

    const llmService = new LLMService();
    const candidates = await llmService.extractActions(text);

    return { candidates };
  } catch (error) {
    console.error("API Error extracting actions:", error);
    return Response.json({ error: "Failed to extract actions" }, { status: 500 });
  }
} 