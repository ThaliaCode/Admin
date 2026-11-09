<template>
	<div>
		<header-page :title="$route.meta.title"></header-page>
		<v-layout wrap justify-end>
			<v-flex xs9>
				<div class="map-container">
					<map-component
						:zoom="zoom"
						:center-location="centerLocation"
						:polygons="zonesView"
						:polygons-data="zonesData"
						:x="x"
						:y="y"
						show-info
						is-zone-assignment
					/>
				</div>
			</v-flex>
			<v-flex xs3>
				<v-flex xs12 py-3 mx-2>
					<p class="name-title">Zonas</p>
				</v-flex>
				<v-flex xs12 mb-2>
					<bar-information
						:information="info"
						:row-style="false"
						:show-colon="false"
					></bar-information>
				</v-flex>
				<v-flex style="height: 70vh; overflow-y: auto">
					<v-layout wrap class="customers-container" align-content-start>
						<v-flex
							v-for="(zone, index) in zonesData"
							:key="zone.id"
							py-1
							xs12
							mx-2
						>
							<customer-card
								:active="zone.isSelected"
								:customer="zone"
								:show-status="false"
								@card-action="onCardAction(index)"
							></customer-card>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import barInformation from '@/components/field-sale/shared/bar-information';
import mapComponent from '@/components/shared/map/map-component';
import customerCard from '@/components/field-sale/shared/customer-card';
import Zone from '@/shared/zones';

const Polygon = new Zone();

function data() {
	return {
		latitude: 0,
		longitude: 0,
		centerLocation: {
			lat: 0,
			lng: 0,
		},
		zoom: 10,
		zonesData: [],
		zonesView: [],
		zones: [],
		x: 0,
		y: 0,
		info: [
			{
				id: 1,
				label: 'Total',
				value: '0 zonas',
			},
		],
	};
}

export default {
	name: 'page-all-zones',
	data,
	components: {
		mapComponent,
		customerCard,
		barInformation,
	},
	created() {
		this.latitude = this.labelsByCountry.geoposition.lat;
		this.longitude = this.labelsByCountry.geoposition.lng;
		this.centerLocation = this.labelsByCountry.geoposition;
		this.loadZones();
	},
	methods: {
		async loadZones() {
			const { data: zones } = await this.$httpSales.get('zones', {
				params: this.params,
			});
			this.zonesData = zones.map((zone) => ({
				...zone,
				isSelected: false,
			}));

			this.info[0].value = `${zones.length} zonas`;
			this.zonesView = Polygon.formatZones(zones);
			this.zones = Polygon.formatZones(zones);
		},
		onCardAction(index) {
			this.zonesData = this.zonesData.map((zone, i) => ({
				...zone,
				isSelected: i === index ? !zone.isSelected : zone.isSelected,
			}));
			this.zonesView = this.zones.filter(
				(_, i) => this.zonesData[i].isSelected
			);
			if (this.zonesView.length === 0) {
				this.zonesView = this.zones;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.map-container {
	height: 100%;
	width: 100%;
}

#scroll-target {
	height: calc(100% - 185px);
	overflow: auto;

	.customers-container {
		height: 100%;
	}
}

.name-title {
	border-bottom: 2px solid color(blue-card);
	color: color(blue-card);
	font-family: font(lato-regular);
	font-size: size(medium);
	margin-bottom: 0px;
	padding-bottom: 6px;
}

.selected-item {
	border: 2px solid #000;
}
</style>
