import os
import json
import google.generativeai as genai
from typing import Dict, List, Any
from .schemas import GraphData, NodeData, EdgeData

class AIService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_graph_from_prompt(self, prompt: str, project_id: str) -> GraphData:
        """Generate a graph structure from a natural language prompt using Google GenAI"""
        
        system_prompt = """
        You are a graph structure generator. Given a natural language description, 
        generate a graph with nodes and edges that represents the described structure.
        
        Return ONLY valid JSON in this exact format:
        {
            "nodes": [
                {"id": "unique_id", "label": "Node Label", "status": "ok|focus|blocked|overdue", "priority": 1-4, "tags": ["tag1", "tag2"]}
            ],
            "edges": [
                {"source": "node_id", "target": "node_id", "kind": "depends|relates|subtask"}
            ]
        }
        
        Guidelines:
        - Create meaningful node IDs (lowercase, underscores)
        - Set appropriate status: "ok" for normal, "focus" for important, "blocked" for dependencies, "overdue" for urgent
        - Priority: 1=low, 2=medium, 3=high, 4=critical
        - Use edge kinds: "depends" for dependencies, "relates" for relationships, "subtask" for hierarchies
        - Generate a complete, logical graph structure based on the prompt
        """
        
        full_prompt = f"{system_prompt}\n\nUser request: {prompt}"
        
        try:
            response = await self.model.generate_content_async(full_prompt)
            
            # Parse the response
            response_text = response.text.strip()
            
            # Try to extract JSON from the response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            graph_data = json.loads(response_text)
            
            # Convert to our schema
            nodes = []
            for node in graph_data.get("nodes", []):
                nodes.append(NodeData(
                    id=node["id"],
                    label=node["label"],
                    status=node.get("status", "ok"),
                    priority=node.get("priority", 2),
                    tags=node.get("tags", [])
                ))
            
            edges = []
            for edge in graph_data.get("edges", []):
                edges.append(EdgeData(
                    source=edge["source"],
                    target=edge["target"],
                    kind=edge.get("kind", "relates"),
                    weight=edge.get("weight", 1.0)
                ))
            
            return GraphData(
                project={"id": project_id, "name": "AI Generated"},
                nodes=nodes,
                edges=edges,
                milestones=[]
            )
            
        except Exception as e:
            # Fallback to a simple example if generation fails
            print(f"AI generation error: {e}")
            return self._create_fallback_graph(prompt, project_id)
    
    def _create_fallback_graph(self, prompt: str, project_id: str) -> GraphData:
        """Create a simple fallback graph if AI generation fails"""
        
        # Simple keyword-based generation
        nodes = []
        edges = []
        
        if "web" in prompt.lower() or "app" in prompt.lower():
            nodes = [
                NodeData(id="frontend", label="Frontend", status="ok", priority=3, tags=["ui"]),
                NodeData(id="backend", label="Backend", status="ok", priority=3, tags=["api"]),
                NodeData(id="database", label="Database", status="ok", priority=2, tags=["data"]),
                NodeData(id="deployment", label="Deployment", status="blocked", priority=1, tags=["ops"])
            ]
            edges = [
                EdgeData(source="frontend", target="backend", kind="depends"),
                EdgeData(source="backend", target="database", kind="depends"),
                EdgeData(source="frontend", target="deployment", kind="relates"),
                EdgeData(source="backend", target="deployment", kind="relates")
            ]
        elif "project" in prompt.lower() or "plan" in prompt.lower():
            nodes = [
                NodeData(id="planning", label="Planning", status="ok", priority=4, tags=["phase"]),
                NodeData(id="design", label="Design", status="ok", priority=3, tags=["phase"]),
                NodeData(id="development", label="Development", status="focus", priority=4, tags=["phase"]),
                NodeData(id="testing", label="Testing", status="blocked", priority=3, tags=["phase"]),
                NodeData(id="launch", label="Launch", status="blocked", priority=2, tags=["phase"])
            ]
            edges = [
                EdgeData(source="planning", target="design", kind="depends"),
                EdgeData(source="design", target="development", kind="depends"),
                EdgeData(source="development", target="testing", kind="depends"),
                EdgeData(source="testing", target="launch", kind="depends")
            ]
        else:
            # Generic structure
            nodes = [
                NodeData(id="task1", label="Research", status="ok", priority=3, tags=["task"]),
                NodeData(id="task2", label="Analysis", status="focus", priority=4, tags=["task"]),
                NodeData(id="task3", label="Implementation", status="blocked", priority=3, tags=["task"]),
                NodeData(id="task4", label="Review", status="blocked", priority=2, tags=["task"])
            ]
            edges = [
                EdgeData(source="task1", target="task2", kind="depends"),
                EdgeData(source="task2", target="task3", kind="depends"),
                EdgeData(source="task3", target="task4", kind="depends")
            ]
        
        return GraphData(
            project={"id": project_id, "name": "AI Generated (Fallback)"},
            nodes=nodes,
            edges=edges,
            milestones=[]
        )

# Singleton instance
ai_service = None

def get_ai_service():
    global ai_service
    if ai_service is None:
        try:
            ai_service = AIService()
        except ValueError as e:
            print(f"AI Service initialization failed: {e}")
            # Return None if API key is not configured
            return None
    return ai_service