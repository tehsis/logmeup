import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { z  } from "zod"

const todoCandidateSchema =  z.object({
  text: z.string().describe("Todo action item"),
  confidence: z.number().describe("The confidence level")
})

export interface TodoCandidate {
  text: string;
  confidence: number;
}

export class LLMService {
  private model: ChatOllama;
  private prompt: ChatPromptTemplate;
  private outputParser: JsonOutputParser<TodoCandidate[]>;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "llama3",
    });

    this.prompt =  ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a personal assistant that identifies and suggests action items from text. Return only a JSON array of objects with 'text' and 'confidence' fields."
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "Extract action items from this text. Include items that follow 'TODO'. {text}"
      ),
    ]);

    this.outputParser = new JsonOutputParser();
  }

  async extractTodos(text: string): Promise<TodoCandidate[]> {
    try {
      const chain = this.prompt.pipe(this.model).pipe(this.outputParser);
      const response = await chain.invoke({ text });
      // Parse the response and handle potential errors
      return response.map((item: any) => ({
        text: item.text,
        confidence: item.confidence
      }));
    } catch (error) {
      console.error("Error extracting todos:", error);
      console.log("WOO")
      return [];
    }
  }
} 