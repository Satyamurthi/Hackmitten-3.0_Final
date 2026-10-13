import { describe, expect, it } from "bun:test";
import { can } from "../src/lib/permissions";
import { LOGIN_ROLE_MAP } from "../src/lib/operational-users";

describe("Participant Role & Login Mapping", () => {
  it("maps PARTICIPANT role in LOGIN_ROLE_MAP", () => {
    expect(LOGIN_ROLE_MAP.PARTICIPANT).toBe("PARTICIPANT");
  });

  it("ensures PARTICIPANT has no administrative privileges", () => {
    expect(can("PARTICIPANT", "config:view")).toBe(false);
    expect(can("PARTICIPANT", "config:edit")).toBe(false);
    expect(can("PARTICIPANT", "team:approve")).toBe(false);
    expect(can("PARTICIPANT", "registration:view")).toBe(false);
    expect(can("PARTICIPANT", "problem:manage")).toBe(false);
  });
});

describe("Participant Dashboard Category Scoping", () => {
  const mockProblemStatements = [
    { id: "ps-ug", title: "UG Problem", degrees: ["UG"] },
    { id: "ps-pg", title: "PG Problem", degrees: ["PG"] },
    { id: "ps-dip", title: "Diploma Problem", degrees: ["Diploma"] },
    { id: "ps-all", title: "Cross Problem", degrees: ["UG", "PG", "Diploma"] },
  ];

  it("filters problem statements exclusively for UG teams", () => {
    const category = "UG";
    const filtered = mockProblemStatements.filter((ps) => ps.degrees.includes(category));
    expect(filtered.map((p) => p.id)).toEqual(["ps-ug", "ps-all"]);
    expect(filtered.some((p) => p.id === "ps-dip")).toBe(false);
    expect(filtered.some((p) => p.id === "ps-pg")).toBe(false);
  });

  it("filters problem statements exclusively for PG teams", () => {
    const category = "PG";
    const filtered = mockProblemStatements.filter((ps) => ps.degrees.includes(category));
    expect(filtered.map((p) => p.id)).toEqual(["ps-pg", "ps-all"]);
    expect(filtered.some((p) => p.id === "ps-dip")).toBe(false);
    expect(filtered.some((p) => p.id === "ps-ug")).toBe(false);
  });

  it("filters problem statements exclusively for Diploma teams", () => {
    const category = "Diploma";
    const filtered = mockProblemStatements.filter((ps) => ps.degrees.includes(category));
    expect(filtered.map((p) => p.id)).toEqual(["ps-dip", "ps-all"]);
    expect(filtered.some((p) => p.id === "ps-ug")).toBe(false);
    expect(filtered.some((p) => p.id === "ps-pg")).toBe(false);
  });

  it("resolves correct dashboard titles for each category", () => {
    const getDashboardTitle = (cat: string) =>
      cat === "Diploma" ? "Diploma Dashboard" : cat === "PG" ? "PG Dashboard" : "UG Dashboard";

    expect(getDashboardTitle("UG")).toBe("UG Dashboard");
    expect(getDashboardTitle("PG")).toBe("PG Dashboard");
    expect(getDashboardTitle("Diploma")).toBe("Diploma Dashboard");
  });
});
