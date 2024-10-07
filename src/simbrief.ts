import { SimBriefData } from "./types";

/**
 * Fetches a user's latest OFP data from SimBrief as a JSON object.
 */
export const fetchSimBriefData = async (pilotId: string) => {
	const response = await fetch(
		`https://www.simbrief.com/api/xml.fetcher.php?userid=${pilotId}&json=1`
	);
	const data = await response.json();

	if (response.ok) {
		return data as SimBriefData;
	}

	throw new Error(data.error);
};
