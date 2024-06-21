import { VEvent, sync as icalSync } from "node-ical";
import { getEmployeesFromEvents } from "../src/helpers";

// Some helper to easily get parsed VEvent - this is what a parsed ICS file would return as well via node-ical
const getMockVEvents = (eventsOptions: [string, boolean][]) => {
  const body: string[] = [];
  // ISO string format is YYYY-MM-DDTHH:mm.sssZ - the get rid of the hyphens and the stuff we don't care about
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const notToday = new Date(1995, 11, 17)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  for (const [name, isToday] of eventsOptions) {
    const date = isToday ? today : notToday;

    body.push(`
BEGIN:VEVENT
SUMMARY:Absence - ${name}
DTSTART;VALUE=DATE:${date}
DTEND;VALUE=DATE:${date}
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
        ["Geralt OF RIVIA", true],
        ["Ciri OF CINTRA", true],
        ["Geralt OF RIVIA", true],
      ]),
    );

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining(["Geralt OF RIVIA", "Ciri OF CINTRA"]),
    );
  });
});
