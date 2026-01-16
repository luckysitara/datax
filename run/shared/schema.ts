import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth and Chat models (REQUIRED for integrations)
export * from "./models/auth";
export * from "./models/chat";
import { users } from "./models/auth";

// Enums
export const projectTypeEnum = pgEnum("project_type", ["web2", "web3", "dlt"]);
export const auditStatusEnum = pgEnum("audit_status", ["pending", "running", "completed", "failed"]);
export const severityEnum = pgEnum("severity", ["critical", "high", "medium", "low"]);
export const reportFormatEnum = pgEnum("report_format", ["markdown", "pdf"]);

// === TABLE DEFINITIONS ===

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: projectTypeEnum("type").notNull(),
  repoUrl: text("repo_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  status: auditStatusEnum("status").default("pending").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").notNull().references(() => audits.id, { onDelete: 'cascade' }),
  severity: severityEnum("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  remediation: text("remediation").notNull(),
  pocCode: text("poc_code"), // The generated test/exploit code
  filePath: text("file_path"), // Location of vulnerability
  lineNumber: integer("line_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").notNull().references(() => audits.id, { onDelete: 'cascade' }),
  format: reportFormatEnum("format").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === RELATIONS ===

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  audits: many(audits),
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
  project: one(projects, {
    fields: [audits.projectId],
    references: [projects.id],
  }),
  vulnerabilities: many(vulnerabilities),
  reports: many(reports),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one }) => ({
  audit: one(audits, {
    fields: [vulnerabilities.auditId],
    references: [audits.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  audit: one(audits, {
    fields: [reports.auditId],
    references: [audits.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, userId: true, createdAt: true });
export const insertAuditSchema = createInsertSchema(audits).omit({ id: true, createdAt: true });
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Request types
export type CreateProjectRequest = InsertProject;
export type CreateAuditRequest = { projectId: number }; // Just need project ID to start audit

// Response types (with relations)
export type ProjectWithAudits = Project & { audits: Audit[] };
export type AuditWithVulnerabilities = Audit & { vulnerabilities: Vulnerability[] };

// Helper Types
export type ProjectType = z.infer<typeof insertProjectSchema>['type'];
export type AuditStatus = z.infer<typeof insertAuditSchema>['status'];
export type Severity = z.infer<typeof insertVulnerabilitySchema>['severity'];
