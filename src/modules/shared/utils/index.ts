import { DateTime } from "luxon";

export function getDhis2FormattedDate(date: DateTime): string {
	return date.toFormat("yyyy-MM-dd");
}
