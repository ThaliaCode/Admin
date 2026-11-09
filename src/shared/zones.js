class Zone {
	constructor() {
		this.zones = [];
		this.recievedZones = [];
	}

	formatZones(zones) {
		this.recievedZones = zones;
		this.zones = zones.map(z => this.gettingRecursiveToFormat(z.location));
		return this.zones;
	}

	gettingRecursiveToFormat(zones) {
		if (Array.isArray(zones)) {
			const len = zones.length;
			const newZone = [];
			for (let i = 0; i < len; i += 1) {
				newZone[i] = this.gettingRecursiveToFormat(zones[i]);
			}
			return newZone;
		}
		const { x, y } = zones;
		return { lat: x, lng: y };
	}

	static editingZone(newZonesData) {
		const arrayItem = Object.keys(newZonesData);
		const keySelect = arrayItem.reduce((acum, k) => {
			let newAcum = acum;
			if (Array.isArray(newZonesData[k])) {
				if (newZonesData[k][0]) {
					newAcum = k;
				}
			}
			return newAcum;
		}, '');
		const primitivePolygon = newZonesData[keySelect][0][keySelect];
		const polygon = primitivePolygon.map((p) => {
			const pObject = { lat: p.lat(), lng: p.lng() };
			return pObject;
		});
		return polygon;
	}
}

export default Zone;
