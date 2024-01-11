import { find, head } from "lodash";
import { DateTime } from "luxon";
import { ProgramMapping } from "../constants";

export function getDhis2FormattedDate(date: DateTime): string {
	return date.toFormat("yyyy-MM-dd");
}

export function getProgramMapping(
	mapping: ProgramMapping[],
	program: string | null,
): ProgramMapping | undefined {
	if (program) {
		return find(mapping, { program }) ?? head(mapping);
	}
	return head(mapping);
}
