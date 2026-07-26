import { describe, expect, it } from "vitest";
import { describeTripStarted, formatPrettyTimeSpan } from "./import-history";

describe("formatPrettyTimeSpan (PrettyTimeSpan.cshtml bucket ladder)", () => {
  const cases: Array<[number, string]> = [
    [0, "today"],
    [0.5, "today"],
    [1, "yesterday"],
    [1.9, "yesterday"],
    [2, "two days ago"],
    [3, "three days ago"],
    [4, "this week"],
    [7.9, "this week"],
    [8, "last week"],
    [14.9, "last week"],
    [15, "two weeks ago"],
    [21.9, "two weeks ago"],
    [22, "this month"],
    [30.9, "this month"],
    [31, "last month"],
    [60.9, "last month"],
    [61, "two months ago"],
    [90.9, "two months ago"],
    [91, "three months ago"],
    [120.9, "three months ago"],
    [121, "four months ago"],
    [150.9, "four months ago"],
    [151, "five months ago"],
    [180.9, "five months ago"],
    [181, "six months ago"],
    [220.9, "six months ago"],
    [221, "this year"],
    [365.9, "this year"],
    [366, "last year"],
    [730.9, "last year"],
    [731, "two years ago"],
    [1095.9, "two years ago"],
    [1096, "three years ago"],
    [1460.9, "three years ago"],
    [1461, "four years ago"],
    [1825.9, "four years ago"],
    [1826, "five years ago"],
    [2190.9, "five years ago"],
    [2191, "six years ago"],
    [2555.9, "six years ago"],
    [2556, "over six years ago"],
    [10000, "over six years ago"],
  ];

  it.each(cases)("totalDays=%s -> %s", (totalDays, expected) => {
    expect(formatPrettyTimeSpan(totalDays)).toBe(expected);
  });

  it("treats a negative/future totalDays the same as 'today' (no explicit legacy branch for it either)", () => {
    expect(formatPrettyTimeSpan(-5)).toBe("today");
  });

  it("treats NaN as 'today' (defensive; legacy has no branch for it)", () => {
    expect(formatPrettyTimeSpan(NaN)).toBe("today");
  });
});

describe("describeTripStarted", () => {
  it("computes fractional TotalDays from two Dates and feeds the ladder", () => {
    const created = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-09T12:00:00Z"); // 8.5 days later -> "last week"
    expect(describeTripStarted(created, now)).toBe("last week");
  });

  it("today for a just-created trip", () => {
    const created = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-01T00:00:01Z");
    expect(describeTripStarted(created, now)).toBe("today");
  });
});
