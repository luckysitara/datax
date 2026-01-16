import { useProjects } from "@/hooks/use-projects";
import { CyberLayout } from "@/components/CyberLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, FolderGit2, ShieldCheck, Activity, Box } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();

  // Mock data for the chart since we don't have aggregate stats endpoint yet
  // In a real app, this would be computed from data or fetched
  const chartData = [
    { name: 'Critical', value: 4, color: '#ff0000' },
    { name: 'High', value: 7, color: '#ff8800' },
    { name: 'Medium', value: 12, color: '#ffee00' },
    { name: 'Low', value: 23, color: '#0088ff' },
  ];

  if (isLoading) {
    return (
      <CyberLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-card/20 rounded-xl" />
          ))}
        </div>
      </CyberLayout>
    );
  }

  const recentProjects = projects?.slice(0, 4) || [];

  return (
    <CyberLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-wider">COMMAND CENTER</h2>
          <p className="text-muted-foreground font-mono mt-1">SYSTEM OVERVIEW & RECENT OPERATIONS</p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-primary/20 backdrop-blur">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-muted-foreground uppercase">Active Targets</p>
              <p className="text-3xl font-display font-bold text-white mt-1">{projects?.length || 0}</p>
            </div>
            <Box className="w-8 h-8 text-primary opacity-50" />
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 border-primary/20 backdrop-blur">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-muted-foreground uppercase">Threats Detected</p>
              <p className="text-3xl font-display font-bold text-destructive mt-1">46</p>
            </div>
            <Activity className="w-8 h-8 text-destructive opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-primary/20 backdrop-blur md:col-span-2">
          <CardContent className="p-0 h-32 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <XAxis dataKey="name" hide />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                    itemStyle={{ fontFamily: 'monospace' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 />
                 <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <FolderGit2 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-display tracking-wide text-white">RECENT OPERATIONS</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group block">
              <Card className="cyber-card h-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-display text-primary group-hover:text-white transition-colors">
                        {project.name}
                      </CardTitle>
                      <p className="text-xs font-mono text-muted-foreground">{project.type.toUpperCase()} ARCHITECTURE</p>
                    </div>
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-mono">
                    {project.description || "No mission brief available."}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground border-t border-white/5 pt-4">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      ID: {project.id.toString().padStart(4, '0')}
                    </span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {recentProjects.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-muted-foreground font-mono">NO ACTIVE TARGETS FOUND</p>
              <div className="mt-4">
                <CreateProjectDialog />
              </div>
            </div>
          )}
        </div>
      </div>
    </CyberLayout>
  );
}
