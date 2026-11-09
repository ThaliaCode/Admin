<template>
	<div>
		<header-page
			:caption-navigation="captionNavigation"
			:title="$route.meta.title"
			:btn-header-link="btnHeaderLink"
			btn-header-text="Ver Mapa"
			btn-header-show
		></header-page>
		<app-actions :resource-uri="$route.name" @run-action="runAction" />
		<div class="text-xs-left mb-2 ml-4">
			<div class="value-container">
				<div class="label-container">
					<label class="label-detail secondary--text body-1"
						>Total de clientes:</label
					>
				</div>
				<p class="value-detail body-1">
					<strong>{{ totalCustomers }}</strong>
				</p>
			</div>
		</div>
		<zones-list
			class="mt-4"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@go-to-routes="goTo('routes', { params: { zoneId: $event.id } })"
			@on-page="loadData"
			@on-search="onSearch"
			@delete-zone="openConfirmation"
			@edit-zone="editZone"
		></zones-list>
		<v-dialog v-model="dialog" persistent max-width="425">
			<v-card>
				<v-card-title class="headline justify-center">
					{{ messageDelete }}
				</v-card-title>
				<v-card-text class="subtext">
					Recuerda que una vez realizada la eliminación no se podrá restaurar la
					zona eliminada pero puedes volver a crear una zona con los mismos
					puntos ubicación.
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="deleteZone"
							>
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<simple-modal
			:open="showModalFinishRoutes"
			@close="showModalFinishRoutes = false"
			@cancel="showModalFinishRoutes = false"
			@confirm="finishAllRoutes"
		>
			<span slot="title">
				¿Está seguro de finalizar <b class="error--text">todas</b> las rutas de
				manera masiva?
			</span>
			<span slot="subtitle"> </span>
			<span slot="message"> </span>
		</simple-modal>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import zonesList from '@/components/field-sale/zones/zones-list';
import simpleModal from '@/components/field-sale/shared/simple-modal';

function created() {
	this.loadData();
}

function cancelDelete() {
	this.dialog = false;
	this.zoneId = null;
	this.messageDelete = '';
}

async function deleteZone() {
	try {
		await this.$httpSales.delete(`zones/${this.zoneId}`);
		this.showNotification('La zona ha sido eliminada correctamente');
		this.cancelDelete();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params };
	const { data: zones, headers } = await this.$httpSales.get('zones', {
		params,
	});
	this.rows =
		zones.length > 0
			? zones.map((z) => {
					const newZ = { ...z };
					const { provinceId, province, cityId, city, parishId, parish } = z;
					if (provinceId && cityId && parishId) {
						if (parish && city && province) {
							newZ.address = `${parish.name}, ${city.name}, ${province.name}`;
						} else {
							newZ.address = '';
						}
					} else if (provinceId && cityId) {
						newZ.address = `${city.name}, ${province.name}`;
					} else if (provinceId) {
						newZ.address = province.name;
					}
					newZ.customersQuantity = z.customers.length;
					return newZ;
			  })
			: [];
	this.totalCustomers = this.rows.reduce(
		(sum, obj) => sum + obj.customersQuantity,
		0
	);
	this.lastPage = Number(headers['x-last-page']);
	this.captionNavigation = `${headers['x-quantity']} zonas creadas`;
}

function openConfirmation({ id, name }) {
	this.zoneId = id;
	this.messageDelete = `¿Desea eliminar la zona '${name}'?`;
	this.dialog = true;
}

function editZone({ id }) {
	this.goTo('page-zone-assignment', { params: { id } });
}

function onSearch(value) {
	this.params.search = value ? value.trim() : null;
	this.cleanSearch = !value;
	this.loadData();
}

function data() {
	return {
		btnHeaderLink: 'all-zones',
		captionNavigation: '',
		cleanSearch: false,
		columns: [
			{
				id: 1,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Ubicación',
				value: 'address',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Área (km²)',
				value: 'area',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: '# Clientes',
				tooltip: 'Número de Clientes',
				value: 'customersQuantity',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Acciones',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		dialog: false,
		lastPage: 0,
		messageDelete: '',
		params: {
			limit: 30,
			page: 1,
			search: null,
		},
		rows: [],
		zoneId: null,
		totalCustomers: 0,
		showModalFinishRoutes: false,
	};
}

export default {
	name: 'page-zones',
	components: {
		appActions,
		headerPage,
		zonesList,
		simpleModal,
	},
	created,
	data,
	methods: {
		cancelDelete,
		deleteZone,
		editZone,
		loadData,
		onSearch,
		openConfirmation,
		runAction({ codeWeb, code }) {
			if (code === 'massive-finish-routes') {
				this.showModalFinishRoutes = true;
			} else {
				this.goTo(codeWeb);
			}
		},
		async finishAllRoutes() {
			try {
				await this.$httpSales.patch(
					`routers/massive-finish?date=${this.$today()}`
				);
				this.showNotification(
					'Todas las rutas fueron finalizadas correctamente'
				);
			} catch (error) {
				const message = error.data && error.data.message;
				this.showGenericError(message);
			} finally {
				this.showModalFinishRoutes = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}

.label-container {
	background-color: color(border-green-light);
	display: inline-flex;
	height: 31px;
	line-height: 31px;
	padding-left: 5px;
	width: 130px;
}

.label-detail {
	font-family: font(open-semibold);
}

.value-container {
	align-items: center;
	background-color: color(green-extra-l);
	display: flex;
	height: 31px;
	min-width: 205px;
	padding-right: 11px;
	width: fit-content;
}

.value-detail {
	color: color(paginationText);
	font-family: font(open-regular);
	display: inline-flex;
	margin-bottom: 0px;
	padding-left: 11px;
}
</style>
