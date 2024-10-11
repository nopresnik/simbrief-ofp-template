import React from "react";
import { availableCompanies } from "./config";
import { fetchSimBriefData } from "./simbrief";
import "./styles.css";
import { Preferences, SimBriefData } from "./types";
import OfpFactory from "./ofp";

export const App = () => {
	const [preferences, setPreferences] = React.useState<Preferences>();
	const [currentOfp, setCurrentOfp] = React.useState<SimBriefData>();
	const canSubmit = !!(preferences?.company && preferences.pilotId);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setPreferences((prev) => ({
			...(prev || Object.create(null)),
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (canSubmit) {
			const data = await fetchSimBriefData(preferences.pilotId);
			return setCurrentOfp(data);
		}
	};

	return (
		<>
			<fieldset>
				<legend>Preferences</legend>
				<form onSubmit={handleSubmit}>
					<div>
						<label htmlFor="pilotid">SimBrief Pilot ID: </label>
						<input required type="text" id="pilotid" name="pilotId" onChange={handleChange} />
					</div>

					<div>
						<label>Company: </label>
						{Object.entries(availableCompanies).map(([value, name]) => (
							<React.Fragment key={value}>
								<input required type="radio" name="company" value={value} id={value} onChange={handleChange} />
								<label htmlFor={value}>{name}</label>
							</React.Fragment>
						))}
					</div>

					<div>
						<button type="submit" disabled={!canSubmit}>
							Generate
						</button>
					</div>
				</form>
			</fieldset>

			{currentOfp && preferences?.company && (
				<div style={{ background: "#1e1e1e", padding: 32, width: "fit-content", marginTop: 8 }}>
					<OfpFactory companyCode={preferences.company} data={currentOfp} />
				</div>
			)}
		</>
	);
};
