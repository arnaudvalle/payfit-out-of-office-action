import { async as icalAsync } from "node-ical";

(async () => {
  try {
    if (!process.env?.CALENDAR_URL || process.env?.CALENDAR_URL === "") {
      throw new Error("CALENDAR_URL is missing");
    }

    const events = await icalAsync.fromURL(process.env.CALENDAR_URL);
  } catch (err: unknown) {
    console.log(err);

    process.exit(-1);
  }
})();
