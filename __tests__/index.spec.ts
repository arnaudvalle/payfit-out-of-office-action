import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@actions/core");

import * as core from "@actions/core";
import * as helpers from "../src/helpers";
import * as main from "../src/index";

describe("action", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the GitHub Actions core library
    vi.mocked(core.getInput).mockImplementation(() => "");
    vi.mocked(core.setFailed).mockImplementation(() => {});
    vi.mocked(core.setOutput).mockImplementation(() => {});

    vi.spyOn(helpers, "getEventsForEmployees").mockImplementation(() => []);
    vi.spyOn(helpers, "getEmployeesFromEvents").mockImplementation(() => []);
  });

  it("errors if calendar_url is missing", async () => {
    // Set the action's inputs as return values from core.getInput()
    vi.mocked(core.getInput).mockImplementation((name) => {
      switch (name) {
        case "calendar_url":
          return "";
        case "names":
          return "Geralt OF RIVIA";
        default:
          return "";
      }
    });

    await main.run();

    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      "Missing calendar_url or names input",
    );
  });

  it("errors if names are missing", async () => {
    // Set the action's inputs as return values from core.getInput()
    vi.mocked(core.getInput).mockImplementation((name) => {
      switch (name) {
        case "calendar_url":
          return "https://some.url/calendar.ics";
        case "names":
          return "";
        default:
          return "";
      }
    });

    await main.run();

    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      "Missing calendar_url or names input",
    );
  });

  it("returns early if there are no events in the ical", async () => {
    // Set the action's inputs as return values from core.getInput()
    vi.mocked(core.getInput).mockImplementation((name) => {
      switch (name) {
        case "calendar_url":
          return "./__tests__/__fixtures__/example-calendar-empty.ics";
        case "names":
          return "Geralt OF RIVIA";
        default:
          return "";
      }
    });

    await main.run();

    expect(core.setOutput).toHaveBeenNthCalledWith(1, "names", []);
    expect(helpers.getEventsForEmployees).not.toHaveBeenCalled();
    expect(helpers.getEmployeesFromEvents).not.toHaveBeenCalled();
  });
});
