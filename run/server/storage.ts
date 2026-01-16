import { db } from "./db";
import {
  projects, audits, vulnerabilities, reports,
  type InsertProject, type InsertAudit, type InsertVulnerability, type InsertReport,
  type Project, type Audit, type Vulnerability, type Report,
  type ProjectWithAudits, type AuditWithVulnerabilities
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat/storage";

export interface IStorage extends IAuthStorage, IChatStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<ProjectWithAudits | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;

  // Audits
  createAudit(audit: InsertAudit): Promise<Audit>;
  getAudit(id: number): Promise<AuditWithVulnerabilities | undefined>;
  updateAuditStatus(id: number, status: string): Promise<Audit>;
  
  // Vulnerabilities
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  getVulnerabilitiesByAudit(auditId: number): Promise<Vulnerability[]>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReportByAudit(auditId: number): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Inherit methods from authStorage and chatStorage
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);
  getConversation = chatStorage.getConversation.bind(chatStorage);
  getAllConversations = chatStorage.getAllConversations.bind(chatStorage);
  createConversation = chatStorage.createConversation.bind(chatStorage);
  deleteConversation = chatStorage.deleteConversation.bind(chatStorage);
  getMessagesByConversation = chatStorage.getMessagesByConversation.bind(chatStorage);
  createMessage = chatStorage.createMessage.bind(chatStorage);

  // Projects
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async getProject(id: number): Promise<ProjectWithAudits | undefined> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        audits: {
          orderBy: desc(audits.createdAt),
        }
      }
    });
    return project;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  // Audits
  async createAudit(insertAudit: InsertAudit): Promise<Audit> {
    const [audit] = await db.insert(audits).values(insertAudit).returning();
    return audit;
  }

  async getAudit(id: number): Promise<AuditWithVulnerabilities | undefined> {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, id),
      with: {
        vulnerabilities: true,
        project: true
      }
    });
    // @ts-ignore - type inference for deep relations can be tricky, but runtime is fine
    return audit;
  }

  async updateAuditStatus(id: number, status: "pending" | "running" | "completed" | "failed"): Promise<Audit> {
    const [audit] = await db.update(audits)
      .set({ status })
      .where(eq(audits.id, id))
      .returning();
    return audit;
  }

  // Vulnerabilities
  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [vulnerability] = await db.insert(vulnerabilities).values(insertVulnerability).returning();
    return vulnerability;
  }

  async getVulnerabilitiesByAudit(auditId: number): Promise<Vulnerability[]> {
    return db.select().from(vulnerabilities).where(eq(vulnerabilities.auditId, auditId));
  }

  // Reports
  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async getReportByAudit(auditId: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.auditId, auditId));
    return report;
  }
}

export const storage = new DatabaseStorage();
