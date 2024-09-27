# Payfit out of office github action

This action will check a calendar to see if any employees are out of office today.

## Usage

```yaml
name: Payfit Out of Office Check
on:
  schedule:
    - cron: "0 6 * * 1-5" # Run every weekday at 6am

jobs:
  check-team-a:
    runs-on: ubuntu-latest
    steps:
      - name: Check who's out of office in team A
        id: check-ooo-team-a
        uses: arnaudvalle/payfit-out-of-office-action@v1
        with:
          calendar_url: https://url.to.your/calendar.ics
          names: Ciri OF CINTRA,Yennefer OF VENGERBERG

      - name: Print output for team A
        id: output-team-a
        run: echo "${{ steps.check-ooo-team-a.outputs.names }}"
```

## Inputs

### `calendar_url`

**Required** URL to the ics file containing all leave events.

### `names`

**Required** List of full names (`Firstname LASTNAME`) to check, separated by a comma.

## Outputs

### `names`

List of full names that are out of office today (out of those passed in `inputs.names`).

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
