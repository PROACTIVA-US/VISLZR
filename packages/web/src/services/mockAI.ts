import type { GraphData } from "./schema";

// Mock AI implementation for development
// In production, this would be handled by the backend
export function generateMockGraph(prompt: string): GraphData {
  const words = prompt.toLowerCase().split(" ");
  
  // Extract potential node topics from the prompt
  const topics = [];
  
  if (prompt.includes("web") || prompt.includes("app")) {
    topics.push(
      { id: "frontend", label: "Frontend", status: "ok", priority: 3 },
      { id: "backend", label: "Backend", status: "ok", priority: 3 },
      { id: "database", label: "Database", status: "ok", priority: 2 },
      { id: "api", label: "API Design", status: "ok", priority: 3 },
      { id: "ui", label: "UI/UX Design", status: "focus", priority: 4 },
      { id: "auth", label: "Authentication", status: "ok", priority: 2 },
      { id: "deploy", label: "Deployment", status: "blocked", priority: 1 },
      { id: "testing", label: "Testing", status: "ok", priority: 2 }
    );
  } else if (prompt.includes("project") || prompt.includes("plan")) {
    topics.push(
      { id: "planning", label: "Planning", status: "ok", priority: 4 },
      { id: "design", label: "Design", status: "ok", priority: 3 },
      { id: "development", label: "Development", status: "focus", priority: 4 },
      { id: "testing", label: "Testing", status: "ok", priority: 3 },
      { id: "review", label: "Review", status: "blocked", priority: 2 },
      { id: "launch", label: "Launch", status: "blocked", priority: 1 }
    );
  } else if (prompt.includes("machine learning") || prompt.includes("ml") || prompt.includes("ai")) {
    topics.push(
      { id: "data-collection", label: "Data Collection", status: "ok", priority: 4 },
      { id: "data-prep", label: "Data Preparation", status: "ok", priority: 3 },
      { id: "feature-eng", label: "Feature Engineering", status: "focus", priority: 3 },
      { id: "model-select", label: "Model Selection", status: "ok", priority: 3 },
      { id: "training", label: "Training", status: "ok", priority: 4 },
      { id: "evaluation", label: "Evaluation", status: "ok", priority: 3 },
      { id: "optimization", label: "Optimization", status: "blocked", priority: 2 },
      { id: "deployment", label: "Deployment", status: "blocked", priority: 2 }
    );
  } else {
    // Generic graph structure
    topics.push(
      { id: "task1", label: "Research", status: "ok", priority: 3 },
      { id: "task2", label: "Analysis", status: "focus", priority: 4 },
      { id: "task3", label: "Implementation", status: "ok", priority: 3 },
      { id: "task4", label: "Validation", status: "blocked", priority: 2 },
      { id: "task5", label: "Documentation", status: "ok", priority: 1 }
    );
  }

  // Generate edges based on node relationships
  const edges = [];
  for (let i = 0; i < topics.length - 1; i++) {
    // Sequential dependencies
    edges.push({
      source: topics[i].id,
      target: topics[i + 1].id,
      kind: "depends"
    });
    
    // Add some cross-connections for complexity
    if (i > 0 && i < topics.length - 2) {
      if (Math.random() > 0.5) {
        edges.push({
          source: topics[i].id,
          target: topics[i + 2].id,
          kind: "relates"
        });
      }
    }
  }

  return {
    project: {
      id: "generated",
      name: "AI Generated",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    nodes: topics,
    edges: edges
  };
}