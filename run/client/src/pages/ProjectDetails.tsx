import { useRoute, Link } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useCreateAudit } from "@/hooks/use-audits";
import { CyberLayout } from "@/components/CyberLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, GitBranch, ArrowLeft, Clock, AlertOctagon } from "lucide-react";
import { format } from "date-fns";

export default function ProjectDetails() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = params ? parseInt(params.id) : 0;
  
  const { data: project, isLoading } = useProject(projectId);
  const { mutate: startAudit, isPending: isStarting } = useCreateAudit();

  if (isLoading) {
    return (
      <CyberLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full bg-card/20" />
          <Skeleton className="h-64 w-full bg-card/20" />
        </div>
      </CyberLayout>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <CyberLayout>
      {/* Header */}
      <div className="space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO DASHBOARD
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/20 pb-8 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display font-bold text-white tracking-widest uppercase glow-text">
                {project.name}
              </h1>
              <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono border border-border uppercase">
                {project.type}
              </span>
            </div>
            <a 
              href={project.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-primary/80 hover:text-primary font-mono text-sm"
            >
              <GitBranch className="w-4 h-4" />
              {project.repoUrl}
            </a>
          </div>

          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/80 text-black font-bold font-mono tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            onClick={() => startAudit({ projectId })}
            disabled={isStarting}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            {isStarting ? "INITIALIZING..." : "INITIATE AUDIT"}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/30 border-primary/10">
            <CardContent className="p-6">
              <p className="text-xs font-mono text-muted-foreground uppercase">Total Audits</p>
              <p className="text-2xl font-display text-white">{project.audits?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-primary/10">
            <CardContent className="p-6">
              <p className="text-xs font-mono text-muted-foreground uppercase">Last Scan</p>
              <p className="text-2xl font-display text-white">
                {project.audits?.[0] ? format(new Date(project.audits[0].createdAt), 'MMM dd') : 'N/A'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-primary/10">
            <CardContent className="p-6">
              <p className="text-xs font-mono text-muted-foreground uppercase">System Status</p>
              <p className="text-2xl font-display text-primary">SECURE</p>
            </CardContent>
          </Card>
        </div>

        {/* Audits List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-display tracking-wide text-white">AUDIT LOGS</h3>
          </div>

          <div className="space-y-3">
            {project.audits?.map((audit) => (
              <Link key={audit.id} href={`/audits/${audit.id}`}>
                <div className="group flex items-center justify-between p-4 bg-card/40 border border-white/5 hover:border-primary/50 hover:bg-card/60 rounded-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                      <AlertOctagon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors">
                        AUDIT #{audit.id.toString().padStart(4, '0')}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {format(new Date(audit.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="hidden md:block text-sm font-mono text-muted-foreground max-w-md truncate">
                      {audit.summary || "Pending analysis..."}
                    </p>
                    <StatusBadge status={audit.status} animate />
                  </div>
                </div>
              </Link>
            ))}

            {(!project.audits || project.audits.length === 0) && (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-lg bg-white/5">
                <p className="text-muted-foreground font-mono">NO AUDIT RECORDS FOUND</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
