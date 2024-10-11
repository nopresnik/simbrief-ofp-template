import { availableCompanies } from "./config";

export type Preferences = {
	pilotId: string;
	company: keyof typeof availableCompanies;
};

export interface SimBriefData {
	fetch: Fetch;
	params: Params;
	general: General;
	origin: Origin;
	destination: Destination;
	alternate: Alternate | Alternate[];
	alternate_navlog: Navlog;
	takeoff_altn: EnrouteAltn;
	enroute_altn: EnrouteAltn;
	navlog: Navlog;
	etops: Etops;
	tlr: Tlr;
	atc: Atc;
	aircraft: Aircraft;
	fuel: Fuel;
	fuel_extra: FuelExtra;
	times: Times;
	weights: Weights;
	impacts: Impacts;
	crew: Crew;
	notams: EnrouteAltn;
	weather: Weather;
	sigmets: Sigmets;
	text: Text;
	tracks: EnrouteAltn;
	database_updates: DatabaseUpdates;
	files: Files;
	fms_downloads: FmsDownloads;
	images: Images;
	links: Links;
	prefile: Prefile;
	vatsim_prefile: string;
	ivao_prefile: string;
	pilotedge_prefile: string;
	poscon_prefile: string;
	map_data: string;
	api_params: APIParams;
}

export interface Aircraft {
	icaocode: string;
	iatacode: string;
	base_type: string;
	icao_code: string;
	iata_code: string;
	name: string;
	reg: string;
	fin: string;
	selcal: string;
	equip: string;
	fuelfact: string;
	fuelfactor: string;
	max_passengers: string;
	supports_tlr: string;
	internal_id: string;
	is_custom: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EnrouteAltn {}

export interface Alternate {
	icao_code: string;
	iata_code: string;
	faa_code: EnrouteAltn;
	icao_region: IcaoRegionEnum;
	elevation: string;
	pos_lat: string;
	pos_long: string;
	name: string;
	timezone: string;
	plan_rwy: string;
	trans_alt: string;
	trans_level: string;
	cruise_altitude: string;
	distance: string;
	gc_distance: string;
	air_distance: string;
	track_true: string;
	track_mag: string;
	tas: string;
	gs: string;
	avg_wind_comp: string;
	avg_wind_dir: string;
	avg_wind_spd: string;
	avg_tropopause: string;
	avg_tdv: string;
	ete: string;
	burn: string;
	route: string;
	route_ifps: string;
	metar: string;
	metar_time: Date;
	metar_category: string;
	metar_visibility: string;
	metar_ceiling: string;
	taf: string;
	taf_time: Date;
	atis: EnrouteAltn;
	notam: EnrouteAltn;
}

export enum IcaoRegionEnum {
	Wa = "WA",
	Wi = "WI",
	Yb = "YB",
	Ym = "YM",
}

export interface Navlog {
	fix: Fix[];
}

export interface Fix {
	ident: string;
	name: string;
	type: FixType;
	icao_region: EnrouteAltn | IcaoRegionEnum;
	frequency: EnrouteAltn | string;
	pos_lat: string;
	pos_long: string;
	stage: Stage;
	via_airway: string;
	is_sid_star: string;
	distance: string;
	track_true: string;
	track_mag: string;
	heading_true: string;
	heading_mag: string;
	altitude_feet: string;
	ind_airspeed: string;
	true_airspeed: string;
	mach: string;
	mach_thousandths: string;
	wind_component: string;
	groundspeed: string;
	time_leg: string;
	time_total: string;
	fuel_flow: string;
	fuel_leg: string;
	fuel_totalused: string;
	fuel_min_onboard: string;
	fuel_plan_onboard: string;
	oat: string;
	oat_isa_dev: string;
	wind_dir: string;
	wind_spd: string;
	shear: string;
	tropopause_feet: string;
	ground_height: string;
	fir: FirAltnEnum;
	fir_units: FirUnits;
	fir_valid_levels: string;
	mora?: string;
	wind_data?: WindData;
	fir_crossing?: FirCrossing;
}

export enum FirAltnEnum {
	Waaf = "WAAF",
	Wiif = "WIIF",
	Wsjc = "WSJC",
	Ybbb = "YBBB",
	Ymmm = "YMMM",
}

export interface FirCrossing {
	fir?: FirClass;
}

export interface FirClass {
	fir_icao: FirAltnEnum;
	fir_name: string;
	pos_lat_entry: string;
	pos_long_entry: string;
}

export enum FirUnits {
	NF = "N,F",
}

export enum Stage {
	Clb = "CLB",
	Crz = "CRZ",
	Dsc = "DSC",
}

export enum FixType {
	Apt = "apt",
	Ltlg = "ltlg",
	Ndb = "ndb",
	Vor = "vor",
	Wpt = "wpt",
}

export interface WindData {
	level: Level[];
}

export interface Level {
	altitude: string;
	wind_dir: string;
	wind_spd: string;
	oat: string;
}

export interface APIParams {
	airline: string;
	fltnum: string;
	type: string;
	orig: string;
	dest: string;
	date: string;
	dephour: string;
	depmin: string;
	route: string;
	stehour: string;
	stemin: string;
	reg: string;
	fin: EnrouteAltn;
	selcal: string;
	pax: string;
	altn: string;
	fl: EnrouteAltn;
	cpt: string;
	pid: string;
	fuelfactor: string;
	manualpayload: string;
	manualzfw: string;
	taxifuel: string;
	minfob: string;
	minfob_units: string;
	minfod: string;
	minfod_units: string;
	melfuel: string;
	melfuel_units: string;
	atcfuel: string;
	atcfuel_units: string;
	wxxfuel: string;
	wxxfuel_units: string;
	addedfuel: string;
	addedfuel_units: string;
	addedfuel_label: string;
	tankering: string;
	tankering_units: string;
	flightrules: string;
	flighttype: string;
	contpct: string;
	resvrule: string;
	taxiout: string;
	taxiin: string;
	cargo: string;
	origrwy: string;
	destrwy: string;
	climb: string;
	descent: string;
	cruisemode: string;
	cruisesub: string;
	planformat: string;
	pounds: string;
	navlog: string;
	etops: string;
	stepclimbs: string;
	tlr: string;
	notams_opt: string;
	firnot: string;
	maps: string;
	turntoflt: EnrouteAltn;
	turntoapt: EnrouteAltn;
	turntotime: EnrouteAltn;
	turnfrflt: EnrouteAltn;
	turnfrapt: EnrouteAltn;
	turnfrtime: EnrouteAltn;
	fuelstats: EnrouteAltn;
	contlabel: EnrouteAltn;
	static_id: EnrouteAltn;
	acdata: EnrouteAltn;
	acdata_parsed: string;
}

export interface Atc {
	flightplan_text: string;
	route: string;
	route_ifps: string;
	callsign: string;
	initial_spd: string;
	initial_spd_unit: string;
	initial_alt: string;
	initial_alt_unit: string;
	section18: string;
	fir_orig: FirAltnEnum;
	fir_dest: FirAltnEnum;
	fir_altn: FirAltnEnum;
	fir_etops: FirAltnEnum[];
	fir_enroute: FirAltnEnum[];
}

export interface Crew {
	pilot_id: string;
	cpt: string;
	fo: string;
	dx: string;
	pu: string;
	fa: string[];
}

export interface DatabaseUpdates {
	metar_taf: string;
	winds: string;
	sigwx: string;
	sigmet: string;
	notams: string;
	tracks: string;
}

export interface Destination {
	icao_code: string;
	iata_code: string;
	faa_code: EnrouteAltn;
	icao_region: IcaoRegionEnum;
	elevation: string;
	pos_lat: string;
	pos_long: string;
	name: string;
	timezone: string;
	plan_rwy: string;
	trans_alt: string;
	trans_level: string;
	metar: string;
	metar_time: Date;
	metar_category: string;
	metar_visibility: string;
	metar_ceiling: string;
	taf: string;
	taf_time: Date;
	atis: Atis;
	notam: EnrouteAltn;
}

export interface Atis {
	network: string;
	issued: Date;
	letter: string;
	phonetic: string;
	type: string;
	message: string;
}

export interface Etops {
	rule: string;
	entry: Entry;
	exit: Entry;
	suitable_airport: Origin[];
	equal_time_point: EqualTimePoint;
	critical_point: CriticalPoint;
}

export interface CriticalPoint {
	fix_type: string;
	pos_lat: string;
	pos_long: string;
	elapsed_time: string;
	est_fob: string;
	critical_fuel: string;
}

export interface Entry {
	icao_code: string;
	iata_code: string;
	faa_code: EnrouteAltn;
	icao_region: IcaoRegionEnum;
	pos_lat_apt: string;
	pos_long_apt: string;
	pos_lat_fix: string;
	pos_long_fix: string;
	elapsed_time: string;
	min_fob: string;
	est_fob: string;
}

export interface EqualTimePoint {
	pos_lat: string;
	pos_long: string;
	elapsed_time: string;
	min_fob: string;
	est_fob: string;
	etops_condition: string;
	div_time: string;
	div_burn: string;
	critical_fuel: string;
	div_altitude: string;
	div_airport: DivAirport[];
}

export interface DivAirport {
	icao_code: string;
	track_true: string;
	track_mag: string;
	distance: string;
	avg_wind_comp: string;
	avg_temp_dev: string;
	est_fob: string;
}

export interface Origin {
	icao_code: string;
	iata_code: string;
	faa_code: EnrouteAltn;
	icao_region: string;
	name: string;
	pos_lat: string;
	pos_long: string;
	elevation: string;
	timezone: string;
	fcst_cig?: string;
	fcst_vis?: string;
	plan_rwy: string;
	trans_alt: string;
	trans_level: string;
	suitability_start?: Date;
	suitability_end?: Date;
	metar: string;
	metar_time: Date;
	metar_category: string;
	metar_visibility: string;
	metar_ceiling: string;
	taf: string;
	taf_time: Date;
	atis: EnrouteAltn;
	notam: EnrouteAltn;
}

export interface Fetch {
	userid: string;
	static_id: EnrouteAltn;
	status: string;
	time: string;
}

export interface Files {
	directory: string;
	pdf: PDF;
	file: PDF[];
}

export interface PDF {
	name: string;
	link: string;
}

export interface FmsDownloads {
	directory: string;
	pdf: PDF;
	abx: PDF;
	a3e: PDF;
	crx: PDF;
	cra: PDF;
	psx: PDF;
	efb: PDF;
	ef2: PDF;
	bbs: PDF;
	csf: PDF;
	ftr: PDF;
	gtn: PDF;
	vm5: PDF;
	vmx: PDF;
	ffa: PDF;
	fsc: PDF;
	fs9: PDF;
	mfs: PDF;
	mfn: PDF;
	fsl: PDF;
	fsx: PDF;
	fsn: PDF;
	kml: PDF;
	ify: PDF;
	i74: PDF;
	ifa: PDF;
	ifw: PDF;
	inb: PDF;
	ivo: PDF;
	xvd: PDF;
	xvp: PDF;
	ixg: PDF;
	jar: PDF;
	jhe: PDF;
	jfb: PDF;
	mdr: PDF;
	mda: PDF;
	lvd: PDF;
	mjc: PDF;
	mjq: PDF;
	atm: PDF;
	mvz: PDF;
	vms: PDF;
	pmo: PDF;
	pmr: PDF;
	pmw: PDF;
	pgt: PDF;
	mga: PDF;
	psm: PDF;
	qty: PDF;
	rmd: PDF;
	sbr: PDF;
	sfp: PDF;
	tdg: PDF;
	tfd: PDF;
	ufc: PDF;
	vas: PDF;
	vfp: PDF;
	wae: PDF;
	xfm: PDF;
	xpe: PDF;
	xpn: PDF;
	xp9: PDF;
	zbo: PDF;
}

export interface Fuel {
	taxi: string;
	enroute_burn: string;
	contingency: string;
	alternate_burn: string;
	reserve: string;
	etops: string;
	extra: string;
	extra_required: string;
	extra_optional: string;
	min_takeoff: string;
	plan_takeoff: string;
	plan_ramp: string;
	plan_landing: string;
	avg_fuel_flow: string;
	max_tanks: string;
}

export interface FuelExtra {
	bucket: Bucket[];
}

export interface Bucket {
	label: string;
	fuel: string;
	time: string;
	required: EnrouteAltn | string;
}

export interface General {
	release: string;
	icao_airline: string;
	flight_number: string;
	is_etops: string;
	dx_rmk: string;
	sys_rmk: EnrouteAltn;
	is_detailed_profile: string;
	cruise_profile: string;
	climb_profile: string;
	descent_profile: string;
	alternate_profile: string;
	reserve_profile: string;
	costindex: string;
	cont_rule: string;
	initial_altitude: string;
	stepclimb_string: string;
	avg_temp_dev: string;
	avg_tropopause: string;
	avg_wind_comp: string;
	avg_wind_dir: string;
	avg_wind_spd: string;
	gc_distance: string;
	route_distance: string;
	air_distance: string;
	total_burn: string;
	cruise_tas: string;
	cruise_mach: string;
	passengers: string;
	route: string;
	route_ifps: string;
	route_navigraph: string;
	sid_ident: EnrouteAltn;
	sid_trans: EnrouteAltn;
	star_ident: EnrouteAltn;
	star_trans: EnrouteAltn;
}

export interface Images {
	directory: string;
	map: PDF[];
}

export interface Impacts {
	minus_6000ft: HigherCi;
	minus_4000ft: HigherCi;
	minus_2000ft: HigherCi;
	plus_2000ft: EnrouteAltn;
	plus_4000ft: EnrouteAltn;
	plus_6000ft: EnrouteAltn;
	higher_ci: HigherCi;
	lower_ci: HigherCi;
	zfw_plus_1000: HigherCi;
	zfw_minus_1000: HigherCi;
}

export interface HigherCi {
	time_enroute: string;
	time_difference: string;
	enroute_burn: string;
	burn_difference: string;
	ramp_fuel: string;
	initial_fl: string;
	initial_tas: string;
	initial_mach: string;
	cost_index: string;
}

export interface Links {
	skyvector: string;
}

export interface Params {
	request_id: string;
	sequence_id: string;
	static_id: EnrouteAltn;
	user_id: string;
	time_generated: string;
	xml_file: string;
	ofp_layout: string;
	airac: string;
	units: string;
}

export interface Prefile {
	vatsim: Ivao;
	ivao: Ivao;
	pilotedge: Pilotedge;
	poscon: Pilotedge;
}

export interface Ivao {
	name: string;
	site: string;
	link: string;
	form: string;
}

export interface Pilotedge {
	name: string;
	site: string;
	link: string;
	form: EnrouteAltn;
}

export interface Sigmets {
	sigmet: Sigmet[];
}

export interface Sigmet {
	type: SigmetType;
	loc: string;
	address: string;
	title: string;
	fir: FirAltnEnum;
	fir_name: string;
	id: string;
	hazard: string;
	qualifier: string;
	issued: string;
	start: string;
	end: string;
	text: string;
}

export enum SigmetType {
	Ws = "WS",
	Wv = "WV",
}

export interface Text {
	nat_tracks: EnrouteAltn;
	tlr_section: string;
	plan_html: string;
}

export interface Times {
	est_time_enroute: string;
	sched_time_enroute: string;
	sched_out: string;
	sched_off: string;
	sched_on: string;
	sched_in: string;
	sched_block: string;
	est_out: string;
	est_off: string;
	est_on: string;
	est_in: string;
	est_block: string;
	orig_timezone: string;
	dest_timezone: string;
	taxi_out: string;
	taxi_in: string;
	reserve_time: string;
	endurance: string;
	contfuel_time: string;
	etopsfuel_time: string;
	extrafuel_time: string;
}

export interface Tlr {
	takeoff: Takeoff;
	landing: Landing;
}

export interface Landing {
	conditions: Conditions;
	distance_dry: Distance;
	distance_wet: Distance;
	runway: LandingRunway[];
}

export interface Conditions {
	airport_icao: string;
	planned_runway: string;
	planned_weight: string;
	flap_setting?: string;
	wind_direction: string;
	wind_speed: string;
	temperature: string;
	altimeter: string;
	surface_condition: string;
}

export interface Distance {
	weight: string;
	flap_setting: string;
	brake_setting: string;
	reverser_credit: string;
	speeds_vref: string;
	actual_distance: string;
	factored_distance: string;
}

export interface LandingRunway {
	identifier: string;
	length: string;
	length_tora: string;
	length_toda: string;
	length_asda: string;
	length_lda: string;
	elevation: string;
	gradient: string;
	true_course: string;
	magnetic_course: string;
	headwind_component: string;
	crosswind_component: string;
	ils_frequency: string;
	max_weight_dry: string;
	max_weight_wet: string;
}

export interface Takeoff {
	conditions: Conditions;
	runway: TakeoffRunway[];
}

export interface TakeoffRunway {
	identifier: string;
	length: string;
	length_tora: string;
	length_toda: string;
	length_asda: string;
	length_lda: string;
	elevation: string;
	gradient: string;
	true_course: string;
	magnetic_course: string;
	headwind_component: string;
	crosswind_component: string;
	ils_frequency: string;
	flap_setting: string;
	thrust_setting: string;
	bleed_setting: string;
	anti_ice_setting: string;
	flex_temperature: string;
	max_temperature: string;
	max_weight: string;
	limit_code: string;
	limit_obstacle: EnrouteAltn;
	speeds_v1: string;
	speeds_vr: string;
	speeds_v2: string;
	speeds_other: string;
	speeds_other_id: string;
	distance_decide: string;
	distance_reject: string;
	distance_margin: string;
	distance_continue: string;
}

export interface Weather {
	orig_metar: string;
	orig_taf: string;
	dest_metar: string;
	dest_taf: string;
	altn_metar: string;
	altn_taf: string;
	toaltn_metar: EnrouteAltn;
	toaltn_taf: EnrouteAltn;
	eualtn_metar: EnrouteAltn;
	eualtn_taf: EnrouteAltn;
	etops_metar: string[];
	etops_taf: string[];
}

export interface Weights {
	oew: string;
	pax_count: string;
	bag_count: string;
	pax_count_actual: string;
	bag_count_actual: string;
	pax_weight: string;
	bag_weight: string;
	freight_added: string;
	cargo: string;
	payload: string;
	est_zfw: string;
	max_zfw: string;
	est_tow: string;
	max_tow: string;
	max_tow_struct: string;
	tow_limit_code: string;
	est_ldw: string;
	max_ldw: string;
	est_ramp: string;
}
