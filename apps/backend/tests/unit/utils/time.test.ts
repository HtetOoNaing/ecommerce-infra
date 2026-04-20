import { seconds, minutes, hours, days } from "@/utils/time";

describe("Time Utils", () => {
  it("seconds(n) returns n", () => {
    expect(seconds(30)).toBe(30);
  });

  it("minutes(n) returns n * 60", () => {
    expect(minutes(5)).toBe(300);
  });

  it("hours(n) returns n * 3600", () => {
    expect(hours(2)).toBe(7200);
  });

  it("days(n) returns n * 86400", () => {
    expect(days(1)).toBe(86400);
    expect(days(7)).toBe(604800);
  });
});
