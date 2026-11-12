export const skillGroups = {
  ml: {
    title: "Machine learning",
    nodes: ["Python", "Scikit-Learn", "NumPy", "FastAPI"],
    tools: "Python · Scikit-Learn · NumPy · Pandas · TF-IDF · LinearSVC",
  },
  ai: {
    title: "Generative AI",
    nodes: ["n8n", "Qdrant", "Ollama", "OpenRouter"],
    tools: "RAG · n8n · Qdrant · Gemini API · Ollama · OpenRouter",
  },
  web: {
    title: "Backend & web",
    nodes: ["Next.js", "FastAPI", "PostgreSQL", "Docker"],
    tools: "Next.js · FastAPI · REST APIs · PostgreSQL · Docker",
  },
} as const;
export type SkillGroup = keyof typeof skillGroups;
