import { useState, useEffect } from "react";
import { getGraph, addMilestone, patchMilestone, deleteMilestone } from "@/services/apiClient";
import type { Milestone } from "@/services/schema";

interface TimelineProps {
  projectId: string;
  onMilestoneSelect?: (milestone: Milestone) => void;
}

export function Timeline({ projectId, onMilestoneSelect }: TimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      const data = await getGraph(projectId);
      setMilestones(data.milestones || []);
    } catch (e) {
      console.error("Failed to load milestones:", e);
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingId(milestone.id);
    setEditTitle(milestone.title);
    setEditDate(milestone.date);
  };

  const handleSave = async (id: string) => {
    try {
      await patchMilestone(projectId, id, { 
        title: editTitle, 
        date: editDate 
      });
      setEditingId(null);
      loadMilestones();
    } catch (e) {
      console.error("Failed to update milestone:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      await deleteMilestone(projectId, id);
      loadMilestones();
    } catch (e) {
      console.error("Failed to delete milestone:", e);
    }
  };

  const handleStatusChange = async (id: string, status: Milestone["status"]) => {
    try {
      await patchMilestone(projectId, id, { status });
      loadMilestones();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getStatusColor = (status: Milestone["status"]) => {
    switch (status) {
      case "done": return "bg-green-600";
      case "pending": return "bg-yellow-600";
      case "planned": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Timeline</h3>
        <button
          onClick={async () => {
            const id = `milestone-${Date.now()}`;
            const title = prompt("Milestone title:");
            if (!title) return;
            const date = prompt("Date (YYYY-MM-DD):");
            if (!date) return;
            
            try {
              await addMilestone(projectId, {
                id,
                title,
                date,
                status: "planned"
              });
              loadMilestones();
            } catch (e) {
              console.error("Failed to add milestone:", e);
            }
          }}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          + Add Milestone
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-1/2 transform -translate-y-1/2" />
        
        {/* Milestones */}
        <div className="relative flex justify-between items-center min-h-[60px]">
          {sortedMilestones.length === 0 ? (
            <div className="text-gray-500 text-sm w-full text-center">No milestones yet</div>
          ) : (
            sortedMilestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="relative flex flex-col items-center cursor-pointer group"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedMilestone(milestone);
                  onMilestoneSelect?.(milestone);
                }}
              >
                {/* Milestone dot */}
                <div className={`w-4 h-4 rounded-full ${getStatusColor(milestone.status)} border-2 border-gray-900 z-10 group-hover:scale-125 transition-transform`} />
                
                {/* Milestone info */}
                <div className="absolute top-6 text-center">
                  {editingId === milestone.id ? (
                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-900 text-white text-xs px-1 py-0.5 rounded w-24 mb-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="bg-gray-900 text-white text-xs px-1 py-0.5 rounded w-24 mb-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(milestone.id);
                          }}
                          className="text-xs px-1 py-0.5 bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="text-xs px-1 py-0.5 bg-gray-600 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-medium text-white whitespace-nowrap">
                        {milestone.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(milestone.date).toLocaleDateString()}
                      </div>
                      
                      {/* Action buttons on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(milestone);
                          }}
                          className="text-xs px-1 py-0.5 bg-blue-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <select
                          value={milestone.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(milestone.id, e.target.value as Milestone["status"]);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs px-1 py-0.5 bg-gray-700 text-white rounded"
                        >
                          <option value="planned">Planned</option>
                          <option value="pending">Pending</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(milestone.id);
                          }}
                          className="text-xs px-1 py-0.5 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}