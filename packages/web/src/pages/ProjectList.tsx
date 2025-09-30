import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api';
import type { Project } from '@/types';

export const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.list();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    const name = prompt('Project name:');
    if (!name) return;

    const description = prompt('Project description (optional):');

    try {
      const project = await projectsApi.create({ name, description: description || undefined });
      navigate(`/project/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project');
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete project "${projectName}"?`)) return;

    try {
      await projectsApi.delete(projectId);
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-node-root">Vislzr Projects</h1>
          <button
            onClick={createProject}
            className="bg-node-active hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + New Project
          </button>
        </div>

        {error && (
          <div className="bg-node-error bg-opacity-20 border border-node-error text-node-error px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No projects yet</p>
            <button
              onClick={createProject}
              className="bg-node-active hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <h2 className="text-xl font-semibold text-white group-hover:text-node-active transition-colors">
                      {project.name}
                    </h2>
                    {project.description && (
                      <p className="text-gray-400 mt-2">{project.description}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteProject(project.id, project.name)}
                    className="text-gray-400 hover:text-node-error transition-colors px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};