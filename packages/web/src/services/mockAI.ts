import type { GraphData, NodeStatus, NodePriority } from "@vislzr/shared";

// Mock AI implementation for development
// In production, this would be handled by the backend
export function generateMockGraph(prompt: string): GraphData {
  // Extract potential node topics from the prompt
  const topics = [];
  
  if (prompt.includes("web") || prompt.includes("app")) {
    topics.push(
      { id: "frontend", label: "Frontend", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "backend", label: "Backend", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "database", label: "Database", status: "IDLE" as NodeStatus, priority: 2 as NodePriority },
      { id: "api", label: "API Design", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "ui", label: "UI/UX Design", status: "IN_PROGRESS" as NodeStatus, priority: 4 as NodePriority },
      { id: "auth", label: "Authentication", status: "IDLE" as NodeStatus, priority: 2 as NodePriority },
      { id: "deploy", label: "Deployment", status: "BLOCKED" as NodeStatus, priority: 1 as NodePriority },
      { id: "testing", label: "Testing", status: "IDLE" as NodeStatus, priority: 2 as NodePriority }
    );
  } else if (prompt.includes("project") || prompt.includes("plan")) {
    topics.push(
      { id: "planning", label: "Planning", status: "IDLE" as NodeStatus, priority: 4 as NodePriority },
      { id: "design", label: "Design", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "development", label: "Development", status: "IN_PROGRESS" as NodeStatus, priority: 4 as NodePriority },
      { id: "testing", label: "Testing", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "review", label: "Review", status: "BLOCKED" as NodeStatus, priority: 2 as NodePriority },
      { id: "launch", label: "Launch", status: "BLOCKED" as NodeStatus, priority: 1 as NodePriority }
    );
  } else if (prompt.includes("machine learning") || prompt.includes("ml") || prompt.includes("ai")) {
    topics.push(
      { id: "data-collection", label: "Data Collection", status: "IDLE" as NodeStatus, priority: 4 as NodePriority },
      { id: "data-prep", label: "Data Preparation", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "feature-eng", label: "Feature Engineering", status: "IN_PROGRESS" as NodeStatus, priority: 3 as NodePriority },
      { id: "model-select", label: "Model Selection", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "training", label: "Training", status: "IDLE" as NodeStatus, priority: 4 as NodePriority },
      { id: "evaluation", label: "Evaluation", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "optimization", label: "Optimization", status: "BLOCKED" as NodeStatus, priority: 2 as NodePriority },
      { id: "deployment", label: "Deployment", status: "BLOCKED" as NodeStatus, priority: 2 as NodePriority }
    );
  } else {
    // Generic graph structure
    topics.push(
      { id: "task1", label: "Research", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "task2", label: "Analysis", status: "IN_PROGRESS" as NodeStatus, priority: 4 as NodePriority },
      { id: "task3", label: "Implementation", status: "IDLE" as NodeStatus, priority: 3 as NodePriority },
      { id: "task4", label: "Validation", status: "BLOCKED" as NodeStatus, priority: 2 as NodePriority },
      { id: "task5", label: "Documentation", status: "IDLE" as NodeStatus, priority: 1 as NodePriority }
    );
  }

  // Generate edges based on node relationships
  const edges = [];
  for (let i = 0; i < topics.length - 1; i++) {
    // Sequential dependencies
    edges.push({
      source: topics[i].id,
      target: topics[i + 1].id,
      kind: "depends" as const
    });

    // Add some cross-connections for complexity
    if (i > 0 && i < topics.length - 2) {
      if (Math.random() > 0.5) {
        edges.push({
          source: topics[i].id,
          target: topics[i + 2].id,
          kind: "relates" as const
        });
      }
    }
  }

  return {
    project: {
      id: "generated",
      name: "AI Generated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    nodes: topics,
    edges: edges
  };
}