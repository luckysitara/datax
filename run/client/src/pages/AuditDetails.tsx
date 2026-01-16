import { useRoute, Link } from "wouter";
import { useAudit } from "@/hooks/use-audits";
import { CyberLayout } from "@/components/CyberLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AuditDetails() {
  const [match, params] = useRoute("/audits/:id");
  const auditId = params ? parseInt(params.id) : 0;
  const { data: audit, isLoading } = useAudit(auditId);

  if (isLoading) {
    return (
      <CyberLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full bg-card/20" />
          <Skeleton className="h-24 w-full bg-card/20" />
          <Skeleton className="h-64 w-full bg-card/20" />
        </div>
      </CyberLayout>
    );
  }

  if (!audit) return <div>Audit not found</div>;

  return (
    <CyberLayout>
      <div className="space-y-8">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link href={`/projects/${audit.projectId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
            <ArrowLeft className="w-4 h-4 mr-2" />
            RETURN TO PROJECT
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs">
              <Download className="w-4 h-4 mr-2" />
              EXPORT PDF
            </Button>
          </div>
        </div>

        {/* Audit Header */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-card/80 to-black border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-white tracking-widest mb-2">
                  AUDIT REPORT #{audit.id.toString().padStart(4, '0')}
                </h1>
                <p className="text-primary/80 font-mono text-lg">
                  TARGET: {audit.project.name}
                </p>
              </div>
              <StatusBadge status={audit.status} animate className="text-lg px-4 py-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Execution Time</p>
                <p className="text-lg font-mono text-white">
                  {format(new Date(audit.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Vulnerabilities Found</p>
                <p className="text-lg font-mono text-destructive">
                  {audit.vulnerabilities.length} THREATS
                </p>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Architecture</p>
                <p className="text-lg font-mono text-white uppercase">{audit.project.type}</p>
              </div>
            </div>

            {audit.summary && (
              <div className="bg-black/30 p-4 rounded border-l-2 border-primary mt-6">
                <p className="font-mono text-sm text-gray-300 leading-relaxed">
                  {audit.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Running State */}
        {audit.status === "running" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed border-primary/30 rounded-xl bg-primary/5">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xl font-display text-white tracking-widest">ANALYSIS IN PROGRESS</p>
              <p className="text-sm font-mono text-muted-foreground">Scanning codebase for vulnerabilities...</p>
            </div>
            <div className="w-64 h-1 bg-black/50 rounded overflow-hidden mt-4">
              <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]" style={{ width: '50%' }} />
            </div>
          </div>
        )}

        {/* Vulnerabilities List */}
        {audit.status === "completed" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold text-white">DETECTED VULNERABILITIES</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
              </div>
            </div>

            <div className="grid gap-6">
              {audit.vulnerabilities.map((vuln) => (
                <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
              ))}

              {audit.vulnerabilities.length === 0 && (
                <div className="text-center py-12 border border-white/10 rounded-xl bg-green-500/5">
                  <p className="text-green-500 font-display text-xl mb-2">SYSTEM SECURE</p>
                  <p className="text-muted-foreground font-mono">No significant vulnerabilities detected during this scan.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CyberLayout>
  );
}
