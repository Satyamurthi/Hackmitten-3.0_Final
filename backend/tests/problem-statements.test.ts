import { describe, it, expect } from "bun:test";
import { z } from "zod";
import { can } from "../src/lib/permissions";

const VALID_DEGREES = ["Diploma", "UG", "PG"] as const;

const problemStatementCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  degrees: z
    .array(z.enum(VALID_DEGREES))
    .min(1, "At least one applicable category (Diploma, UG, PG) must be selected"),
  domainId: z.string().trim().nullable().optional(),
  isPublished: z.boolean().default(true),
});

describe("Problem Statement Validation & Categories", () => {
  it("accepts a valid problem statement for UG only", () => {
    const res = problemStatementCreateSchema.safeParse({
      title: "AI-Powered Intrusion Detection",
      description: "Develop a real-time anomaly detection system using deep learning.",
      degrees: ["UG"],
      isPublished: true,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.degrees).toEqual(["UG"]);
    }
  });

  it("accepts a problem statement spanning multiple categories (Diploma, UG, PG)", () => {
    const res = problemStatementCreateSchema.safeParse({
      title: "Cloud Infrastructure Automated Disaster Recovery",
      description: "Build an automated multi-region failover and replication pipeline.",
      degrees: ["Diploma", "UG", "PG"],
      isPublished: true,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.degrees.length).toBe(3);
    }
  });

  it("rejects when no degree category is selected", () => {
    const res = problemStatementCreateSchema.safeParse({
      title: "Cyber Security Forensics Framework",
      description: "Analyze kernel traces to discover zero-day vulnerabilities.",
      degrees: [],
    });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid degree category", () => {
    const res = problemStatementCreateSchema.safeParse({
      title: "Quantum Key Distribution",
      description: "Implement quantum key generation and verification protocols.",
      degrees: ["PhD" as any],
    });
    expect(res.success).toBe(false);
  });

  it("rejects short title or description", () => {
    const res1 = problemStatementCreateSchema.safeParse({
      title: "AB",
      description: "Too short description",
      degrees: ["UG"],
    });
    expect(res1.success).toBe(false);

    const res2 = problemStatementCreateSchema.safeParse({
      title: "Valid Title Here",
      description: "Short",
      degrees: ["UG"],
    });
    expect(res2.success).toBe(false);
  });
});

describe("Problem Statement Permissions", () => {
  it("allows SUPER_ADMIN to manage problem statements", () => {
    expect(can("SUPER_ADMIN", "problem:manage")).toBe(true);
    expect(can("SUPER_ADMIN", "config:view")).toBe(true);
  });

  it("disallows COORDINATOR, FOOD_ADMIN, and PARTICIPANT from managing problem statements", () => {
    expect(can("COORDINATOR", "problem:manage")).toBe(false);
    expect(can("FOOD_ADMIN", "problem:manage")).toBe(false);
    expect(can("PARTICIPANT", "problem:manage")).toBe(false);
  });
});
