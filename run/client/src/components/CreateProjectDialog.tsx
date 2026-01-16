import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import { useCreateProject } from "@/hooks/use-projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createProject, isPending } = useCreateProject();
  
  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      type: "web2",
      repoUrl: "",
      description: ""
    }
  });

  const onSubmit = (data: InsertProject) => {
    createProject(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <Plus className="w-4 h-4 mr-2" />
          NEW TARGET
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-primary/50 text-foreground backdrop-blur-xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display tracking-widest text-primary">INITIALIZE NEW TARGET</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary/80">Project Codename</FormLabel>
                  <FormControl>
                    <Input placeholder="PROJECT_ZEUS" {...field} className="cyber-input" />
                  </FormControl>
                  <FormMessage className="text-destructive font-mono text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary/80">Architecture Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="cyber-input">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black border-primary/50 text-foreground">
                      <SelectItem value="web2">Web2 (Standard)</SelectItem>
                      <SelectItem value="web3">Web3 (Smart Contracts)</SelectItem>
                      <SelectItem value="dlt">DLT Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-destructive font-mono text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary/80">Repository Uplink</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." {...field} className="cyber-input" />
                  </FormControl>
                  <FormMessage className="text-destructive font-mono text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary/80">Mission Brief</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the target parameters..." {...field} className="cyber-input resize-none" rows={3} />
                  </FormControl>
                  <FormMessage className="text-destructive font-mono text-xs" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all font-mono"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  INITIALIZING...
                </>
              ) : (
                "ENGAGE"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
