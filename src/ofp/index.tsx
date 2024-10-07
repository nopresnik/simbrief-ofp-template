import { availableCompanies } from "../config";
import { SimBriefData } from "../types";

const OfpFactory = ({
	companyCode,
	data,
}: {
	companyCode: keyof typeof availableCompanies;
	data: SimBriefData;
}) => {
	return (
		<>
			{companyCode} {JSON.stringify(data)}
		</>
	);
};

export default OfpFactory;
