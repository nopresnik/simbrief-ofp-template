import React from "react";
import { SimBriefData } from "../../types";
import logo from "./jst-logo.png";
import "./styles.css";

class DateTools {
	private readonly date: Date;

	constructor(date: string) {
		this.date = new Date(Number(date) * 1000);
	}

	public subtractTime(seconds: number) {
		this.date.setTime(this.date.getTime() - seconds * 1000);
		return this;
	}

	public addTime(seconds: number) {
		this.date.setTime(this.date.getTime() + seconds * 1000);
		return this;
	}

	public getAbbreviatedDateString() {
		// DDMMMYY
		const day = this.date.getUTCDate().toString().padStart(2, "0");
		const month = this.date.toUTCString().split(" ")[2].toUpperCase();
		const year = this.date.getUTCFullYear().toString().slice(-2);
		return `${day}${month}${year}`;
	}

	public getAbbreviatedSlashedDateString() {
		// DD/MM/YY
		const day = this.date.getUTCDate().toString().padStart(2, "0");
		const month = (this.date.getUTCMonth() + 1).toString().padStart(2, "0");
		const year = this.date.getUTCFullYear().toString().slice(-2);
		return `${day}/${month}/${year}`;
	}

	public getUtcTimeString(separator: string = "") {
		return `${this.date.getUTCHours().toString().padStart(2, "0")}${separator}${this.date
			.getUTCMinutes()
			.toString()
			.padStart(2, "0")}`;
	}

	public getLocalTimeString(offset: number | string) {
		const localDate = new Date(this.date.getTime() + Number(offset) * 3600000);

		return `${localDate.getUTCHours().toString().padStart(2, "0")}:${localDate
			.getUTCMinutes()
			.toString()
			.padStart(2, "0")}`;
	}

	public static toHoursMinutes(seconds: number | string, separator: string = ".") {
		seconds = Number(seconds);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours.toString().padStart(2, "0")}${separator}${minutes.toString().padStart(2, "0")}`;
	}
}

const parseStepString = (stepString: string) => {
	// YMML/0340/LAKOT/0350/VOMPA/0340" => "YMML/FL340 LAKOT/FL350 VOMPA/FL340"
	const parts = stepString.split("/");
	const steps = [];
	for (let i = 0; i < parts.length; i += 2) {
		steps.push(`${parts[i]}/${parts[i + 1].replace(/^0+/, "FL")}`);
	}
	return steps.join(" ");
};

const numberToSignPrefixed = (wind: string | number, leadingZeros: number = 0) => {
	const num = Number(wind);
	if (num > 0) {
		return `P${num.toString().padStart(leadingZeros, "0")}`;
	} else if (num < 0) {
		return `M${Math.abs(num).toString().padStart(leadingZeros, "0")}`;
	}
	return "0".padStart(leadingZeros, "0");
};

const convertToArray = (data: object | object[]) => {
	if (Array.isArray(data)) {
		return data;
	}

	if (Object.keys(data).length > 0) {
		return [data];
	}

	return [];
};

class JstFuelSummary {
	private data: SimBriefData;

	constructor(data: SimBriefData) {
		this.data = data;
	}

	public getFlightFuel() {
		return { time: Number(this.data.times.est_time_enroute), fuel: Number(this.data.fuel.enroute_burn) };
	}

	public getAlternateFuel() {
		// Check if alternate is single or array.
		if (!Array.isArray(this.data.alternate)) {
			return { time: Number(this.data.alternate?.ete ?? 0), fuel: Number(this.data.fuel.alternate_burn) };
		}

		// If alternate is an array, get the first one.
		return { time: Number(this.data.alternate[0]?.ete ?? 0), fuel: Number(this.data.fuel.alternate_burn) };
	}

	public getContingencyFuel() {
		return { time: Number(this.data.times.contfuel_time), fuel: Number(this.data.fuel.contingency) };
	}

	public getWxPlusTfcFuel() {
		return this.data.fuel_extra.bucket.reduce(
			(acc, x) => {
				if (x.label === "ATC" || x.label === "WXX") {
					acc.time += Number(x.time);
					acc.fuel += Number(x.fuel);
				}
				return acc;
			},
			{ time: 0, fuel: 0 }
		);
	}

	public getFixedReserveFuel() {
		return { time: Number(this.data.times.reserve_time), fuel: Number(this.data.fuel.reserve) };
	}

	public getExtraFuel() {
		return this.data.fuel_extra.bucket.reduce(
			(acc, x) => {
				if (x.label !== "ATC" && x.label !== "WXX" && x.label !== "TANKERING") {
					acc.fuel += Number(x.fuel);
				}
				return acc;
			},
			{ fuel: 0 }
		);
	}

	public getTakeoffFuel() {
		return {
			time: this.getFuelLoad().time - this.getTaxiFuel().time,
			fuel: this.getFuelLoad().fuel - this.getTaxiFuel().fuel,
		};
	}

	public getTankerFuel() {
		const tanker = this.data.fuel_extra.bucket.find((x) => x.label === "TANKERING");
		return { time: Number(tanker?.time ?? 0), fuel: Number(tanker?.fuel ?? 0) };
	}

	public getTaxiFuel() {
		return { time: Number(this.data.times.taxi_out), fuel: Number(this.data.fuel.taxi) };
	}

	public getFuelLoad() {
		return {
			time:
				this.getFlightFuel().time +
				this.getAlternateFuel().time +
				this.getContingencyFuel().time +
				this.getWxPlusTfcFuel().time +
				this.getFixedReserveFuel().time +
				this.getTankerFuel().time +
				this.getTaxiFuel().time,
			fuel:
				this.getFlightFuel().fuel +
				this.getAlternateFuel().fuel +
				this.getContingencyFuel().fuel +
				this.getWxPlusTfcFuel().fuel +
				this.getFixedReserveFuel().fuel +
				this.getExtraFuel().fuel +
				this.getTankerFuel().fuel +
				this.getTaxiFuel().fuel,
		};
	}

	public getFuelOverDestination() {
		return {
			fuel: this.getFuelLoad().fuel - this.getFlightFuel().fuel - this.getTaxiFuel().fuel,
		};
	}
}

const parseStageName = (stage: string) => {
	if (stage === "DSC") {
		return "DES";
	}

	return stage;
};

const convertLatLonToDegreesMinutes = (lat: string | number, lon: string | number) => {
	lat = Number(lat);
	lon = Number(lon);

	const latDirection = lat >= 0 ? "N" : "S";
	lat = Math.abs(lat);
	const latDegrees = Math.floor(lat);
	const latMinutes = (lat - latDegrees) * 60;

	const lonDirection = lon >= 0 ? "E" : "W";
	lon = Math.abs(lon);
	const lonDegrees = Math.floor(lon);
	const lonMinutes = (lon - lonDegrees) * 60;

	const latMinutesFormatted = latMinutes.toFixed(1);
	const lonMinutesFormatted = lonMinutes.toFixed(1);

	return `${latDirection}${latDegrees} ${latMinutesFormatted} ${lonDirection}${lonDegrees} ${lonMinutesFormatted}`;
};

export const OfpJST = ({ data }: { data: SimBriefData }) => {
	const fuelCalcs = React.useMemo(() => new JstFuelSummary(data), [data]);
	const alternates = convertToArray(data.alternate);

	const PAGE_HEADER = (
		<div className="jst_page_header">
			<table>
				<tr>
					<td>Flight Brief</td>
					<td>Flight ID:</td>
					<td>{data.general.flight_number.padStart(4, "0")}</td>
					<td>{data.origin.iata_code}</td>
					<td>A/C:</td>
					<td>{data.aircraft.reg.split("-")[1]}</td>
				</tr>
				<tr>
					<td></td>
					<td style={{ fontWeight: "normal" }}>
						{new DateTools(data.api_params.date).getAbbreviatedSlashedDateString()}
					</td>
					<td></td>
					<td>{data.destination.iata_code}</td>
					<td>MSN:</td>
					<td>{data.aircraft.fin}</td>
				</tr>
			</table>
			<img src={logo} alt="logo" width={150} height={30} />
		</div>
	);

	const DISPATCH_DATA = (
		<div>
			<table className="jst_dispatch_data jst_table_collapsed">
				<tr>
					<td>CAPTAIN</td>
				</tr>
				<tr>
					<td>FLT NO.</td>
					<td>FROM /{"  "}TO</td>
					<td className="jst_text-center">DATE</td>
					<td>AIRCRAFT</td>
				</tr>
				<tr>
					<td>{data.atc.callsign}</td>
					<td className="jst_text-right">
						{data.origin.iata_code} / {data.destination.iata_code}
					</td>
					<td className="jst_text-center">{new DateTools(data.api_params.date).getAbbreviatedDateString()}</td>
					<td className="jst_text-center">{data.aircraft.reg}</td>
				</tr>
			</table>

			<br />

			<table>
				<tr>
					<td>FLIGHT DIST OFFICER</td>
					<td>DESK EXTENSION</td>
					<td>FLIGHT-PLAN REF</td>
				</tr>
				<tr>
					<td>{data.crew.dx}</td>
					<td className="jst_text-center">1800 555 555</td>
					<td className="jst_text-center">{data.params.request_id}</td>
				</tr>
			</table>
		</div>
	);

	const FUEL_SUMMARY = (
		<div>
			<table>
				<tr>
					<td></td>
					<td>TIME</td>
					<td width="30" />
					<td className="jst_text-right">FUEL</td>
					<td width="30" />
					<td className="jst_text-right">DIST</td>
					<td width="30" />
					<td className="jst_text-right">NAM</td>
					<td width="30" />
					<td className="jst_text-right">REV FUEL</td>
				</tr>
				<tr>
					<td>FLIGHT FUEL</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getFlightFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getFlightFuel().fuel}</td>
					<td />
					<td className="jst_text-right">{data.general.route_distance.padStart(4, "0")}</td>
					<td />
					<td className="jst_text-right">{data.general.air_distance.padStart(4, "0")}</td>
					<td />
					<td>........</td>
				</tr>
				<tr>
					<td>
						ALTN{"      "}
						{alternates[0]?.icao_code ?? "NIL"}
					</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getAlternateFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getAlternateFuel().fuel}</td>
					<td />
					<td className="jst_text-right">{alternates[0]?.distance?.padStart(4, "0") ?? "0000"}</td>
					<td />
					<td className="jst_text-right">{alternates[0]?.air_distance?.padStart(4, "0")}</td>
					<td />
					<td>........</td>
				</tr>
				<tr>
					<td>VRBL RES</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getContingencyFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getContingencyFuel().fuel}</td>
					<td />
					<td />
					<td />
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>WXTFC</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getWxPlusTfcFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getWxPlusTfcFuel().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>FIXED RES {data.destination.icao_code} </td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getFixedReserveFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getFixedReserveFuel().fuel}</td>
					<td />
					<td />
					<td />
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>ETP BUILD UP</td>
					<td>00.00</td>
					<td />
					<td className="jst_text-right">0000</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>ETP B/UP + WX</td>
					<td>00.00</td>
					<td />
					<td className="jst_text-right">0000</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>EXTRA</td>
					<td />
					<td />
					<td className="jst_text-right">{fuelCalcs.getExtraFuel().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td>TAKE OFF</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getTakeoffFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getTakeoffFuel().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>TANKER</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getTankerFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getTankerFuel().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>TAXI OUT</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getTaxiFuel().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getTaxiFuel().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<tr>
					<td>FUEL LOAD</td>
					<td>{DateTools.toHoursMinutes(fuelCalcs.getFuelLoad().time)}</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getFuelLoad().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td>........</td>
				</tr>
				<br />
				<tr>
					<td></td>
					<td>FOD</td>
					<td />
					<td className="jst_text-right">{fuelCalcs.getFuelOverDestination().fuel}</td>
					<td />
					<td />
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
			</table>

			<br />
			<br />

			<div>FUEL BURN PER 1000KG VARIATION IN TOW {data.impacts.zfw_plus_1000.burn_difference.padStart(4, "0")} KGS</div>
			<div>FLIGHT FUEL INCLUDES MANOEUVRING FUEL</div>
		</div>
	);

	return (
		<div className="jst_pages">
			<div className="jst_page">
				{PAGE_HEADER}

				<div className="jst_section_header" style={{ borderTop: "none", borderBottom: "none" }}>
					Flight Plan Acceptance Form
				</div>

				<div className="jst_section_sub_header">Crew / Dispatch Data</div>

				{DISPATCH_DATA}

				<div className="jst_section_sub_header">ATC FP</div>

				<br />

				{data.atc.flightplan_text}

				<div className="jst_section_sub_header">Fuel Summary</div>
				{FUEL_SUMMARY}

				<hr style={{ margin: 0, marginBottom: 10 }} />
				<div>Final Fuel Load Requested:__________________</div>
				<div>PIC Signature:_____________________ Date:______________________</div>
				<div>PIC's signature confirms the acceptance of this flight plan.</div>
				<div>PIC to sign and leave form with ground staff.</div>
				<hr style={{ marginTop: 10 }} />
			</div>

			<div className="jst_page">
				{PAGE_HEADER}

				<div className="jst_section_sub_header" style={{ marginTop: 250 }}>
					Intentionally Left Blank
				</div>
			</div>

			<div className="jst_page">
				{PAGE_HEADER}

				<div className="jst_section_header" style={{ borderTop: "none" }}>
					FLIGHT BRIEF COVER PAGE
				</div>

				{data.general.is_etops === "0" ? (
					<div className="jst_section_header_box">NON ETOPS Sector</div>
				) : (
					<div className="jst_section_header_box" style={{ background: "black", color: "white" }}>
						ETOPS Sector
					</div>
				)}

				<div className="jst_section_sub_header">Sector Data</div>

				<div style={{ textTransform: "capitalize" }}>
					Sector {data.origin.iata_code} - {data.destination.iata_code} ({data.origin.name.toLowerCase()} -{" "}
					{data.destination.name.toLowerCase()})
				</div>

				<table>
					<tr>
						<td></td>
						<td>UTC</td>
						<td>Loc</td>
						<td style={{ width: 32 }}></td>
						<td>FLT PLAN</td>
						<td style={{ width: 16 }}></td>
						<td></td>
						<td style={{ width: 80 }}></td>
						<td>PAX</td>
					</tr>
					<tr>
						<td>STD:</td>
						<td className="jst_td_box">{new DateTools(data.times.sched_out).getUtcTimeString(":")}</td>
						<td className="jst_td_box">
							{new DateTools(data.times.sched_out).getLocalTimeString(data.times.orig_timezone)}
						</td>
						<td></td>
						<td>Block</td>
						<td></td>
						<td>EET</td>
						<td></td>
						<td className="jst_td_box" style={{ paddingRight: 8 }}>
							{data.general.passengers}
						</td>
					</tr>
					<tr>
						<td>STA:</td>
						<td className="jst_td_box">{new DateTools(data.times.sched_in).getUtcTimeString(":")}</td>
						<td className="jst_td_box">
							{new DateTools(data.times.sched_in).getLocalTimeString(data.times.dest_timezone)}
						</td>
						<td></td>
						<td className="jst_td_box" style={{ paddingLeft: 0, paddingRight: 40 }}>
							{DateTools.toHoursMinutes(Number(data.times.sched_block))}
						</td>
						<td></td>
						<td className="jst_td_box" style={{ paddingLeft: 0, paddingRight: 40 }}>
							{DateTools.toHoursMinutes(Number(data.times.est_time_enroute))}
						</td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
				</table>

				<div>
					Dispatcher:{"	"}
					{data.crew.dx}
				</div>

				<div className="jst_section_sub_header">Crew List</div>

				<table style={{ fontSize: 10.5, width: "100%" }}>
					<tr>
						<td>EMP NO</td>
						<td>Rank</td>
						<td>CREW Name</td>
						<td>Sectors</td>
						<td>Sign-on Time (UTC)</td>
						<td>Matrix Expiry Time (UTC)</td>
					</tr>
					{data.crew.cpt && (
						<tr>
							<td>123456</td>
							<td>CP</td>
							<td style={{ textTransform: "uppercase" }}>{data.crew.cpt}</td>
							<td style={{ textAlign: "center" }}></td>
							<td style={{ textAlign: "center" }}></td>
							<td style={{ textAlign: "center" }}></td>
						</tr>
					)}
					{data.crew.fo && (
						<tr>
							<td>123456</td>
							<td>FO</td>
							<td style={{ textTransform: "uppercase" }}>{data.crew.fo}</td>
							<td style={{ textAlign: "center" }}>1</td>
							<td style={{ textAlign: "center" }}>
								{new DateTools(data.times.sched_out).subtractTime(3600).getUtcTimeString(":")}
							</td>
							<td style={{ textAlign: "center" }}>
								{new DateTools(data.times.sched_out).addTime(3600 * 11).getUtcTimeString(":")}
							</td>
						</tr>
					)}
					{data.crew.fa &&
						data.crew.fa.map((fa, i) => (
							<tr key={fa}>
								<td>123456</td>
								<td>{i === 0 ? "CM" : "LF"}</td>
								<td style={{ textTransform: "uppercase" }}>{fa}</td>
								<td style={{ textAlign: "center" }}></td>
								<td style={{ textAlign: "center" }}></td>
								<td style={{ textAlign: "center" }}></td>
							</tr>
						))}
				</table>

				<br />

				<div style={{ fontSize: 10.5 }}>
					• The Matrix Expiry Time is calculated from utilising SCHEDULED sign on time & the OM 1 Sec 5 Tables 5-2/3:
					Maximum Hours per Flight Duty Periods. As such the calculated time is not valid for Split Duty or Augmented
					Crew operations nor does it consider Flight Deck Duty Limits or Extensions. The Matrix Expiry Time is provided
					as a guide only. For the official expiry time consult crewing or reference OM 1.
				</div>

				<div className="jst_section_sub_header">JQ Contact Details</div>

				<div className="jst_contact_details">
					<div>
						<div className="jst_contact_details_box">
							<span>Australia</span>
							<span>1800 555555{"     "}</span>
						</div>
						<div className="jst_contact_details_box">
							<span>Malaysia</span>
							<span>1 800 555 555{"   "}</span>
						</div>
						<div className="jst_contact_details_box">
							<span>New Zealand</span>
							<span>0800 555 555{"    "}</span>
						</div>
						<div className="jst_contact_details_box">
							<span>USA</span>
							<span>1 866 555 5555{"  "}</span>
						</div>
						<div className="jst_contact_details_box">
							<span>JOCC Direct</span>
							<span>+61 3 5555 5555 </span>
						</div>
						<div className="jst_contact_details_box">
							<span>Singapore</span>
							<span>800 555 5555{"      "}</span>
						</div>
					</div>
					<div>
						<div className="jst_contact_details_box">
							<span>Indonesia</span>
							<span>001 555 55 555{"  "}</span>
						</div>
						<div className="jst_contact_details_box">
							<span>Japan</span>
							<span>0066 33 555 555 </span>
						</div>
						<div className="jst_contact_details_box">
							<span>Thailand</span>
							<span>001 800 555 5555</span>
						</div>
						<div className="jst_contact_details_box">
							<span>Vietnam</span>
							<span>+848 5555 5555{"  "}</span>
						</div>
						<div className="jst_contact_details_box">
							<span>Dispatch Direct</span>
							<span>+61 3 5555 5555 </span>
						</div>
						<div className="jst_contact_details_box">
							<span>Korea</span>
							<span>+820055555555555{"  "}</span>
						</div>
					</div>
				</div>

				<div className="jst_section_header">ACTIVE AIRCRAFT MEL ITEMS</div>

				<div className="jst_section_sub_header" style={{ marginTop: 2, paddingTop: 0 }}>
					<table className="jst_mel_table">
						<tr>
							<td>
								<span className="clipped-text">MEL #</span>
							</td>
							<td>
								<span className="clipped-text">Opened</span>
							</td>
							<td width="200">
								<span className="clipped-text">Description</span>
							</td>
							<td>
								<span className="clipped-text">Def</span>
							</td>
							<td>
								<span className="clipped-text">Expires</span>
							</td>
							<td width="100">
								<span className="clipped-text">EFR</span>
							</td>
						</tr>
					</table>
				</div>

				<div className="jst_mel_empty">No MEL Records found for this aircraft</div>
			</div>

			<div className="jst_page">
				<div className="jst_section_header">EFB Effectivity</div>
				<br />
				<div className="jst_efb_page">
					<table>
						<tr>
							<td>Current approved IPAD iOS version range</td>
							<td className="jst_td_border">16.5 - 16.6</td>
						</tr>
					</table>
					<br />
					<div>Refer to INTAP PER E for further details.</div>
					<br />
					<table className="jst_table_centered">
						<tr className="jst_tr_border">
							<td style={{ textAlign: "left" }} width={250}>
								Application
							</td>
							<td>Current Data Version</td>
							<td>Next Version</td>
							<td>Effective From</td>
						</tr>
						<br />
						<tr>
							<td style={{ textAlign: "left" }}>FlySmart</td>
							<td>230901</td>
						</tr>
						<tr>
							<td style={{ textAlign: "left" }} colSpan={4}>
								Notes: Refer to email from EFB Admin for further details
							</td>
						</tr>
						<br />
						<tr>
							<td style={{ textAlign: "left" }}>JetLoad</td>
							<td>23-09-01</td>
						</tr>
						<tr>
							<td style={{ textAlign: "left" }} colSpan={4}>
								Notes: Refer to applicable INTAP and FSOs for revision details.
							</td>
						</tr>
						<br />
						<tr>
							<td style={{ textAlign: "left" }}>A320-A321 FSO PACK</td>
							<td />
							<td />
							<td>07/09/23</td>
						</tr>
						<tr>
							<td style={{ textAlign: "left" }}>A320-A321 FSO PACK</td>
							<td />
							<td />
							<td>07/09/23</td>
						</tr>
						<tr>
							<td style={{ textAlign: "left" }}>A320-A321 INTAP List</td>
							<td>3993</td>
							<td />
							<td>07/09/23</td>
						</tr>
					</table>
				</div>
			</div>

			<div className="jst_page">
				{PAGE_HEADER}
				<div className="jst_bordered_page" style={{ fontSize: 13.5 }}>
					{DISPATCH_DATA}
					<br />
					<div>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<div>{"                        "}DISPATCHER REMARKS</div>
					<div>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					{data.general.dx_rmk}
					<br />
					<br />
					<br />
					<br />
					<div>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					<div>FILED ATC PLAN</div>
					<div>----------------</div>
					<div>{data.atc.flightplan_text}</div>
					<br />
					<div>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<div>{"                        "}JETSTAR FLIGHT PLAN</div>
					<div>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					<table className="jst_table_collapsed">
						<tr>
							<td>FROM/TO{"		"}</td>
							<td>FLT NO./DATE{"			"}</td>
							<td>REG</td>
						</tr>
						<tr>
							<td>
								{data.origin.icao_code}/{data.destination.icao_code}
							</td>
							<td>
								{data.atc.callsign}/{new DateTools(data.times.sched_off).getAbbreviatedDateString()}
							</td>
							<td>{data.aircraft.reg}</td>
						</tr>
					</table>
					<br />
					<table className="jst_table_collapsed">
						<tr>
							<td>CO ROUTE{"	  "}</td>
							<td>OPER BASIS{"	  "}</td>
							<td>PLAN NUMBER</td>
						</tr>
						<tr>
							<td>
								{data.origin.iata_code}
								{data.destination.iata_code}-1
							</td>
							<td>{"  "}LF</td>
							<td> {data.params.request_id}</td>
						</tr>
					</table>
					<br />
					<div>ROUTE DESCRIPTION</div>
					<div>
						RWY {data.origin.plan_rwy} {data.origin.icao_code} {data.general.route} {data.destination.icao_code} RWY{" "}
						{data.destination.plan_rwy}
					</div>
					<br />
					<div>ROUTE PROFILE</div>
					<div>{parseStepString(data.general.stepclimb_string)}</div>
					<br />
					<div>
						CLIMB{"  "}
						{data.general.climb_profile}
						{"	"}CRZ{"  "}
						{data.general.cruise_profile}
						{"	"}DESCENT {data.general.descent_profile}
					</div>
					<div>PERF FACTOR {numberToSignPrefixed(data.aircraft.fuelfactor)}.0</div>
					<div>
						AVG WIND {numberToSignPrefixed(data.general.avg_wind_comp, 3)}
						{"  "}AVG TEMP DEV {numberToSignPrefixed(data.general.avg_temp_dev, 2)} UPPER AIR DATA DD/MD/FC /071212
						{/* TODO: WTF IS THIS?*/}
					</div>
					<br />
					<table className="jst_table_collapsed">
						<tr>
							<td>
								STD {data.origin.iata_code}
								{"  "}
							</td>
							<td>
								{new DateTools(data.times.sched_out).getUtcTimeString()} Z{"    "}
							</td>
							<td>
								STA {data.destination.iata_code}
								{"  "}
							</td>
							<td>
								{new DateTools(data.times.sched_in).getUtcTimeString()} Z{"    "}
							</td>
							<td>EET</td>
							<td>{DateTools.toHoursMinutes(Number(data.times.est_time_enroute))}</td>
						</tr>
						<tr>
							<td>ETD</td>
							<td>
								{new DateTools(data.times.est_out).getUtcTimeString()} Z{"    "}
							</td>
							<td>ETA</td>
							<td>
								{new DateTools(data.times.est_in).getUtcTimeString()} Z{"    "}
							</td>
							<td>BLOCK{"    "}</td>
							<td>{DateTools.toHoursMinutes(Number(data.times.sched_block))}</td>
						</tr>
						<tr>
							<td>BLOX OFF</td>
							<td>.... Z</td>
							<td>BLOX ON</td>
							<td>.... Z</td>
						</tr>
					</table>
					<br />
					<div>XXXXXXXXXXXXXXXXXXXXXXX LOAD SUMMARY XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					<div>
						<table>
							<tr>
								<td>PLANNED WEIGHTS</td>
								<td></td>
								<td width="20"></td>
								<td>REV WEIGHTS</td>
								<td width="20"></td>
								<td className="jst_text-center">LIMITING WEIGHTS</td>
							</tr>
							<tr>
								<td>PAYLOAD (PAX {data.general.passengers})</td>
								<td className="jst_text-right">{data.weights.payload}</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
							<tr>
								<td>DRY OPERATING WEIGHT</td>
								<td className="jst_text-right">{data.weights.oew}</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
							<tr>
								<td>ZERO FUEL WEIGHT</td>
								<td className="jst_text-right">{data.weights.est_zfw}</td>
								<td></td>
								<td>.........</td>
								<td></td>
								<td className="jst_text-center">
									MZFW{"  "}
									{data.weights.max_zfw}
								</td>
							</tr>
							<tr>
								<td>TAKE-OFF FUEL</td>
								<td className="jst_text-right">{fuelCalcs.getTakeoffFuel().fuel}</td>
								<td></td>
								<td>.........</td>
								<td></td>
								<td></td>
							</tr>
							<tr>
								<td>TAKE-OFF WEIGHT</td>
								<td className="jst_text-right">{data.weights.est_tow}</td>
								<td></td>
								<td>.........</td>
								<td></td>
								<td className="jst_text-center">
									MTOW{"  "}
									{data.weights.max_tow}
								</td>
							</tr>
							<tr>
								<td>FLIGHT FUEL</td>
								<td className="jst_text-right">{fuelCalcs.getFlightFuel().fuel}</td>
								<td></td>
								<td>.........</td>
								<td></td>
								<td></td>
							</tr>
							<tr>
								<td>LANDING WEIGHT</td>
								<td className="jst_text-right">{data.weights.est_ldw}</td>
								<td></td>
								<td>.........</td>
								<td></td>
								<td className="jst_text-center">
									MLDW{"  "}
									{data.weights.max_ldw}
								</td>
							</tr>
						</table>
					</div>
					<br />
					<br />
					<div>XXXXXXXXXXXXXXXXXXXXX FUEL SUMMARY XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					{FUEL_SUMMARY}
					<br />
					<div>XXXXXXXXXXXXXXXXXXX FLIGHT LEVEL SUMMARIES XXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					<div>
						ROUTE {data.origin.iata_code}-{data.destination.iata_code}-1
					</div>
					<div>
						MAIN PLAN FLIGHT FUEL{"   "}
						{fuelCalcs.getFlightFuel().fuel} FUEL LOAD{"   "}
						{fuelCalcs.getFuelLoad().fuel} EET {DateTools.toHoursMinutes(data.times.est_time_enroute)}
					</div>
					<div>
						{data.atc.initial_alt_unit}
						{data.atc.initial_alt_unit === "F" ? "L" : ""}
						{data.atc.initial_alt}
					</div>
					<div>
						RTE 01{"  "}CRZ-CI{data.impacts.higher_ci.cost_index.padStart(3, "0")}
						{"   "}FLIGHT FUEL{"   "}
						{data.impacts.higher_ci.enroute_burn}
						{"  "}EET {DateTools.toHoursMinutes(data.impacts.higher_ci.time_enroute, "")}
						{"  "}ETA ....
					</div>
					<div>
						{data.atc.initial_alt_unit}
						{data.atc.initial_alt_unit === "F" ? "L" : ""}
						{data.impacts.minus_2000ft.initial_fl}
					</div>
					<div>
						RTE 01{"  "}CRZ-CI{data.impacts.minus_2000ft.cost_index.padStart(3, "0")}
						{"   "}FLIGHT FUEL{"   "}
						{data.impacts.minus_2000ft.enroute_burn}
						{"  "}EET {DateTools.toHoursMinutes(data.impacts.minus_2000ft.time_enroute, "")}
						{"  "}ETA ....
					</div>
					<br />
					<br />
					<div>XXXXXXXXXXXXXXXXXXXX ALTERNATE SUMMARIES XXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					{alternates.length > 0 ? (
						<>
							<div>FUEL INCLUDES MISSED APPROACH ALLOWANCE</div>
							<br />
							<table className="jst_table_alternate_summary">
								<tr>
									<td width={200}></td>
									<td></td>
									<td> MORA</td>
									<td> TTK</td>
									<td> DIST</td>
									<td> FL</td>
									<td> TIME</td>
									<td> ETA</td>
									<td>BURN</td>
									<td>RWY</td>
								</tr>
								{alternates.map((alt, i) => (
									<React.Fragment key={i}>
										<tr>
											<td>LDG ALTERNATE -</td>
											<td> {alt.iata_code}</td>
											<td>XXX</td>
											<td>{alt.track_true}</td>
											<td>{alt.air_distance.padStart(4, "0")}</td>
											<td>{Number(alt.cruise_altitude) / 100}</td>
											<td>{DateTools.toHoursMinutes(alt.ete, ":")}</td>
											<td>
												{new DateTools(data.times.sched_out)
													.addTime(Number(data.times.est_time_enroute))
													.addTime(Number(alt.ete))
													.addTime(600)
													.getUtcTimeString()}
											</td>
											<td>{alt.burn}</td>
											<td>{alt.plan_rwy}</td>
										</tr>
										<tr>
											<td colSpan={10}>
												CO ROUTE {data.destination.iata_code}-{alt.iata_code}
												{"	"} 1 {data.destination.icao_code} {alt.route} {alt.icao_code}
											</td>
										</tr>
										<tr>
											<td colSpan={10}> </td>
										</tr>
									</React.Fragment>
								))}
							</table>
						</>
					) : (
						<>
							<div>NO ALTERNATES PLANNED</div>
							<br />
						</>
					)}
					<br />
					<div>XXXXXXXXXXXXXXXX CRITICAL FUEL SUMMARIES XXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					<div>NO CRITICAL FUEL SUMMARIES</div>
					<br />
					<br />
					<div>XXXXXXXXXXXXXXXXXXXXXX NAVIGATION LOG XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
					<br />
					<div>
						CO ROUTE {data.origin.iata_code}-{data.destination.iata_code}-1
					</div>
					<br />
					<table>
						<tr>
							<td>DIST</td>
							<td>MC</td>
							<td className="jst_text-right">ZT</td>
							<td> ETA</td>
							<td> FL</td>
							<td> WIND / COMP</td>
							<td> ISA</td>
							<td colSpan={4}> TAS</td>
						</tr>
						<tr>
							<td colSpan={2}>TO/</td>
							<td className="jst_text-right">ACTM</td>
							<td colSpan={3}> ATA</td>
							<td> DEV</td>
							<td> GS</td>
							<td> ACBO</td>
							<td> FUELRM</td>
							<td> SR</td>
						</tr>
						<tr>
							<td>AWY</td>
							<td colSpan={10}>/ MORA</td>
						</tr>
						<br />
						<tr>
							<td colSpan={3}>{data.origin.icao_code}</td>
							<td> ....</td>
							<td colSpan={7}> SET HDG TIME</td>
						</tr>
						<br />
						{data.navlog.fix.map((nav, i) => (
							<React.Fragment key={nav.ident}>
								<tr>
									<td>{nav.distance.padStart(3, "0")}</td>
									<td>{nav.track_mag.padStart(3, "0")}</td>
									<td className="jst_text-right"> {Math.round(Number(nav.time_leg) / 60)}</td>
									<td> ....</td>
									<td> {nav.stage === "CRZ" ? Number(nav.altitude_feet) / 100 : parseStageName(nav.stage)}</td>
									<td>
										{" "}
										{nav.wind_dir.padStart(3, "0")}/{nav.wind_spd.padStart(3, "0")}
										{"  "}
										{numberToSignPrefixed(data.general.avg_wind_comp, 3)}
									</td>
									<td> {nav.stage === "CRZ" ? numberToSignPrefixed(nav.oat_isa_dev, 2) : parseStageName(nav.stage)}</td>
									<td> {nav.true_airspeed.padStart(3, "0")}</td>
									<td> .....</td>
									<td> ....</td>
								</tr>
								<tr>
									<td colSpan={2}>{nav.ident}</td>
									<td className="jst_text-right">{DateTools.toHoursMinutes(nav.time_total)}</td>
									<td> ....</td>
									<td> ...</td>
									<td colSpan={2}> .............</td>
									<td> {nav.groundspeed}</td>
									<td> {nav.fuel_totalused.padStart(5, "0")}</td>
									<td> {(Number(nav.fuel_plan_onboard) / 1000).toFixed(1).padStart(4, " ")}</td>
									<td> XX{/* NOT SURE WHAT "SR" IS*/}</td>
								</tr>
								<tr>
									<td>{nav.via_airway}</td>
									<td>/ {nav.mora}</td>
								</tr>
								<tr>
									<td colSpan={11}> </td>
								</tr>
								{data.navlog.fix[i + 1]?.fir_crossing?.fir && (
									<>
										<tr>
											<td>-{data.navlog.fix[i + 1].fir}</td>
											<td colSpan={3}>
												{convertLatLonToDegreesMinutes(
													data.navlog.fix[i + 1]!.fir_crossing!.fir!.pos_lat_entry,
													data.navlog.fix[i + 1]!.fir_crossing!.fir!.pos_long_entry
												)}
											</td>
											<td className="jst_text-center" colSpan={5}>
												{data.navlog.fix[i + 1]!.fir_crossing!.fir!.fir_name.replace("FIR", "")}
											</td>
											<td colSpan={2} className="jst_text-right">
												--------
											</td>
										</tr>

										<tr>
											<td colSpan={11}> </td>
										</tr>
									</>
								)}
							</React.Fragment>
						))}
					</table>
				</div>
			</div>
		</div>
	);
};
