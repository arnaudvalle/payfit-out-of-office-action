import { VEvent, sync as icalSync } from "node-ical";
import { getEmployeesFromEvents, getEventsForEmployees } from "../src/helpers";

// Some helper to easily get parsed VEvent - this is what a parsed ICS file would return as well via node-ical
const getMockVEvents = (
  eventsOptions: {
    employee: string;
    startIsToday: boolean;
    endIsToday: boolean;
  }[],
) => {
  const body: string[] = [];
  /*
    ISO string format is YYYY-MM-DDTHH:mm.sssZ
    Then get rid of the hyphens and the stuff we don't care about to turn it into YYYYMMDD
  */
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const notToday = new Date(1995, 11, 17)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  for (const { employee, startIsToday, endIsToday } of eventsOptions) {
    const startDate = startIsToday ? today : notToday;
    const endDate = endIsToday ? today : notToday;

    body.push(`
BEGIN:VEVENT
SUMMARY:Absence - ${employee}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
DESCRIPTION:
END:VEVENT`);
  }

  // We never add VCalendar or VTimezone for our mocks so force the type to what we actually want it to be
  return Object.values(icalSync.parseICS(body.join(""))) as VEvent[];
};

describe("getEmployeesFromEvents", () => {
  it("returns a unique list of names", async () => {
    const result = getEmployeesFromEvents(
      getMockVEvents([
        { employee: "Geralt OF RIVIA", startIsToday: true, endIsToday: false },
        { employee: "Ciri OF CINTRA", startIsToday: true, endIsToday: false },
        { employee: "Geralt OF RIVIA", startIsToday: true, endIsToday: true },
        { employee: "Ciri OF CINTRA", startIsToday: true, endIsToday: true },
      ]),
    );

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining(["Geralt OF RIVIA", "Ciri OF CINTRA"]),
    );
  });
});
