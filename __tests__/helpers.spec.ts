import { VEvent, sync as icalSync } from "node-ical";
import * as core from "@actions/core";
import { getEmployeesFromEvents, getEventsForEmployees } from "../src/helpers";

// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>;

jest.useFakeTimers();
jest.setSystemTime(new Date('2024-04-29T00:00:00Z'));

// Some helper to easily get parsed VEvent - this is what a parsed ICS file would return as well via node-ical
const getMockVEvents = (
  eventsOptions: {
    employee: string;
    start: Date;
    end: Date;
  }[],
) => {
  const body: string[] = [];

  for (const { employee, start, end } of eventsOptions) {
    /*
      Date formatting explained:
      ISO string format is YYYY-MM-DDTHH:mm.sssZ
      Then get rid of the hyphens and the stuff we don't care about to turn it into YYYYMMDD
    */
    body.push(`
BEGIN:VEVENT
SUMMARY:Absence - ${employee}
DTSTART;VALUE=DATE:${start.toISOString().slice(0, 10).replace(/-/g, "")}
DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, "")}
DESCRIPTION:
END:VEVENT`);
  }

  // We never add VCalendar or VTimezone for our mocks so force the type to what we actually want it to be
  return Object.values(icalSync.parseICS(body.join(""))) as VEvent[];
};

const today = new Date();

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const future = new Date();
future.setDate(today.getDate() + 7);

const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const past = new Date();
past.setDate(today.getDate() - 7);

beforeEach(() => {
  jest.clearAllMocks();

  infoMock = jest.spyOn(core, "info").mockImplementation();
});

describe("getEventsForEmployees", () => {
  it("only returns today's events for the requested employees", () => {
    const result = getEventsForEmployees(
      getMockVEvents([
        {
          employee: "Yennefer OF VENGERBERG",
          start: today,
          end: tomorrow,
        },
        { employee: "Geralt OF RIVIA", start: today, end: tomorrow },
        { employee: "Ciri OF CINTRA", start: today, end: tomorrow },
      ]),
      ["Ciri OF CINTRA"],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summary).toContain("Ciri OF CINTRA");
  });

  it("returns events that start today", () => {
    const result = getEventsForEmployees(
      getMockVEvents([
        { employee: "Ciri OF CINTRA", start: past, end: yesterday },
        { employee: "Ciri OF CINTRA", start: tomorrow, end: future },
        { employee: "Ciri OF CINTRA", start: today, end: today },
        { employee: "Ciri OF CINTRA", start: today, end: tomorrow },
        { employee: "Ciri OF CINTRA", start: today, end: future },
      ]),
      ["Ciri OF CINTRA"],
    );

    expect(result).toHaveLength(3);
  });

  // If it ends tomorrow, it means today is the last day of the event
  it("returns events that end tomorrow", () => {
    const result = getEventsForEmployees(
      getMockVEvents([
        { employee: "Ciri OF CINTRA", start: past, end: past },
        { employee: "Ciri OF CINTRA", start: past, end: yesterday },
        { employee: "Ciri OF CINTRA", start: past, end: today },
        { employee: "Ciri OF CINTRA", start: past, end: tomorrow },
        { employee: "Ciri OF CINTRA", start: yesterday, end: tomorrow },
        { employee: "Ciri OF CINTRA", start: today, end: tomorrow },
      ]),
      ["Ciri OF CINTRA"],
    );

    expect(result).toHaveLength(3);
  });

  it("returns events that started in the past and end in the future", () => {
    const result = getEventsForEmployees(
      getMockVEvents([
        { employee: "Ciri OF CINTRA", start: past, end: past },
        { employee: "Ciri OF CINTRA", start: yesterday, end: future },
        { employee: "Ciri OF CINTRA", start: past, end: future },
      ]),
      ["Ciri OF CINTRA"],
    );

    expect(result).toHaveLength(2);
  });
});

describe("getEmployeesFromEvents", () => {
  it("returns a unique list of names", () => {
    const result = getEmployeesFromEvents(
      getMockVEvents([
        { employee: "Geralt OF RIVIA", start: today, end: past },
        { employee: "Ciri OF CINTRA", start: today, end: past },
        { employee: "Geralt OF RIVIA", start: today, end: today },
        { employee: "Ciri OF CINTRA", start: today, end: today },
      ]),
    );

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining(["Geralt OF RIVIA", "Ciri OF CINTRA"]),
    );
  });
});
