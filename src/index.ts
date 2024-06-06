import { VEvent, async as icalAsync } from "node-ical";

(async () => {
  try {
    if (!process.env?.CALENDAR_URL || process.env?.CALENDAR_URL === "") {
      throw new Error("CALENDAR_URL is missing");
    }

    const response = await icalAsync.fromURL(process.env.CALENDAR_URL);

    const events = Object.values(response).filter(
      (component): component is VEvent => component.type === "VEVENT",
    );

    // Don't bother going further if there aren't any actual events
    if (events.length === 0) {
      console.info("No events found");
      return;
    }

    const employees = ["Firstname LASTNAME"];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = now.getTime();

    const employeesEvents = events.filter(({ summary, start, end }) => {
      // Only keep the events of the selected employees that start or end today
      if (
        summary === `Absence - ${employees[0]}` &&
        (start.getTime() === today || end.getTime() === today)
      ) {
        return true;
      }

      return false;
    });

    console.log("All events", employeesEvents.length);
  } catch (err: unknown) {
    console.log(err);

    process.exit(-1);
  }
})();
