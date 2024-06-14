import { async as icalAsync, sync as icalSync } from "node-ical";
import * as core from "@actions/core";
import { getEmployeesFromEvents, getEventsForEmployees } from "./helpers";

(async (): Promise<void> => {
  try {
    // Basic action based on https://github.com/actions/typescript-action/
    const calendarUrl = core.getInput("calendar_url", { required: true });
    const names = core.getMultilineInput("names", { required: true });

    if (!calendarUrl || calendarUrl === "") {
      core.error("calendar_url is missing");
    }

    if (!names || names.length === 0) {
      core.error("names is missing");
    }

    const response =
      process.env.NODE_ENV === "test"
        ? icalSync.parseFile("example-calendar.ics")
        : await icalAsync.fromURL(calendarUrl);

    const employeeEvents = getEventsForEmployees(
      Object.values(response),
      names,
    );

    const outOfOfficeEmployees = getEmployeesFromEvents(employeeEvents);

    // Set outputs for other workflow steps to use
    core.setOutput("names", outOfOfficeEmployees);
  } catch (err: unknown) {
    // Fail the workflow run if an error occurs
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
})();
