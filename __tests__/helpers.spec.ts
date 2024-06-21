import { sync as icalSync } from "node-ical";

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

  return Object.values(icalSync.parseICS(body.join("")));
};
