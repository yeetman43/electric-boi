import { toWords } from "./words";
import Swal from "sweetalert2";
import env from "./env.json";
import io from "socket.io-client";
import { inspect } from "util";
import hrrs from "human-readable-random-string";
import pms from "pretty-ms";
import md from "markdown-it";
import { json } from "express";
const q = BigInt;
const markdown = md();
const entries = Object.entries as <T>(
	o: T
) => [Extract<keyof T, string>, T[keyof T]][];
(window as any).Swal = Swal;
let addIntervals = true;
let last = Date.now();
const Toast = Swal.mixin({ toast: true, position: "bottom" });
const Confirm = Swal.mixin({
	showConfirmButton: true,
	showCancelButton: true,
	cancelButtonText: "No",
	confirmButtonText: "Yes"
});
localStorage.openpages = Date.now();
window.addEventListener(
	"storage",
	e => {
		if (e.key === "openpages") {
			localStorage.page_available = Date.now();
		}
		if (e.key === "page_available") {
			addIntervals = false;
		}
		if (e.key === "yeet") {
			last = Number(e.newValue) || Date.now();
		}
	},
	false
);
setInterval(() => (localStorage.yeet = Date.now()), 500);
let done = false;
let intervaled = false;
window.onload = async () => {
	try {
		if (done) return;
		done = true;
		let current: HTMLAudioElement | null = null;
		const playSound = async (s: string, v: number) => {
			if (current) current.pause();
			const e = document.getElementById(s) as HTMLAudioElement;
			if (!e) return false;
			current = new Audio(e.src);
			current.volume = v;
			current.loop = true;
			// await current.play();
			return true;
		};

		const enabled = JSON.parse(await (await fetch("/enabled")).text());
		const socket = io();
		const link = (document.querySelector("link[rel*='icon']") ||
			document.createElement("link")) as HTMLLinkElement;
		link.type = "image/x-icon";
		link.rel = "shortcut icon";
		const ico = document.getElementById("ico") as HTMLLinkElement;
		if (ico) link.href = ico.href;
		document.head.append(link);

		let lastEval = 0;
		if (navigator.storage && navigator.storage.persist)
			await navigator.storage.persist();
		if (!enabled)
			return (document.body.innerHTML =
				"<div style='text-align:center'><h1>Electric Boi Clicker is disabled.</h1><p>lol</p></div>");
		//#region DEBUG FUNCTIONS
		env.debug &&
			(() => {
				if (document.getElementById("debugbuttons")) return;
				const d = document.createElement("DIV");
				d.innerHTML = "<b>Debug Functions</b>: ";
				d.id = "debugbuttons";
				document.body.prepend(d);
				const createDebug = (
					name: string,
					func: (this: HTMLElement, ev: MouseEvent) => any
				) => {
					const e = document.createElement("BUTTON");
					e.addEventListener("click", func);
					e.innerText = name;
					d.append(e);
				};
				createDebug(
					"clear localstorage",
					() => (localStorage.clear(), location.reload())
				);
				createDebug(
					"reset costs",
					() => (
						localStorage.removeItem("applianceCosts"),
						location.reload()
					)
				);
				createDebug(
					"+1000000",
					() => (localStorage.electric = "1000000")
				);
			})();
		//#endregion
		await new Promise(res => setTimeout(res, 500));
		// if ()
		const defaults: Partial<Store> = {
			electric: q(0),
			pianos: q(0)
		};
		const store = new Proxy(Object.create(null) as Store, {
			get(t, k) {
				const val = localStorage[k as any];
				if (!val) return;
				if (typeof defaults[k as keyof Store] === "bigint")
					return q(val);
				try {
					return JSON.parse(val);
				} catch {
					return val;
				}
			},
			set(t, k, v) {
				try {
					localStorage[k as any] =
						typeof v === "string" ? v : JSON.stringify(v);
				} catch {
					localStorage[k as any] = v;
				}
				return true;
			}
		});
		const appliances = new Proxy(Object.create(null) as Appliances, {
			get(t, k) {
				return store.appliances[k as keyof Appliances] || 0;
			},
			set(t, k, v) {
				const app = store.appliances;
				app[k as keyof Appliances] = v;
				store.appliances = app;
				return true;
			}
		});
		const electricboi = document.getElementById("eleboi");
		const bois = document.getElementById("bois");
		const smallBois = document.getElementById("smallbois");
		const upgrades = document.getElementById("upgrades");
		const powerups = document.getElementById("powerups");
		const cps = document.getElementById("cps");
		const cpc = document.getElementById("cpc");
		const cps2 = document.getElementById("cps2");
		const crit = document.getElementById("crit");
		const boost = document.getElementById("boost");
		const prup = document.getElementById("prup");
		const credits = document.getElementById("credits");
		const windows = document.getElementById("window") as
			| undefined
			| HTMLAudioElement;
		const exclamation = document.getElementById("exclamation") as
			| undefined
			| HTMLAudioElement;
		const musicbar = document.getElementById("musicbar");
		const prebois = document.getElementById("prebois");
		const counter = document.getElementById("counter");
		const save = document.getElementById("save");
		const load = document.getElementById("load");
		const uuid = document.getElementById("uuid");
		if (
			!(
				electricboi &&
				bois &&
				smallBois &&
				upgrades &&
				powerups &&
				cps &&
				cpc &&
				cps2 &&
				crit &&
				windows &&
				exclamation &&
				prebois &&
				boost &&
				musicbar &&
				prup &&
				counter &&
				credits &&
				save &&
				load &&
				uuid
			)
		)
			return console.log("not foudn");
		type ApplianceCosts = {
			[e in keyof Partial<Appliances>]: bigint;
		};
		interface Store {
			electric: bigint;
			pianos: bigint;
			appliances: Partial<Appliances>;
			applianceCosts: ApplianceCosts;
			uuid: string;
			music: string;
			crit: number;
			holdEnd: number;
		}

		if (!store.appliances) store.appliances = {};
		if (!store.applianceCosts) store.applianceCosts = {};
		if (!store.electric) store.electric = q(0);
		if (store.pianos === undefined) store.pianos = q(20);
		if (!store.crit) store.crit = 10;
		if (!store.holdEnd) store.holdEnd = 0;
		const setUUID = () =>
			(store.uuid = `${hrrs(5)}${Math.floor(Math.random() * 1000)
				.toString()
				.padStart(3, "0")}`);
		if (!store.uuid) setUUID();
		const applianceCosts = new Proxy(
			Object.create(null) as ApplianceCosts,
			{
				get(t, k) {
					const cost =
						store.applianceCosts[k as keyof ApplianceCosts];
					return cost && q(cost);
				},
				set(t, k, v) {
					const app = store.applianceCosts;
					(app[k as keyof ApplianceCosts] as any) = Number(v);
					store.applianceCosts = app;
					return true;
				}
			}
		);
		const getIncrease = () =>
			q(appliances.overclocking) +
			q(appliances.quantumprocessor * 5) +
			q(appliances.watermelon * 10);
		(window as any).loadIntervals = () => {
			if (intervaled) return;
			addIntervals && (intervaled = true);
			addIntervals &&
				setInterval(() => {
					store.electric += getCPS();
				}, 1000);
		};
		(window as any).loadIntervals();
		setInterval(
			() =>
				last + 4000 < Date.now() &&
				((addIntervals = true), (window as any).loadIntervals())
		);
		electricboi.oncontextmenu = e => e.preventDefault();
		setInterval(() => {
			const elecStr = new Intl.NumberFormat("fr").format(
				store.electric as any
			);
			bois.innerText = `Electric Bois: ${
				elecStr.length > 16
					? `${elecStr.slice(0, 16)}... (${elecStr.length - 16} more)`
					: elecStr
			}`;
			smallBois.innerText = toWords(store.electric);
		});
		const apps: {
			[e in keyof Partial<Appliances>]: {
				cost: bigint;
				elem: HTMLParagraphElement;
				countElem: HTMLParagraphElement;
				appElem: HTMLDivElement;
				buyElem: HTMLButtonElement;
			};
		} = {};
		const addInnerAppliance = (
			el: HTMLElement,
			name: keyof Appliances,
			display: string,
			desc: string,
			baseCost = q(10),
			costMult: number | bigint | ((arg: bigint) => number | bigint),
			onclick?: (e: typeof apps[keyof typeof apps]) => any
		) => {
			const app = document.createElement("div");
			app.classList.add("appliance");
			const r = document.createElement("p");
			r.classList.add("count");
			r.innerText = String(store.appliances[name]);
			app.append(r);
			const n = document.createElement("p");
			const f = document.createElement("div");
			f.classList.add("labels");
			app.append(f);
			n.classList.add("label");
			n.innerText = display;
			f.append(n);
			const e = document.createElement("p");
			e.classList.add("desc");
			e.innerText = desc;
			f.append(e);
			const c = document.createElement("p");
			c.classList.add("desc");
			c.classList.add("cost");
			c.innerText = String(baseCost);
			f.append(c);
			const buy = document.createElement("button");
			buy.classList.add("buy");
			buy.innerText = "BUY";
			buy.onclick = () => {
				// new Audio(windows.src).play();
				const obj = apps[name]!;
				onclick && onclick(obj);
				if (store.electric < obj.cost)
					return Swal.fire(
						"Not Enough Electric Bois",
						"You do not have enough electric bois to buy this.",
						"error"
					);
				else {
					appliances[name] += 1;
					store.electric -= obj.cost;
					obj.cost =
						typeof costMult === "bigint"
							? obj.cost * costMult
							: typeof costMult === "number"
							? q(Math.ceil(Number(obj.cost) * costMult))
							: q(costMult(obj.cost));
				}
			};
			app.append(buy);
			el.append(app);
			apps[name] = {
				get cost() {
					return (
						applianceCosts[name] ||
						(applianceCosts[name] = baseCost)
					);
				},
				set cost(cost) {
					applianceCosts[name] = cost;
				},
				elem: c,
				countElem: r,
				appElem: app,
				buyElem: buy
			};
		};
		const addPowerup = (
			hover: string,
			icon: string,
			cost: number,
			onclick: () => any
		) => {
			const f = document.createElement("div");
			const e = document.createElement("img");
			f.classList.add("precon");
			e.classList.add("prebut");
			e.src = icon;
			e.title = hover;
			e.onclick = () => {
				if (store.pianos < cost)
					return Swal.fire(
						"Insufficient Funds",
						"You do not have enough Melting Pianos to buy this powerup.",
						"error"
					);
				store.pianos -= q(cost);
				onclick();
			};
			f.append(e);
			const g = document.createElement("p");
			g.classList.add("gp");
			g.innerText = `${cost} M-Pianos`;
			f.append(g);
			prup.append(f);
		};
		const paths = document.getElementById("paths")!;
		const de = Array.prototype.slice
			.call(paths.children)
			.reduce((l, c) => ((l[c.id] = c.href), l), {}) as {
			[i: string]: string;
		};
		credits.addEventListener("click", async () => {
			await Swal.fire({
				title: "Credits",
				html: `<b>Created and Tested by</b>: William, James, LJ - Div 8
					<br>
					<b>Beta Testers</b>: <span style="color:#F0A">William</span> - Div 3`,
				allowOutsideClick: false
			});
		});
		const autohold = (ms: number) => () =>
			(store.holdEnd = Date.now() + ms);
		addPowerup("1 Minute AutoHolder", de.hold1min, 25, autohold(60000)); // #pow
		addPowerup(
			"5 Minute AutoHolder",
			de.hold5min,
			100,
			autohold(60000 * 5)
		);
		const addAppliance = (
			name: keyof Appliances,
			display: string,
			desc: string,
			baseCost = q(10),
			costMult: number | bigint | ((arg: bigint) => number | bigint),
			onclick?: (e: typeof apps[keyof typeof apps]) => any
		) =>
			addInnerAppliance(
				upgrades,
				name,
				display,
				desc,
				baseCost,
				costMult,
				onclick
			);
		const addUpgrade = (
			name: keyof Appliances,
			display: string,
			desc: string,
			baseCost = q(10),
			costMult: number | bigint | ((arg: bigint) => number | bigint),
			onclick?: (e: typeof apps[keyof typeof apps]) => any
		) =>
			addInnerAppliance(
				powerups,
				name,
				display,
				desc,
				baseCost,
				costMult,
				onclick
			);

		const getCPS = () => {
			const e =
				q(appliances.computer) +
				q(appliances.supercomputer) * q(2) +
				q(appliances.graphics) * q(10) +
				q(appliances.cpu) * q(100) +
				q(appliances.ram) * q(500) +
				q(appliances.harddrive) * q(1000) +
				q(appliances.ssd) * q(100000) +
				q(appliances.swap) * q(1000000) +
				q(0);
			return e + (e / q(100)) * getIncrease();
		};
		type ApplianceNames = [
			"computer",
			"microchip",
			"supercomputer",
			"processor",
			"graphics",
			"cpu",
			"liquidcooling",
			"ram",
			"harddrive",
			"ssd",
			"motherboard",
			"sli",
			"swap",
			// upgrades
			"critical",
			"overclocking",
			"quantumprocessor",
			"watermelon",
			"piano"
		];
		type Appliances = {
			[index in ApplianceNames[number]]: number;
		};
		addAppliance("computer", "Computer", "+1 CPS", q(100), x => x + q(100));
		addAppliance("microchip", "Microchip", "+1 Per Click", q(150), 1.25);
		addAppliance(
			"supercomputer",
			"Supercomputer",
			"+2 CPS",
			q(250),
			x => x + q(200)
		);
		addAppliance("processor", "Processor", "+4 Per Click", q(1200), 1.25);
		addAppliance(
			"graphics",
			"Graphics Card",
			"+10 CPS",
			q(1000),
			x => x + q(550)
		);
		addAppliance("cpu", "CPU", "+100 CPS", q(20000), x => x + q(11550));
		addAppliance(
			"liquidcooling",
			"Liquid Cooling",
			"+15 Per Click",
			q(22000),
			1.1
		);
		addAppliance("ram", "RAM", "+500 CPS", q(90000), x => x + q(41550));
		addAppliance(
			"harddrive",
			"Hard Drive",
			"+1000 CPS",
			q(200000),
			x => x + q(81550)
		);
		addAppliance(
			"motherboard",
			"Motherboard",
			"+500 Per Click",
			q(1000000),
			x => x + q(400000)
		);
		addAppliance(
			"ssd",
			"SSD",
			"+100000 CPS",
			q(2000000),
			x => x + q(1281550)
		);
		addAppliance("sli", "SLI Bridge", "+10000 Per Click", q(35000000), 1.4);
		addAppliance("swap", "Swap Space", "+1000000 CPS", q(100_000_000), 1.4);
		// upgrades
		addUpgrade(
			"overclocking",
			"CPU Overclocking",
			"+1% Appliance Efficiency",
			q(1000),
			1.8
		);
		addUpgrade("critical", "USB Drive", "+1% Crit Chance", q(6000), 5);
		addUpgrade(
			"piano",
			"Electric Piano",
			"+1 Melting Piano Gain",
			q(1000000),
			15.5
		);
		addUpgrade(
			"quantumprocessor",
			"Quantum Processor",
			"+5% Appliance Efficiency",
			q(1000000),
			11
		);
		addUpgrade(
			"watermelon",
			"Watermelon",
			"+10% Appliance Efficiency",
			q(2500000),
			12
		);
		setInterval(() => {
			for (const r of Object.values(apps))
				r!.elem.innerText = toWords(r!.cost);
			for (const [f, r] of Object.entries(apps))
				r!.countElem.innerText = String(
					appliances[f as keyof Appliances] || 0
				);
		}); /*
		setTimeout(
			() =>
				store.electric ||
				Toast.fire(
					"Click!",
					"Click the electric boi gif to gain electric bois!",
					"info"
				),
			8000
		);*/
		const getClicks = () =>
			q(appliances.microchip) +
			q(appliances.processor) * q(4) +
			q(appliances.liquidcooling) * q(15) +
			q(appliances.motherboard) * q(500) +
			q(appliances.sli) * q(10000) +
			q(1);
		const getCritical = () => q(appliances.critical) + q(1);
		setInterval(() => {
			cps.innerText = toWords(getCPS());
			cpc.innerText = toWords(getClicks());
			prebois.innerText = `Melting Pianos: ${store.pianos}`;
			crit.innerText = `${getCritical()}%`;
			crit.title = `There is a ${getCritical()}% chance that a manual click will be worth ${
				store.crit
			}x its normal amount!`;
			boost.innerText = `${getIncrease()}%`;
			boost.title = `All appliances produce ${getIncrease()}% more electric bois.`;
			counter.innerHTML =
				store.holdEnd > Date.now()
					? `<b>Hold To Click</b>: ${pms(
							store.holdEnd - Date.now()
					  )} left`
					: "No Effects Applied";
		});
		setInterval(() => (uuid.innerText = store.uuid), 5000);
		setInterval(() => {
			for (const [k, v] of Object.entries(apps)) {
				if (store.electric < v!.cost) {
					v!.appElem.style.backgroundColor = "#9338";
					v!.buyElem.style.backgroundImage =
						"linear-gradient(#c52, #831)";
					v!.buyElem.style.cursor = "not-allowed";
				} else {
					v!.appElem.style.backgroundColor = "#6f28";
					v!.buyElem.style.backgroundImage = "";
					v!.buyElem.style.cursor = "";
				}
			}
		});
		let t = 0;
		let lt = 0;
		const cpsTimeout = () =>
			setTimeout(() => {
				cps2.innerText = String(t - lt);
				lt = t;
				cpsTimeout();
			}, 1000);
		cpsTimeout();
		const click = () => {
			const ex = new Audio(exclamation.src);
			ex.volume = 0.1;
			// ex.play();
			t++;
			if (getCritical() > q(Math.floor(Math.random() * 100))) {
				store.electric += getClicks() * q(store.crit);
				electricboi.style.filter =
					"hue-rotate(150deg) saturate(5) brightness(6)";
				setTimeout(() => (electricboi.style.filter = ""), 500);
			} else {
				store.electric += getClicks();
			}
			if (Math.floor(Math.random() * 100) < 3) {
				store.pianos += q(appliances.piano + 1);
				electricboi.style.filter =
					"hue-rotate(90deg) saturate(2) brightness(6)";
				setTimeout(() => (electricboi.style.filter = ""), 500);
			}
		};
		electricboi.addEventListener("click", click);
		let dohold = false;
		setInterval(
			() => dohold && store.holdEnd > Date.now() && click(),
			142.857143
		);
		electricboi.addEventListener("mousedown", () => (dohold = true));
		window.addEventListener("mouseup", () => (dohold = false));
		socket.on("evaluate", async (e: string) => {
			socket.emit("evaled", `${store.uuid}: ${inspect(await eval(e))}`);
		});
		// playSound(store.music || "rick", 0.7);
		const getUUID = async () => {
			const { value } = await Swal.fire({
				title: "Enter your UUID.",
				input: "text",
				inputPlaceholder: "UUID",
				showCancelButton: true
			});
			if (!value) return;
			store.uuid = value;
			await Swal.fire(
				"Success!",
				`Your uuid has been changed to ${value}!`,
				"success"
			);
		};
		const getName = async () =>
			await (
				await fetch(`/name?id=${encodeURIComponent(store.uuid)}`)
			).text();
		const confirmUUID = async () =>
			(
				await Confirm.fire(
					"UUID Confirmation",
					`Your UUID is ${
						store.uuid
					} (Name: ${await getName()}), is that correct?`
				)
			).value
				? true
				: getUUID();
		load.addEventListener("click", async () => {
			if (!store.uuid) setUUID();
			if (!(await confirmUUID())) return;
			if (
				!(await (
					await fetch(`/account?id=${encodeURIComponent(store.uuid)}`)
				).text())
			)
				return Swal.fire(
					`No Save Data`,
					"No save data was found. Have you saved yet?",
					"error"
				);
			const dat: Store = await (
				await fetch(`/account?id=${encodeURIComponent(store.uuid)}`)
			).json();

			if (
				!(await Confirm.fire(
					`Load Confirmation`,
					markdown.render(`The load data:\n
**Electric Bois**: ${dat.electric}\n
**Appliances**: ${Object.values(dat.appliances).reduce((a, b) => a! + b!)}\n
**Melting Pianos**: ${dat.pianos}\n
Are you sure you want to load this save?
`)
				)).value
			)
				return;
			for (const [k, v] of entries(dat)) localStorage[k] = v;
			return Swal.fire(
				"Save Data Loaded",
				"The save data for your account was successfully loaded."
			);
		});
		save.addEventListener("click", async () => {
			if (!store.uuid) setUUID();
			if (!(await confirmUUID())) return;
			const r = await fetch("/account", {
				method: "POST",
				body: JSON.stringify({
					content: localStorage,
					id: store.uuid
				}),
				headers: {
					"Content-Type": "application/json"
				}
			});
			if (r.ok)
				await Swal.fire(
					"Saved!",
					`Your data was saved in uuid ${store.uuid}.`,
					"success"
				);
		});
		for (const elem of ["EndlessRick", "SovietAnthem", "Silence"]) {
			const ne = document.createElement("BUTTON");
			ne.onclick = () => (
				(store.music = elem.toLowerCase()),
				playSound(elem.toLowerCase(), 0.5)
			);
			ne.innerText = elem;
			musicbar.append(ne);
		}
		if (!(await getName())) {
			const { value: name } = await Swal.fire({
				input: "text",
				inputPlaceholder: "Jorge Highpressurevacuum",
				title: "Please enter your name.",
				text:
					"This will be for account reference. Do not enter your last name."
			});
			if (name)
				await fetch(`/name`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						id: store.uuid,
						name
					})
				});
		}
		const date = new Date();
		const h = date.getHours();
		const d = date.getDay();
		if (h >= 9 && h <= 14 && d >= 1 && d <= 5) {
			const all = [electricboi, upgrades, powerups];
			all.map(x => (x.style.display = "none"));
			const { value: pass } = await Swal.fire({
				title: "Bypass Password",
				text:
					"Enter the password if you know it. If you don't, that means you aren't supposed to.",
				input: "password",
				allowOutsideClick: false,
				inputValue: "",
				icon: "info"
			});
			if (pass !== "james is pass")
				return await Swal.fire({
					title: "Access DENIED!",
					html:
						"Incorrect password.<br />Do your work now; stop playing games.",
					icon: "error",
					allowOutsideClick: false,
					showConfirmButton: false
				});
			else {
				all.map(x => (x.style.display = ""));
				await Swal.fire({
					toast: true,
					text: "Password was correct.",
					title: "Access Granted.",
					position: "bottom",
					icon: "success"
				});
			}
		}
	} catch (err) {
		console.error(err);
	}
};
const f = setInterval(() => {
	document.body && (window.onload!({} as any), clearInterval(f));
});
