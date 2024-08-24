import { VEvent, async as icalAsync, sync as icalSync } from "node-ical";
import * as core from "@actions/core";
import { getEmployeesFromEvents, getEventsForEmployees } from "./helpers";

export async function run(): Promise<void> {
  try {
    // Basic action based on https://github.com/actions/typescript-action/
    const calendarUrl = core.getInput("calendar_url", { required: true });
    const names = core.getInput("names", { required: true });

    if (!calendarUrl || calendarUrl === "") {
      core.error("calendar_url is missing");
    }

    if (!names || names === "") {
      core.error("names is missing");
    }

    const response =
      process.env.NODE_ENV === "test"
        ? icalSync.parseFile(calendarUrl)
        : await icalAsync.fromURL(calendarUrl);

    // We can ignore VTimeZone and VCalendar for now
    const events = Object.values(response).filter(
      (component): component is VEvent => component.type === "VEVENT",
    );

    // Don't bother going any further if there aren't any actual events
    if (events.length === 0) {
      core.info("No events found in ical");
      core.setOutput("names", []);
      return;
    }

    core.info(`Found a total of ${events.length} events in ical`);

    const employeeEvents = getEventsForEmployees(events, names.split(","));

    const outOfOfficeEmployees = getEmployeesFromEvents(employeeEvents);

    // Set outputs for other workflow steps to use
    core.setOutput("names", outOfOfficeEmployees);
  } catch (err: unknown) {
    // Fail the workflow run if an error occurs
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
}

run();
