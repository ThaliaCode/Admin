<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
				toda la información del cliente."
		/>
		<v-tabs v-model="active" slider-color="black" align-with-title>
			<v-tab v-for="t in tabs" :key="t.id" ripple>
				{{ t.title }}
			</v-tab>
			<v-tab-item>
				<v-layout row wrap container justify-center>
					<v-flex xs10 mb-3>
						<v-text-field
							hide-details
							readonly
							label="Nombre"
							v-model="customer.typePerson.fullName"
							class="filter-select"
						></v-text-field>
					</v-flex>
					<v-flex xs10 mb-3>
						<v-text-field
							hide-details
							readonly
							label="Dirección"
							v-model="customer.address"
							class="filter-select"
						></v-text-field>
					</v-flex>
					<v-flex xs10 mb-3>
						<v-text-field
							hide-details
							readonly
							label="Número Documento (DNI/RUC)"
							v-model="customer.typePerson.documentNumber"
							class="filter-select"
						></v-text-field>
					</v-flex>
					<v-flex xs10 mb-3>
						<v-text-field
							hide-details
							readonly
							label="Correo"
							v-model="customer.email"
							class="filter-select"
						></v-text-field>
					</v-flex>
					<v-flex xs10 mb-3>
						<v-text-field
							hide-details
							readonly
							label="Teléfono"
							v-model="customer.phone"
							class="filter-select"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-tab-item>
			<v-tab-item>
				<v-layout row wrap justify-end>
					<v-flex xs12 pt-3>
						<app-table
							name="customer-details-sales"
							:columns="saleColumns"
							:current-page="currentSalePage"
							:rows="sales"
							local-storage
							:last-page="lastSalePage"
							:items-quantity="sales.length"
							:items-total-quantity="detailQuantity"
							v-on:on-page="changeSalePage"
							@on-search-event="onSearch"
						>
							<template slot="rows" slot-scope="props">
								<td>{{ props.row.typeDocument.code }}</td>
								<td>{{ props.row.serie }}-{{ props.row.number }}</td>
								<td>{{ props.row.state.name }}</td>
								<td>{{ props.row.createdAt }}</td>
								<td>{{ props.row.amount }}</td>
							</template>
						</app-table>
					</v-flex>
					<!-- <v-flex xs12 pa-3>
						<p class="foo-total">Total unidades adquiridas: </p>
						<p class="foo-total">Total</p>
					</v-flex> -->
				</v-layout>
			</v-tab-item>
			<v-tab-item>
				<v-layout wrap>
					<v-flex xs12>
						<customers-details-products :customer-id="customerId" />
					</v-flex>
					<!-- <v-flex xs12 pa-3 text-xs-right>
						<p class="foo-total">Total unidades adquiridas: </p>
						<p class="foo-total">Total</p>
					</v-flex> -->
				</v-layout>
			</v-tab-item>
			<v-tab-item>
				<v-flex xs12 px-3 pt-3 class="content-address">
					<v-radio-group
						v-if="customerAddress.length >= 1"
						v-model="selectedAddress"
						px-3
						pt-3
					>
						<v-radio
							v-for="(item, index) in customerAddress"
							:label="item.textAddress"
							:value="item.addressLine1"
							color="primary"
							class="mb-2 label-radio"
							:ripple="false"
							@change="changeType(item)"
							:key="index"
						>
						</v-radio>
					</v-radio-group>
					<v-flex class="text--primary" v-else>
						<div class="opacity-warehouse">
							<p class="text-opacity">
								El cliente no cuenta con asignacion de direcciones, para crear una
								dirección.
								<a @click.prevent="createAddress" target="_blank" class="link"
									>Listado de cliente / Editar Cliente / Agregar Direccion</a
								>
							</p>
						</div>
					</v-flex>
				</v-flex>
			</v-tab-item>
		</v-tabs>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@accept-button-clicked="selectAddres"
				success-text="Seleccionar Dirección"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import customersDetailsProducts from '@/components/customers/customers-details-products';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.customerId = this.customer.id;
	if (this.customer && !this.customer.address) {
		this.customer.address = '-';
	}
	this.tabs = [
		{ id: 1, title: 'Detalle' },
		{ id: 2, title: 'Compras' },
		{ id: 3, title: 'Productos' },
		{ id: 4, title: 'Direcciones' },
	];
	this.loadData();
	this.loadDataSales();
}

async function loadDataSales(page = 1) {
	this.currentSalePage = page;
	this.paramsSales.page = page;
	try {
		({ data: this.sales, headers: this.headers } = await this.$httpSales.get(
			`sale-documents?customerId=${this.customerId}`,
			{ params: this.paramsSales }
		));
		this.lastSalePage = Number(this.headers['x-last-page']);
		this.detailQuantity = Number(this.headers['x-quantity']);
	} catch (error) {
		console.error(error);
		this.showGenericError();
	}
}

async function loadData() {
	this.loadingGeneral = true;
	const params = {
		customerId: this.customerId,
	};
	const requests = [
		// this.$httpSales.get(`sale-documents?customerId=${this.customerId}`),
		this.$httpSales.get('customers-address', { params }),
	];
	try {
		[{ data: this.customerAddress }] = await Promise.all(requests);
		this.customerAddress = this.customerAddress.map((addres) => {
			const newRow = { ...addres };
			newRow.textAddress = `Alias: ${addres.name || ''} - ${addres.addressLine1}`;
			return newRow;
		});
		// this.customer.selectAddress = this.customerAddress && this.customerAddress.length >= 1
		// 	? this.customerAddress[0].addressLine1 : null;
		// this.customer.selectAddressId = this.customerAddress && this.customerAddress.length >= 1
		// 	? this.customerAddress[0].id : null;
	} catch (error) {
		console.error(error);
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
	}
}

function changeSalePage(page) {
	this.currentSalePage = page;
	this.loadDataSales(page);
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.paramsSales.search = searchTrim || null;
	this.loadDataSales();
}

function createAddress() {
	const routeData = this.$router.resolve({
		name: 'customer-address',
		params: { id: this.customer.id },
	});
	window.open(routeData.href, '_blank');
}

function selectAddres() {
	const address = this.customerAddress.find((c) => c.id === this.selectedAddressId);
	this.$emit('select-address', {
		selectAddress: this.selectedAddress,
		selectAddressId: this.selectedAddressId,
		alias: address && address.name,
	});
	this.$emit('close-modal');
}

function changeType(value) {
	this.selectedAddress = value.addressLine1;
	this.selectedAddressId = value.id;
}

function data() {
	return {
		active: 0,
		customerAddress: [],
		currentSalePage: 1,
		detailQuantity: 0,
		lastSalePage: 0,
		listDirectiom: [],
		loadingGeneral: false,
		saleColumns: [
			{ id: 1, name: 'Tipo', value: 'type', visible: true },
			{ id: 2, name: '#DOC', value: 'doc', visible: true },
			{ id: 3, name: 'Estado', value: 'status', visible: true },
			{ id: 4, name: 'Fecha', value: 'date', visible: true },
			{ id: 5, name: 'Total', value: 'total', visible: true },
		],
		sales: [],
		selectedAddress:
			(this.customer && this.customer.selectAddress) || this.selectAddress || null,
		selectedAddressId: (this.customer && this.customer.selectAddressId) || null,
		tabs: [],
		paramsSales: {
			limit: 20,
			page: 1,
			search: null,
		},
		typePerson: 1,
		upCustomer: this.customer,
	};
}

export default {
	name: 'customer-resume',
	components: {
		appTable,
		customersDetailsProducts,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		changeSalePage,
		changeType,
		createAddress,
		loadData,
		loadDataSales,
		onSearch,
		selectAddres,
	},
	props: {
		customer: {
			type: Object,
			default: () => {},
		},
		showTabAddress: {
			type: Boolean,
			default: true,
		},
		selectAddress: [String, Number],
	},
};
</script>

<style lang="scss" scoped>
.foo-total {
	text-align: right;
}

.opacity-warehouse {
	background-color: rgba(255, 255, 255, 0.52);
	bottom: 0;
	left: 0;
	padding-top: 35%;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 2;
}

.text-opacity {
	background-color: white;
	border: solid 3px color(primary);
	border-style: dashed;
	color: #828282;
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	margin: 0 auto;
	max-width: 425px;
	padding: 28px 33px;
}

.content-address {
	height: 100vw;
	position: relative;
}

.link {
	border-bottom: 1px solid color(primary);
}

.label-radio {
	font-size: 14px;
}
</style>
