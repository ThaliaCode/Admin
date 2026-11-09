<template>
	<div>
		<header-page
			caption-navigation="Venta de Campo"
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			:show-clean="false"
		>
			<v-btn
				color="primary"
				class="mr-0"
				@click="updatePosition"
			>
				Actualizar Posición
			</v-btn>
		</header-page>
		<distributors-tracking-map
			:center-location="mapData.centerLocation"
			:markers="mapData.markers"
			:zoom="mapData.zoom"
			@selected-marker="selectedMarker"
		></distributors-tracking-map>
		<v-dialog
			v-model="notMarkers"
			persistent
			max-width="425"
		>
			<v-card>
				<v-card-title class="headline" text-xs-center>
					<p class="text-xs-center w-100 mb-0">No se encontraron Vendedores</p>
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					<v-layout>
						<v-flex xs1>
							<v-icon color="error" size="30">report_problem</v-icon>
						</v-flex>
						<v-flex xs10>
							<p class="mb-0 text-xs-center w-100">{{ message }}</p>
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs12 pr-1
							text-xs-center>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="closeDialog"
							>
								Cerrar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import distributorsTrackingMap from '@/components/delivery/distributors-tracking-map';
	import helper from '@/shared/helper';

	const { getLocalData, setLocalData } = helper;

	function created() {
		if (!JSON.parse(window.localStorage.getItem(`${process.env.STORAGE_USER_KEY}::firebase-key`))) {
			this.loadInformation();
		}
	}

	function mounted() {
		this.loadDistributors();
	}

	function calculateCenter(points) {
		const bounds = new window.google.maps.LatLngBounds();
		points.forEach((p) => {
			bounds.extend(p);
		});
		return bounds.getCenter();
	}

	async function loadInformation() {
		const response = await this.$httpSales.get('integration-firebase');
		this.showFirebase = !!response.data;
		if (response.data) {
			setLocalData('firebase-key', response.data.apiKey);
			setLocalData('firebase-key-id', response.data.appId);
			setLocalData('firebase-auth-domain', response.data.authDomain);
			setLocalData('data-base-url', response.data.databaseURL);
			setLocalData('project-id', response.data.privateKey.project_id);
		}
	}


	function initFirebase(onChange) {
		const companyCode = getLocalData('admin-user').company.code;
		const companyRef = db.ref(`${companyCode}_sales`);
		companyRef.on('value', (snapshot) => {
			onChange(snapshot.val());
		});
	}

	function initMap() {
		initFirebase((value) => {
			if (value) {
				this.groupData.push(value);
				setLocalData('lastTimestamp', value);
				const points = Object.entries(value).map(([key, point]) => ({
					lat: point.latitude,
					lng: point.longitude,
					code: key,
				}));
				const newLocation = calculateCenter(points);
				if (newLocation) {
					this.mapData.centerLocation = {
						lat: newLocation.lat(),
						lng: newLocation.lng(),
					};
				}
				this.mapData.markers = [];
				points.forEach((p) => {
					if (this.getDelivery(p.code)) {
						const marker = new window.google.maps.Marker({
							position: p,
							title: p.code,
							info: {
								name: this.getDelivery(p.code),
							},
							showInfo: false,
							icon: '/static/img/maker-distributor.svg',
						});
						this.mapData.markers.push(marker);
					}
				});
				if (this.mapData.markers.length === 0) {
					this.message = 'No se encuentra ningún vendedor en el mapa';
					this.notMarkers = true;
				}
			} else {
				this.message = 'Comuníquese con Soporte';
				this.notMarkers = true;
			}
		});
	}

	function selectedMarker(value) {
		this.markerSelected = value;
	}

	async function loadDistributors() {
		try {
			({ data: this.distributors } = await this.$httpSales.get('sellers'));
			this.initMap();
			// this.interval();
		} catch (error) {
			this.showGenericError();
		}
	}

	function getDelivery(key) {
		const index = this.distributors.findIndex(d => Number(key) === Number(d.employeeId));
		if (index > -1) {
			return `${this.distributors[index].name} ${this.distributors[index].lastname}`;
		}
		return null;
	}

	function interval() {
		setInterval(() => {
			const lastTimestamp = getLocalData('lastTimestamp');
			if (this.groupData.length === 1) {
				this.mapData.markers = this.mapData.markers.map((m) => {
					const newMarker = { ...m };
					newMarker.icon = '/static/img/marker-disabled.svg';
					return newMarker;
				});
			} else {
				const num = this.groupData.length;
				this.mapData.markers = this.mapData.markers.map((m) => {
					const newMarker = { ...m };
					newMarker.icon =
						this.groupData[num - 1][m.title].timestamp === lastTimestamp[m.title].timestamp
							? '/static/img/marker-disabled.svg' : '/static/img/maker-distributor.svg';
					return newMarker;
				});
			}
		}, 600000);
	}

	function updatePosition() {
		const lastTimestamp = getLocalData('lastTimestamp');
		if (this.groupData.length === 1) {
			this.mapData.markers = this.mapData.markers.map((m) => {
				const newMarker = { ...m };
				newMarker.icon = '/static/img/marker-disabled.svg';
				return newMarker;
			});
		} else {
			const num = this.groupData.length;
			this.mapData.markers = this.mapData.markers.map((m) => {
				const newMarker = { ...m };
				newMarker.icon =
					this.groupData[num - 1][m.title].timestamp === lastTimestamp[m.title].timestamp
						? '/static/img/marker-disabled.svg' : '/static/img/maker-distributor.svg';
				return newMarker;
			});
		}
	}

	function closeDialog() {
		this.notMarkers = false;
	}

	function data() {
		return {
			markerSelected: null,
			mapData: {
				centerLocation: { lat: -9.8340134, lng: -75.9097627 },
				markers: [],
				zoom: 7,
			},
			distributors: [],
			groupData: [],
			notMarkers: false,
			message: null,
		};
	}

	export default {
		name: 'vendor-monitoring',
		components: {
			distributorsTrackingMap,
		},
		data,
		created,
		methods: {
			initMap,
			loadInformation,
			selectedMarker,
			loadDistributors,
			getDelivery,
			interval,
			closeDialog,
			updatePosition,
		},
		mounted,
	};
</script>

<style lang="scss" scoped>
	.w-100 {
		width: 100%;
	}
</style>
