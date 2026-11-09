<template>
	<div>
		<header-page
			name="route-courier-detail"
			:title="title"
			:limitTitle="30"
		/>
		<v-layout>
			<v-flex xs4 px-3 pt-4>
				<v-layout wrap>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Nro de Servicio</v-flex>
							<v-flex class="c-text-green" xs5>{{ detailCommerce.number || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Método de Pago</v-flex>
							<v-flex class="c-text-green" xs5>{{ detailCommerce.wayPayment ? detailCommerce.wayPayment.name : '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Monto</v-flex>
							<v-flex class="c-text-green" xs5>{{ detailCommerce.total | round }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Envio</v-flex>
							<v-flex class="c-text-green" xs5>{{ detailCommerce.pickUpName || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-4>
						<v-layout>
							<v-flex class="content-green" xs7>Estado del Pedido</v-flex>
							<v-flex class="c-text-green" xs5>{{ detailCommerce.orderState ? detailCommerce.orderState.name : '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<span class="title-details-table">Punto de Recojo</span>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Contacto</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'pickUpPoint', 'contact') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Número de Contacto</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'pickUpPoint', 'contactNumber') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Dirección</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'pickUpPoint', 'addressLine') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-4>
						<v-layout>
							<v-flex class="content-green" xs7>Que hacer</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'pickUpPoint', 'todo') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<span class="title-details-table">Punto de Entrega</span>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Contacto</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'deliveryPoint', 'contact') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Número de Contacto</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'deliveryPoint', 'contactNumber') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-layout>
							<v-flex class="content-green" xs7>Dirección</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'deliveryPoint', 'addressLine') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout>
							<v-flex class="content-green" xs7>Que hacer</v-flex>
							<v-flex class="c-text-green" xs5>{{ getValue(detailCommerce, 'deliveryPoint', 'todo') || '---' }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-2 mt-4 v-if="detailCommerce.additionalInfo ? detailCommerce.additionalInfo.photos : false">
						<span class="title-details-table">Fotos</span>
					</v-flex>
					<v-flex xs12 v-if="detailCommerce.additionalInfo ? detailCommerce.additionalInfo.photos : false" >
						<content-images 
							:images="detailCommerce.additionalInfo.photos"/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs8>
				<div class="map-container">
					<map-component
						:center-location="centerLocation"
						:markers="markers"
						:zoom="zoom"
						is-courier
						show-info
					/>
				</div>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import lib from '@/shared/lib';
import headerPage from '@/components/shared/header-page';
import mapComponent from '@/components/shared/map/map-component';
import contentImages from '@/components/shared/content-images';

const { getDeeper } = lib;

function created() {
	this.loadData();
}

async function loadData() {
	try {
		const { data: response } = await this.$httpSales.get(`orders/${this.id}`);
		this.detailCommerce = response;
		this.markers = [
			{
				icon: '/static/img/activo-history.png',
				position: {
					lat: this.getValue(this.detailCommerce, 'pickUpPoint', 'latitude'),
					lng: this.getValue(this.detailCommerce, 'pickUpPoint', 'longitude'),
				},
				showInfo: true,
				courier: true,
				info: {
					name: 'Punto de Recojo',
					address: this.getValue(this.detailCommerce, 'pickUpPoint', 'addressLine'),
				},
				title: 11,
			},
			{
				icon: '/static/img/green-marker.png',
				position: {
					lat: this.getValue(this.detailCommerce, 'deliveryPoint', 'latitude'),
					lng: this.getValue(this.detailCommerce, 'deliveryPoint', 'longitude'),
				},
				showInfo: true,
				courier: true,
				info: {
					name: 'Punto de Entrega',
					address: this.getValue(this.detailCommerce, 'deliveryPoint', 'addressLine'),
				},
				title: 22,
			},
		];
		const points = this.markers.map(m => m.position);
		this.centerLocation = this.calculateCenter(points);
	} catch (error) {
		this.showError();
	}
}

function getValue(row, valueOne, valueTwo) {
	return getDeeper('deliveryJson', valueOne, valueTwo)(row);
}

function title() {
	if (this.$route.query) {
		if (this.$route.query.origin === 'free') {
			return `Detalle de Pedido Libre - Nro ${this.detailCommerce.number}`;
		}
	}
	return `Detalle de Pedido Courier - Nro ${this.detailCommerce.number}`;
}

function calculateCenter(points) {
	const bounds = new window.google.maps.LatLngBounds();
	points.forEach((p) => {
		bounds.extend(p);
	});
	return bounds.getCenter();
}

function data() {
	return {
		detailCommerce: {},
		markers: [],
		zoom: 12,
		centerLocation: {
			lat: -0.24187842216902367,
			lng: -78.5206242727584,
		},
	};
}

export default {
	name: 'page-ecommerce-courier-detail',
	data,
	created,
	components: {
		headerPage,
		mapComponent,
		contentImages,
	},
	computed: {
		title,
	},
	methods: {
		loadData,
		getValue,
		calculateCenter,
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
	.content-green {
		background: map-get($colors, title-green);
		color: map-get($colors, background-sidebar);
		font-weight: 700;
		padding: 4px 12px;
	}

	.c-text-green {
		background: map-get($colors, text-green);
		color: map-get($colors, paginationText);
		padding: 4px 12px;
	}

	.title-details-table {
		color: map-get($colors, blue-card);
		font-family: map-get($fonts, open-bold);
	}

	.map-container {
		height: 100%;
		width: 100%;

		.gmap-container {
			height: 100% !important;
		}
	}
</style>