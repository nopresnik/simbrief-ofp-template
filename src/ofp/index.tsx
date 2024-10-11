import { availableCompanies } from "../config";
import { SimBriefData } from "../types";
import { OfpJST } from "./ofpJST";
import "./ofpJST/styles.css";

const OfpFactory = ({ data }: { companyCode: keyof typeof availableCompanies; data: SimBriefData }) => {
	return <OfpJST data={data} />;
};

export default OfpFactory;
