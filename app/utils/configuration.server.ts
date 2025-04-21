export const configuration = {
    llm: {
        model: process.env.LLM_MODEL || "llama3",
        backend: process.env.LLM_BACKEND || "ollama",
        url: process.env.LLM_URL || "http://localhost:11434",
    },
};
