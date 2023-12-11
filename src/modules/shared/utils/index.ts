import { find, head } from "lodash";
import { DateTime } from "luxon";
import { programMapping } from "../constants";

export function getDhis2FormattedDate(date: DateTime): string {
	return date.toFormat("yyyy-MM-dd");
}

export function getProgramMapping(
	mapping: programMapping[],
	program: string | null,
): programMapping | undefined {
	if (program) {
		return find(mapping, { program }) ?? head(mapping);
	}
	return head(mapping);
}
