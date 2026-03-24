/**
 * @actions/core v3 is ESM-only; Jest resolves it here so `jest.spyOn` works.
 */
export const getInput = jest.fn((): string => "");
export const setFailed = jest.fn((): void => undefined);
export const setOutput = jest.fn((): void => undefined);
export const info = jest.fn((): void => undefined);
