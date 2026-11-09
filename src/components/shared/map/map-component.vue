<template>
	<div class="gmap-container" :class="{ 'h-450': isDelivery }">
		<v-layout row wrap align-center justify-center class="loading-map" v-if="isLoading">
			<v-flex xs5 px-4 py-2 class="loading-map-container">
				<p class="loading-map-text mb-0">
					Espere un momento mientras finaliza la carga de información.
				</p>
			</v-flex>
		</v-layout>
		<button
			v-if="isZone && !zoneId"
			:class="['poli-button', { 'poli-button-dark': flagPolygon }]"
			type="button"
			@click="poligonAction"
		>
			<img src="/static/icon/poli.svg" alt="polígono" />
		</button>
		<button
			v-else-if="isRoute"
			:class="['poli-button', { 'poli-button-dark': flagPolyline }]"
			type="button"
			@click="polylineAction"
		>
			<img src="/static/icon/line-graph.svg" alt="polylínea" height="29" />
		</button>
		<gmap-map
			ref="mapRef"
			:center="center"
			:options="generalOptions"
			:zoom="localZoom"
			style="width: 100%; height: 100%"
			@click="clickedOnMap"
		>
			<gmap-cluster :averageCenter="true" :gridSize="160" :maxZoom="localZoomMax">
				<gmap-marker
					v-for="(m, index) in markers"
					:label="labelIcon(m)"
					:key="index"
					:clickable="true"
					:draggable="m.draggable"
					:position="m.position"
					:z-index="m.zIndex"
					@click="selectedMarker(m, null, index)"
					@dragend="$emit('on-dragend', $event)"
					:icon="getMarkerIcon(m)"
				>
					<!-- <gmap-info-window
						:opened="showByIndex === index"
						@closeclick="closeInfo()"
					>
						<map-info-window :orderSelected="orderSelected"></map-info-window>
					</gmap-info-window> -->
				</gmap-marker>
			</gmap-cluster>
			<!-- <gmap-cluster v-if="markers && markers.length > 0">

			</gmap-cluster> -->
			<GmapAutocomplete />
			<GmapPolygon
				:draggable="isZone"
				:editable="isZone"
				:options="optionsMap"
				:paths="optionsMap.paths"
				@paths_changed="pathsChanged(null, $event, true)"
			></GmapPolygon>
			<template v-if="multiplePaths">
				<GmapPolygon
					v-for="(polygon, indexPolyM) in optionsMap.multiplePaths"
					:key="indexPolyM"
					draggable
					editable
					:options="optionsMapExist"
					:paths="polygon"
					@paths_changed="pathsChanged(indexPolyM, $event, true)"
				></GmapPolygon>
			</template>
			<GmapPolyline :editable="isEditableMap" :options="optionsMapLine" :path="path" />
			<div v-if="polygons.length > 0">
				<GmapPolygon
					v-for="(polygon, indexPoly) in polygons"
					:key="indexPoly"
					:draggable="isZone"
					:editable="editableZone(indexPoly)"
					:options="optionsMapZone(indexPoly)"
					:paths="polygon"
					@paths_changed="pathsChanged(indexPoly, $event)"
					@rightclick="clickPolygon(indexPoly, $event)"
					@click="showPolygonName(indexPoly, $event)"
				/>
				<gmap-info-window
					v-if="infoWindowVisible"
					:opened="infoWindowVisible"
					:position="infoWindowPosition"
					@closeclick="closeInfoWindow"
				>
					<div>
						<p class="mb-2 primary--text label-info">Nombre de la zona</p>
						<p>{{ infoWindowName }}</p>
					</div>
				</gmap-info-window>
			</div>
			<template v-if="showInfoOrder">
				<gmap-info-window
					v-for="(m, index) in orders"
					:key="m.title"
					:opened="m.showInfo"
					@closeclick="closeInfo(m, index)"
					:options="infoOptions"
					:position="m.position"
				>
					<div v-for="i in orders">
						<div
							class="info-window"
							v-if="
								m.customerAddress.latitude === i.customerAddress.latitude &&
									m.customerAddress.longitude === i.customerAddress.longitude
							"
						>
							<map-info-window :orderSelected="i"></map-info-window>
						</div>
					</div>
				</gmap-info-window>
			</template>
			<template v-if="showInfo">
				<gmap-info-window
					v-for="(m, index) in arrayShowInfo"
					:key="m.title"
					:opened="m.showInfo"
					@closeclick="closeInfo(m, index)"
					:options="infoOptions"
					:position="m.position"
				>
					<div v-for="i in arrayShowInfo">
						<div
							class="info-window"
							v-if="
								m.position.lat === i.position.lat && m.position.lng === i.position.lng
							"
						>
							<div v-if="isHistory">
								<p class="mb-2 primary--text label-info">Cliente</p>
								<p class="mb-2"><span>Nombre: </span> {{ i.info.name }}</p>
								<p class="mb-0"><span>Dirección: </span> {{ i.info.address }}</p>
							</div>
							<div v-else-if="isCourier || isZoneAssignment">
								<p class="mb-2 primary--text label-info">{{ i.info.name }}</p>
								<p>{{ i.info.address }}</p>
							</div>
							<div v-else>
								<p class="mb-2 primary--text label-info">Repartidor</p>
								<p>{{ m.info.name }}</p>
							</div>
						</div>
					</div>
				</gmap-info-window>
			</template>
		</gmap-map>
		<v-menu
			:value="showMenu"
			:close-on-content-click="false"
			:position-x="x"
			:position-y="y"
			offset-y
			absolute
			@input="changeMenu"
		>
			<v-flex d-flex align-end wrap class="content-button">
				<button class="close-modal" @click="$emit('hide-menu')">X</button>
			</v-flex>
			<div class="menu-poli-form" v-if="poligon">
				<form class="form-style">
					<app-input-text
						label="Nombre del Polígono"
						model="name"
						tabindex="1"
						:text="poligon.name"
						@input="$emit('set-data', $event)"
					/>
					<small v-if="!poligon.name" class="error-message">El nombre es requerido</small>
					<app-input-text
						label="Descripción"
						model="description"
						tabindex="2"
						:text="poligon.description"
						@input="$emit('set-data', $event)"
					/>
					<small v-if="!poligon.description" class="error-message"
						>La descripción es requerida</small
					>
					<div class="buttons-container">
						<button
							class="btn-poli success"
							type="button"
							:disabled="!poligon.name || !poligon.description"
							@click="
								$emit('save-polygon', {
									polygonId: zoneId,
									pathsAreChanged,
									newPaths,
									optionsMap,
								})
							"
						>
							Aceptar
						</button>
						<button class="btn-poli cancel" type="button" @click="$emit('hide-menu')">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</v-menu>
		<v-menu
			:value="showMenuLine"
			:close-on-content-click="false"
			:position-x="xLine"
			:position-y="yLine"
			offset-y
			absolute
			@input="$emit('change-menu', $event)"
		>
			<v-flex d-flex align-end wrap class="content-button">
				<button class="close-modal" @click="$emit('hide-menu-line')">x</button>
			</v-flex>
			<div class="menu-poli-form" v-if="polyline">
				<form class="form-style">
					<app-input-text
						label="Nombre de la ruta"
						model="name"
						tabindex="1"
						:text="polyline.name"
						@input="$emit('set-data-line', $event)"
					/>
					<small v-if="!polyline.name" class="error-message"
						>El nombre es requerido</small
					>
					<app-input-text
						label="Descripción"
						model="description"
						tabindex="2"
						:text="polyline.description"
						@input="$emit('set-data-line', $event)"
					/>
					<div class="buttons-container">
						<button
							class="btn-poli success"
							type="button"
							:disabled="!polyline.name || loadingAccept"
							@click="
								$emit('save-polyline', {
									polylineId,
									pathsLineAreChanged,
									newPathsLine,
									optionsMapLine,
								})
							"
						>
							Aceptar
						</button>
						<button
							class="btn-poli cancel"
							type="button"
							@click="$emit('hide-menu-line')"
						>
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</v-menu>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import RouteStatus from '@/shared/route-status';
import Zone from '@/shared/zones';
import GmapCluster from 'vue2-google-maps/dist/components/cluster';
import mapInfoWindow from '@/components/shared/map/map-info-window';

function created() {
	this.center = this.centerLocation;
	this.localZoom = this.zoom;
	this.isLoading = true;
	setTimeout(() => {
		this.isLoading = false;
		if (this.showInfo) {
			this.arrayShowInfo = [...this.markers];
		}
	}, 2500);
	if (this.isDelivery) {
		this.flagPolygon = this.polygons.length === 0;
	}
	if (this.setPath) {
		let markers = [];
		if (this.$route.query.from) {
			const k =
				this.$route.query.from === 'pick-up-earrings' ? 'pickUpPoint' : 'deliveryPoint';
			markers = this.dataSelected.map((d) => {
				const newM = {
					lat: d.deliveryJson[k].latitude,
					lng: d.deliveryJson[k].longitude,
				};
				return newM;
			});
		} else {
			markers = this.dataSelected.map((d) => {
				const { position, customerAddress } = d;
				const newM = {
					lat: customerAddress ? customerAddress.location.x : position.lat,
					lng: customerAddress ? customerAddress.location.y : position.lng,
				};
				return newM;
			});
		}
		this.path = [...markers];
		this.pathIds = this.dataSelected.map((d) => d.id);
		this.optionsMapLine.paths = [...markers];
	}
}

function zoom(newZoom) {
	this.localZoom = newZoom;
}

function clickedOnMap(m) {
	if (this.isZone) {
		if (this.flagPolygon) {
			const {
				latLng: { lat, lng },
			} = m;
			this.optionsMap.paths.push({ lat: lat(), lng: lng() });
			if (this.isDelivery) {
				if (this.optionsMap.paths.length === 3 && this.multiplePaths) {
					this.$emit('add-polygon', this.optionsMap);
					this.optionsMap.multiplePaths.push([...this.optionsMap.paths]);
					this.optionsMap.paths = [];
				}
			}
		}
	} else if (this.isEditableMap) {
		this.clickedOnMapLine(m);
	}
}

function clickedOnMapLine(m, fromCustomer) {
	if (this.flagPolyline || this.routeId || this.ordersPolyline) {
		if (
			!this.routeStatus ||
			(this.routeStatus && this.routeStatus === RouteStatus.Pending)
		) {
			let markerLocation = null;
			if (fromCustomer) {
				if (this.$route.query.from) {
					const key =
						this.$route.query.from === 'pick-up-earrings'
							? 'pickUpPoint'
							: 'deliveryPoint';
					markerLocation = m.deliveryJson[key]
						? {
								lat: m.deliveryJson[key].latitude,
								lng: m.deliveryJson[key].longitude,
						  }
						: { lat: 0, lng: 0 };
				} else {
					markerLocation = m.customerAddress
						? {
								lat: m.customerAddress.location.x,
								lng: m.customerAddress.location.y,
						  }
						: { lat: 0, lng: 0 };
				}
			} else {
				markerLocation = m.position
					? { lat: m.position.lat, lng: m.position.lng }
					: { lat: m.latLng.lat(), lng: m.latLng.lng() };
			}
			const indexLocation = this.path.findIndex(
				(p) => p.lat === markerLocation.lat && p.lng === markerLocation.lng
			);
			const indexLocationId = this.pathIds.findIndex((i) => i === m.id);
			if (indexLocation > -1 && indexLocationId > -1) {
				this.optionsMapLine.paths.splice(indexLocation, 1);
				this.path.splice(indexLocation, 1);
				this.pathIds.splice(indexLocationId, 1);
			} else if (markerLocation.lng !== 0 && markerLocation.lat !== 0) {
				this.optionsMapLine.paths.push(markerLocation);
				this.path.push(markerLocation);
				this.pathIds.push(m.id);
			}
		} else {
			this.showNotification(
				'La ruta se encuentra en estado "Iniciada". Solo es posible editar la fecha final.',
				'info'
			);
		}
	}
}

function poligonAction() {
	this.id = 0;
	this.flagPolygon = !this.flagPolygon;
}

function polylineAction() {
	this.polylineId = 0;
	this.flagPolyline = !this.flagPolyline;
	this.$emit('draw-active', this.flagPolyline);
}

function centerLocation(newLocation) {
	this.center = newLocation;
}

function showOrderSelected(m, index) {
	this.orderSelected =
		this.orders.find((o) => o.customerId === m.info.id || o.customerId === m.id) || {};
	this.showByIndex = index;
}

function selectedMarker(m, fromCustomer, index) {
	if (!this.disabledSelectedMarker) {
		if (this.$route.name === 'pending-routes-map') {
			const orders = this.orders.map((or) => ({
				...or,
				position: {
					lat: or.customerAddress.latitude,
					lng: or.customerAddress.longitude,
				},
				showInfo:
					or.customerAddress.latitude === m.position.lat &&
					or.customerAddress.longitude === m.position.lng,
			}));
			this.$emit('selected-marker', orders, null, true);
		} else {
			this.showByIndex = index;
			this.clickedOnMapLine(m, fromCustomer);
			this.$emit('selected-marker', m, fromCustomer);
			if (this.showInfo) {
				this.arrayShowInfo = this.arrayShowInfo.map((k) => {
					const newMarker = { ...k };
					if (Number(k.title) === Number(m.title)) {
						newMarker.showInfo = !newMarker.showInfo;
					}
					return newMarker;
				});
			}
		}
	} else if (this.showInfo) {
		this.arrayShowInfo = this.arrayShowInfo.map((k) => {
			const newMarker = { ...k };
			if (Number(k.title) === Number(m.title) && k.title) {
				newMarker.showInfo = !newMarker.showInfo;
			}
			return newMarker;
		});
	}
}

function validations() {
	return {
		polyline: {
			name: { required },
		},
	};
}

function clickPolygon() {
	if (!this.isZone || this.flagPolyline) {
		this.clickPolyline();
	}
}

function clickPolyline() {}

function pathsChanged(index, event, newPolygonChange = false) {
	if (this.isZone && this.flagPolygon) {
		this.optionsMap.paths = Zone.editingZone(event);
		// console.log({ paths: this.optionsMap.paths });
	}
	if (this.isZone && !this.flagPolyline) {
		this.newPaths = Zone.editingZone(event);
		this.pathsAreChanged = index !== null && true;
		if (!this.isDelivery && index) {
			this.id = this.polygonsData[index].id;
		}
		if (this.isDelivery) {
			this.$emit('edit-polygon', this.newPaths, index, newPolygonChange);
		}
	}
}

function pathsLineChanged(index, event) {
	this.newPathsLine = Zone.editingZone(event);
	this.pathsLineAreChanged = true;
	this.polylineId = this.polylinesData[index].id;
}

function isZone() {
	return this.$route.name === 'page-zone-assignment' || this.$route.name === 'companies';
}

function isRoute() {
	return this.$route.name === 'new-route' || this.$route.name === 'edit-route';
}

function watchPathLine(line) {
	this.optionsMapLine.paths.push(line);
	this.path.push(line);
}

function watchPolylines(polylineData) {
	const rouCus = this.routeZonesCustomerAddress.map((rou) => ({
		customersAddressId: rou.customersAddressId,
	}));
	if (polylineData.length > 0 && rouCus && rouCus.length) {
		polylineData.forEach((p, index) => {
			if (rouCus[index] && rouCus[index].customersAddressId) {
				const newP = {
					position: { ...p },
					customersAddressId: rouCus[index].customersAddressId,
				};
				this.selectedMarker(newP);
			}
		});
	}
}

function optionsMapZone(index) {
	if (this.zoneId) {
		return this.polygonsData[index].id === Number(this.zoneId)
			? this.optionsMapExist
			: this.optionMapDisabled;
	}
	return this.optionsMapExist;
}

function editableZone(index) {
	if (this.zoneId) {
		return this.polygonsData[index].id === Number(this.zoneId) ? this.isZone : false;
	}
	return this.isZone;
}

function watchCustomerSelected(value) {
	this.selectedMarker(value, this.ordersPolyline);
}

function closeInfo(o, index) {
	if (this.$route.name === 'pending-routes-map') {
		const orders = this.orders.map((or) => {
			const newOr = { ...or };
			const valid =
				or.customerAddress.latitude === o.position.lat &&
				or.customerAddress.longitude === o.position.lng;
			if (valid) {
				newOr.showInfo = !newOr.showInfo;
			}
			return newOr;
		});
		this.$emit('selected-marker', orders, null, true);
	} else {
		this.arrayShowInfo = this.arrayShowInfo.map((m, i) => {
			const newMarker = { ...m };
			if (index === i) {
				newMarker.showInfo = !newMarker.showInfo;
			}
			return newMarker;
		});
		if (this.isRoute) {
			this.$emit('selected-marker', o);
		}
		this.showByIndex = null;
	}
}

function watchOptionsMap(optionsMap) {
	this.$emit('change-paths', optionsMap);
}

function changeMenu($event) {
	if (!$event) {
		this.$emit('close-menu');
	}
}

function watchMarkers(values) {
	this.arrayShowInfo = [...values];
}

function data() {
	return {
		clusterStyles: [
			{
				url: '/static/img/cluster.webp', // Aquí puedes poner la URL de un ícono de cluster genérico.
				height: 56,
				width: 56,
			},
		],
		showByIndex: null,
		center: {},
		disabledDeleteLine: true,
		flagPolygon: false,
		flagPolyline: false,
		generalOptions: {
			zoomControl: true,
			mapTypeControl: false,
			fullscreenControl: false,
		},
		localZoom: 0,
		localZoomMax: 17,
		id: 0,
		isLoading: false,
		polylineId: 0,
		optionsMap: {
			fillColor: 'color(primary)',
			fillOpacity: 0.15,
			paths: [],
			strokeColor: 'color(primary)',
			strokeWeight: 5,
			zIndex: 0,
			multiplePaths: [],
		},
		optionsMapLine: {
			fillColor: 'color(primary)',
			fillOpacity: 0.15,
			paths: [],
			strokeColor: 'color(primary)',
			strokeWeight: 5,
			zIndex: 20,
		},
		newPaths: [],
		newPathsLine: [],
		optionsMapExist: {
			fillColor: 'color(primary)',
			fillOpacity: 0.15,
			strokeColor: 'color(primary)',
			strokeWeight: 5,
		},
		optionsMapLineExist: {
			fillColor: 'color(primary)',
			fillOpacity: 0.15,
			strokeColor: 'color(primary)',
			strokeWeight: 3,
		},
		optionMapDisabled: {
			fillColor: '#b1b1b1',
			fillOpacity: 0.15,
			strokeColor: '#b1b1b1',
			strokeWeight: 5,
		},
		pathsAreChanged: false,
		pathsLineAreChanged: false,
		locationPolygon: null,
		locationPolyline: null,
		path: [],
		infoOptions: {
			pixelOffset: {
				width: 0,
				height: -35,
			},
		},
		infoOpened: false,
		infoPosition: null,
		nameDistributor: null,
		arrayShowInfo: [],
		pathIds: [],
		infoWindowVisible: false,
		infoWindowPosition: {},
		infoWindowName: '',
	};
}
/* global google */
export default {
	name: 'map-component',
	computed: {
		isZone,
		isRoute,
	},
	components: {
		mapInfoWindow,
		GmapCluster,
	},
	data,
	methods: {
		clickedOnMap,
		clickedOnMapLine,
		clickPolygon,
		clickPolyline,
		editableZone,
		optionsMapZone,
		pathsChanged,
		pathsLineChanged,
		poligonAction,
		polylineAction,
		selectedMarker,
		closeInfo,
		changeMenu,
		showOrderSelected,
		labelIcon(m) {
			if (!m.duplicateCount || m.duplicateCount === 1) {
				return null;
			}
			return {
				text: `+ ${m.duplicateCount.toString()}`,
				color: 'black',
				fontSize: '17px',
				fontWeight: 'bold',
				labelAnchor: { x: 500, y: 0 },
			};
		},
		noCalculator() {
			return {
				text: '',
				index: 0,
			};
		},
		showPolygonName(index, event) {
			const latLng = event.latLng;
			this.infoWindowName = this.polygonsData[index].name;
			this.infoWindowPosition = { lat: latLng.lat(), lng: latLng.lng() };
			this.closeInfoWindow();
		},
		closeInfoWindow() {
			this.infoWindowVisible = !this.infoWindowVisible;
		},
		getMarkerIcon({ orderStateId, icon }) {
			if (orderStateId === 3) {
				return icon;
			}
			return null;
		},
		adjustZoomToFitMarkers() {
			const map = this.$refs.mapRef.$mapObject;
			if (!map || !this.markers.length) return;

			const bounds = new google.maps.LatLngBounds();

			this.markers.forEach((marker) => {
				const pos = new google.maps.LatLng(marker.position.lat, marker.position.lng);
				bounds.extend(pos);
			});

			map.fitBounds(bounds);
		},
	},
	created,
	props: {
		centerLocation: {
			default: () => {},
			type: Object,
		},
		customerSelected: {
			default: () => {},
			type: Object,
		},
		disabledSelectedMarker: {
			default: false,
			type: Boolean,
		},
		markers: {
			default: () => [],
			type: Array,
		},
		ordersPolyline: {
			default: false,
			type: Boolean,
		},
		pathLine: {
			default: () => {},
			type: Object,
		},
		poligon: {
			default: () => {},
			type: Object,
		},
		polygons: {
			default: () => [],
			type: Array,
		},
		polyline: {
			default: () => {},
			type: Object,
		},
		polylines: {
			default: () => [],
			type: Array,
		},
		polygonsData: {
			default: () => [],
			type: Array,
		},
		polylinesData: {
			default: () => [],
			type: Array,
		},
		routeStatus: [Number, String],
		routeId: [Number, String],
		showMenu: {
			default: false,
			type: Boolean,
		},
		showMenuLine: {
			default: false,
			type: Boolean,
		},
		x: [Number, String],
		y: [Number, String],
		xLine: [Number, String],
		yLine: [Number, String],
		zoneId: [Number, String],
		zoom: {
			deafult: 12,
			type: Number,
		},
		showInfo: {
			type: Boolean,
			default: false,
		},
		showInfoOrder: {
			type: Boolean,
			default: false,
		},
		isDelivery: {
			type: Boolean,
			default: false,
		},
		isEditableMap: {
			type: Boolean,
			default: true,
		},
		isHistory: {
			type: Boolean,
			default: false,
		},
		isCourier: {
			type: Boolean,
			default: false,
		},
		multiplePaths: {
			type: Boolean,
			default: false,
		},
		isZoneAssignment: {
			type: Boolean,
			default: false,
		},
		dataSelected: {
			type: Array,
			default: () => [],
		},
		routeZonesCustomerAddress: {
			type: Array,
			default: () => [],
		},
		setPath: {
			type: Boolean,
			default: false,
		},
		orders: {
			type: Array,
			default: () => [],
		},
		loadingAccept: {
			type: Boolean,
			default: false,
		},
	},
	validations,
	watch: {
		centerLocation,
		customerSelected: {
			deep: true,
			handler: watchCustomerSelected,
		},
		pathLine: {
			deep: true,
			handler: watchPathLine,
		},
		polylines: {
			deep: true,
			handler: watchPolylines,
		},
		zoom,
		optionsMap: {
			deep: true,
			handler: watchOptionsMap,
		},
		markers: {
			deep: true,
			handler: watchMarkers,
		},
	},
};
</script>

<style lang="scss" scoped>
.gmap-container {
	height: calc(100vh - 159px);
	position: relative;
}

.poli-button {
	align-items: center;
	background-color: white;
	border-radius: 3px;
	box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
	display: flex;
	height: 34px;
	justify-content: center;
	left: 20px;
	position: absolute;
	top: 30px;
	width: 34px;
	z-index: 1;
}

.poli-button-dark {
	filter: brightness(0.8);
}

.poli-button:active {
	transform: scale(1.01);
}

.menu-poli-form {
	background-color: white;
	border-radius: 8px;
	padding: 17px 25px;
}

.buttons-container {
	align-items: center;
	display: flex;
	justify-content: space-around;
	margin-top: 20px;
	padding: 0 30px;
}

.btn-poli {
	border-radius: 3px;
	color: white;
	font-size: size(small10);
	margin: 0 5px;
	padding: 9px 30px;
}

.sucess {
	background-color: color(primary);
}

.cancel {
	background-color: color(makiRed);
}

.error-message {
	color: color(red-error);
	font-size: size(small10);
	margin-bottom: 10px;
}

.form-style {
	display: flex;
	flex-direction: column;
}

.btn-delete {
	left: 40px;
	position: relative;
}

.close-modal {
	color: color(makiRed);
	position: absolute;
	right: 10px;
	top: 8px;
}

.content-button {
	background-color: color(white);
}

.loading-map {
	background-color: rgba(0, 0, 0, 0.6);
	height: 100%;
	position: absolute;
	width: 100%;
	z-index: 1;

	&-container {
		background-color: color(white);
		border: 2px solid color(background-sidebar);
		border-radius: 6px;
	}

	&-text {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small13);
	}
}

.label-info {
	font-size: 12px;
	font-weight: 700;
}

.h-450 {
	height: 450px;
}
</style>
