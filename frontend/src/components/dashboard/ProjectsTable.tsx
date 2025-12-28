import { MoreHorizontal } from "lucide-react";
import { useProjects } from "@/hooks/useData";

const ProjectsTable = () => {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.7s" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-foreground font-semibold">Projects</h3>
          <p className="text-muted-foreground text-xs">30 done this month</p>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="pb-4 font-medium">Companies</th>
              <th className="pb-4 font-medium">Members</th>
              <th className="pb-4 font-medium">Budget</th>
              <th className="pb-4 font-medium">Completion</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {projects?.map((project, index) => (
              <tr key={index} className="border-t border-border/30">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-foreground font-medium">{project.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((_, i) => (
                      <div 
                        key={i}
                        className="w-6 h-6 rounded-full bg-muted border-2 border-card"
                      />
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center">
                        <span className="text-[10px] text-primary">+{project.members.length - 4}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 text-foreground">{project.budget}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-xs font-medium w-8">{project.completion}%</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-20">
                      <div 
                        className="h-full gradient-coral rounded-full transition-all duration-500"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsTable;