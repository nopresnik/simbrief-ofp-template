import "./styles.css";

export const App = () => {
	return (
		<fieldset>
			<legend>Preferences</legend>
			<p>
				<label htmlFor="pilotid">SimBrief Pilot ID: </label>
				<input type="text" id="pilotid" name="pilotid" />
			</p>

			<p>
				<label>Company: </label>
				<input type="radio" name="company" value="VOZ" id="VOZ" checked />
				<label htmlFor="VOZ">Virgin Australia</label>

				<input type="radio" name="company" value="JST" id="JST" disabled />
				<label htmlFor="JST">Jetstar</label>
			</p>
		</fieldset>
	);
};
