<template>
	<div>
		<div class="delivery-info">Crea polígonos como máximo de 6 puntos y establece tu zona de reparto.</div>
		<div class="map-container">
			<map-component
				:zoom="zoom"
				:markers="customersMarkers"
				:center-location="centerLocation"
				:poligon="poligon"
				:polygons="zones"
				@add-polygon="addPolygon"
				@edit-polygon="editPolygon"
				is-delivery
				multiple-paths
				:x="x"
				:y="y"
			/>
		</div>
	</div>
</template>
<script>
import mapComponent from '@/components/shared/map/map-component';

function calculateCenter(points) {
	const bounds = new window.google.maps.LatLngBounds();
	points.forEach((p) => {
		bounds.extend(p);
	});
	return bounds.getCenter();
}

function mounted() {
	if (this.zones.length) {
		if (window.google) {
			this.centerLocation = calculateCenter(this.zones[0]);
		} else {
			this.centerLocation = this.labelsByCountry.geoposition;
			setTimeout(() => {
				this.centerLocation = calculateCenter(this.zones[0]);
			}, 1000);
		}
	} else {
		this.centerLocation = this.labelsByCountry.geoposition;
	}
}

function addPolygon(paths) {
	this.$emit('add-polygon', paths);
}

function editPolygon(newPaths, index, flag) {
	this.$emit('edit-polygon', newPaths, index, flag);
}

function data() {
	return {
		zoom: 15,
		customersMarkers: [],
		centerLocation: { lat: 0, lng: 0 },
		poligon: {
			description: '',
			id: null,
			name: '',
		},
		zonesData: [],
		zones2: [],
		x: 0,
		y: 0,
	};
}
export default {
	name: 'delivery-zone',
	data,
	mounted,
	components: {
		mapComponent,
	},
	methods: {
		addPolygon,
		editPolygon,
	},
	props: {
		zones: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
<style lang="scss" scoped>
	.map-container {
		height: 100%;
		width: 100%;
	}
	
	.delivery-info {
		background-color: #deedee;
		color: color(primary);
		font-weight: 700;
		padding: 5px 30px;
	}
</style> 
