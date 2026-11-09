
<template>
	<div>
		<header-page
			title="Componentes"
		></header-page>
		<v-layout wrap pb-5>
			<v-flex xs8 pr-3>
				<v-layout wrap>
					<v-flex xs12>
						<v-subheader>Barra de Información:</v-subheader>
						<bar-information
							:information="information"
						></bar-information>
					</v-flex>
					<v-flex xs12>
						<v-subheader>Tarjeta de Cliente:</v-subheader>
						<customer-card
							:active="customer.isSelected"
							card-body
							:customer="customer"
							:information="cardInformation"
							main-customer
							selectable
							@card-action="cardAction"
							@click-icon="onMain"
						></customer-card>
					</v-flex>
					<v-flex xs12>
						<v-subheader>Modal:</v-subheader>
						<v-btn
							flat
							@click="openModal"
						>
							Abrir Modal
						</v-btn>
						<modal
							:dialog="dialog"
							max-width="500"
							persistent
							title="Título"
							@close-modal="closeModal"
						>
							<div class="body-2">
								En este espacio se encontrarán los componentes o
								información que se requiera mostrar.
							</div>
						</modal>
					</v-flex>
					<v-flex xs4>
						<v-subheader>Fila de datos:</v-subheader>
						<row-data
							:quantity-data="4"
							title-data="Locales"
							warehouses-data
							:warehouses="{ open: 3, close: 1 }"
						></row-data>
						<row-data
							:quantity-data="6"
							title-data="Dispositivos"
							devices-data
							:devices="{ online: 5, offline: 1 }"
						></row-data>
						<row-data
							:quantity-data="6"
							title-data="Usuarios"
						></row-data>
						<row-data
							:quantity-data="500"
							title-data="Ventas (S/)"
							:amount="900"
						></row-data>
					</v-flex>
					<v-flex xs4 px-1>
						<v-subheader>Cabecera de card:</v-subheader>
						<heading-card
							icon="/static/img/subsidiary-icon.svg"
							:title="`Nombre de ${labelSucursal()}`"
						></heading-card>
						<heading-card
							class="mt-2"
							icon="/static/img/sale-point-icon.jpg"
							title="Punto de venta"
							sale-point
						>
							<template v-for="detail in details">
								<row-detail
									:key="detail.id"
									:label="detail.label"
									:tooltip="detail.tooltip"
									:value="detail.value"
								></row-detail>
							</template>
						</heading-card>
					</v-flex>
					<v-flex xs4>
						<v-subheader>Card de {{labelSucursal()}}:</v-subheader>
						<dashboard-card
							icon="/static/img/subsidiary-icon.svg"
							:title="`Nombre de ${labelSucursal()}`"
							:rows="rows"
							@on-click="onClick"
						></dashboard-card>
						<dashboard-card
							icon="/static/img/sale-point-icon.jpg"
							sale-point
							title="Punto de Venta"
							:user="user"
						></dashboard-card>
					</v-flex>
					<v-flex xs3>
						<v-subheader>Selector outline:</v-subheader>
						<app-select
							append-icon="keyboard_arrow_down"
							class="border-select select-outline border-outline"
							content-class="content-outline"
							:item="item"
							item-text="name"
							item-value="id"
							:items="items"
							place-holder="Valores"
							model="item"
							@input="setData"
						></app-select>
					</v-flex>
					<v-flex xs4 white>
						<v-subheader>Fila de datos expansible:</v-subheader>
						<row-data
							:details="rowDataDetails"
							:quantity-data="500"
							title-data="Ventas (S/)"
							:amount="900"
						></row-data>
						<row-data
							:details="rowCashDetails"
							:quantity-data="5"
							title-data="Cajas (S/)"
							:amount="900"
						></row-data>
						<row-data
							:details="rowSalePointDetails"
							:quantity-data="2"
							title-data="Doc Puntos de venta"
						></row-data>
						<row-data
							:details="cashSalePointDetails"
							cash-config
							title-data="Nombre de caja"
						></row-data>
					</v-flex>
					<v-flex xs4 primary px-2>
						<v-subheader class="white--text">Fila de detalle:</v-subheader>
						<row-detail
							label="Tipo de disp."
							value="Móvil"
						></row-detail>
					</v-flex>
					<v-flex xs4 white px-2>
						<v-subheader>Data de usuario:</v-subheader>
						<user-data
							user-full-name="Noah Emiliano Valladares"
							date="27-09-2018 - 15:51:25"
						></user-data>
					</v-flex>
					<v-flex xs4 text-xs-center pt-3>
						<date-component
							:date="proofDate"
							icon="/static/img/icon-calendar.png"
							@on-input="changeFormatDate"
						></date-component>
					</v-flex>
					<v-flex xs6 pt-3>
						<p>Autocompletar o crear registro</p>
						<autocomplete-component
							append-icon="expand_more"
							http-code="$httpProducts"
							:item="warehouseId"
							item-text="name"
							item-value="id"
							:items="warehouses"
							label-value="Tienda"
							model="warehouseId"
							new-register-text="Nueva tienda"
							:on-clean="cleanData"
							placeholder="Tienda"
							prop="name"
							resource-url="warehouses"
							return-object
							readonly-prop-show
							:readonly-prop="warehouseName"
							select-create
							@new-register="$emit('new-register', $event)"
							@return-data="setDataAutocompleteCreate"
						></autocomplete-component>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs4>
				<v-subheader>Listado Lateral:</v-subheader>
				<list-aside
					:all-selected="allSelected"
					:card-info="cardInformation"
					:customers="customers"
					:disabled="disabled"
					:loading="loading"
					:order-by="orderBy"
					:order-id="orderId"
					:search="search"
					:search-readonly="searchReadonly"
					:vendor-id="vendorId"
					:vendors="vendors"
					@on-all-selected="onAllSelected"
					@card-action="cardAction"
					@click-icon="onMain"
				></list-aside>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import barInformation from '@/components/field-sale/shared/bar-information';
	import customerCard from '@/components/field-sale/shared/customer-card';
	import dashboardCard from '@/components/dashboard/by-subsidiary/dashboard-card';
	import dateComponent from '@/components/shared/date-component';
	import headerPage from '@/components/shared/header-page';
	import headingCard from '@/components/dashboard/by-subsidiary/heading-card';
	import listAside from '@/components/field-sale/route-assignment/list-aside';
	import modal from '@/components/field-sale/shared/modal';
	import rowData from '@/components/dashboard/by-subsidiary/row-data';
	import rowDetail from '@/components/dashboard/by-subsidiary/row-detail';
	import userData from '@/components/dashboard/by-subsidiary/user-data';

	function created() {
		this.proofDate = this.$today();
	}

	function cardAction(row) {
		this.$set(row, 'isSelected', true);
	}

	function changeFormatDate(inputDate) {
		this.proofDate = inputDate;
	}

	function closeModal() {
		this.dialog = false;
	}

	function goToCreateRegister() {
		this.open = true;
	}

	function onAllSelected(value) {
		this.allSelected = value;
		this.customers = this.customers.map((customer) => {
			const newCustomer = { ...customer };
			newCustomer.isChecked = value;
			return newCustomer;
		});
		this.customersSelected = this.customers.filter(c => c.isChecked);
	}

	function onClick() {
		this.showNotification(`Card de ${this.labelSucursal()}`);
	}

	function onMain(row) {
		this.$set(row, 'isMain', !row.isMain);
	}

	function openModal() {
		this.dialog = true;
	}

	function setData({ model, value }) {
		this[model] = value;
	}

	function setDataAutocompleteCreate(event) {
		if (event.btn) {
			this.goToCreateRegister();
		} else {
			this.warehouseId = event.value.id;
			this.warehouseName = event.value.name;
		}
	}

	function data() {
		return {
			allSelected: false,
			cardInformation: [
				{
					id: 1,
					label: '/static/img/purchase-quantity.svg',
					value: '25',
				},
				{
					id: 2,
					label: '/static/img/purchase-frequency.svg',
					value: '1 vez al mes',
				},
				{
					id: 3,
					label: '/static/img/credit-line.svg',
					value: 'S/ 50.00 de S/50.000',
				},
				{
					id: 4,
					label: '/static/img/debt.svg',
					value: 'S/ 0.00',
				},
			],
			cashSalePointDetails: {
				heading: [
					{
						id: 1,
						title: '',
						value: 'name',
					},
					{
						id: 2,
						title: 'Saldo Inicial',
						value: 'initAmount',
					},
					{
						id: 3,
						title: 'Saldo Final',
						value: 'amount',
					},
				],
				body: [
					{
						id: 1,
						amount: 500,
						initAmount: 500,
						name: 'Caja (S/)',
					},
					{
						id: 2,
						amount: 500,
						initAmount: 500,
						name: 'Caja ($)',
					},
				],
			},
			cleanData: false,
			customer: {
				id: 1,
				address: 'Calle Independencia 120',
				distrit: 'Miraflores',
				isChecked: false,
				isMain: false,
				isSelected: false,
				lastname: 'Carranza',
				name: 'Marcelo',
				province: 'Lima',
				stateColor: 'success',
				stateName: 'Activo',
			},
			customerAutocomplete: {},
			customers: [
				{
					id: 1,
					address: 'Calle Independencia 120',
					distrit: 'Miraflores',
					isChecked: false,
					isMain: false,
					isSelected: false,
					lastname: 'Carranza',
					name: 'Marcelo',
					province: 'Lima',
					stateColor: 'success',
					stateName: 'Activo',
				},
			],
			customersSelected: [],
			details: [
				{
					id: 1,
					label: 'Tipo de disp.',
					tooltip: 'Tipo de dispositivo',
					value: 'Móvil',
				},
				{
					id: 2,
					label: 'Android Versión',
					value: '10.97989',
				},
				{
					id: 3,
					label: 'IP',
					value: '172.16.4.205',
				},
				{
					id: 4,
					label: 'Versión',
					value: '2.0',
				},
			],
			dialog: false,
			disabled: false,
			information: [
				{
					id: 1,
					value: 'Lima, Lima, Miraflores',
				},
				{
					id: 2,
					label: 'Total',
					value: '100 clientes',
				},
				{
					id: 3,
					label: 'Kilómetros',
					value: '38,2 km',
				},
				{
					id: 4,
					label: 'Área',
					value: '3,68 km2',
				},
			],
			item: 1,
			items: [
				{
					id: 1,
					name: 'Última semana',
				},
				{
					id: 2,
					name: 'Ayer',
				},
				{
					id: 3,
					name: 'Hoy',
				},
			],
			loading: false,
			open: false,
			orderBy: [],
			orderId: null,
			proofDate: '2020-10-29',
			rowCashDetails: {
				heading: [
					{
						id: 1,
						title: 'Caja',
						value: 'name',
					},
					{
						id: 2,
						title: 'Saldo Inicial',
						value: 'initAmount',
					},
					{
						id: 3,
						title: 'Salgo Final',
						value: 'amount',
					},
				],
				body: [
					{
						id: 1,
						amount: 150,
						name: 'Caja 1',
						initAmount: 150,
					},
					{
						id: 2,
						amount: 350,
						name: 'Caja 2',
						initAmount: 350,
					},
					{
						id: 3,
						amount: 350,
						name: 'Caja 3',
						initAmount: 350,
					},
					{
						id: 4,
						amount: 350,
						name: 'Caja 4',
						initAmount: 350,
					},
					{
						id: 5,
						amount: 350,
						name: 'Caja 5',
						initAmount: 350,
					},
				],
			},
			rowDataDetails: {
				body: [
					{
						id: 1,
						amount: 150,
						title: 'Facturas',
						total: 100,
					},
					{
						id: 2,
						amount: 350,
						title: 'Boletas',
						total: 200,
					},
					{
						id: 3,
						amount: 350,
						title: 'CxC',
						total: 200,
					},
				],
			},
			rows: [
				{
					id: 1,
					title: 'Locales',
					total: 4,
					warehouses: true,
					warehousesClose: 1,
					warehousesOpen: 3,
				},
				{
					id: 2,
					title: 'Dispositivos',
					devices: true,
					devicesOnline: 5,
					devicesOffline: 1,
					total: 6,
				},
				{
					id: 3,
					title: 'Usuarios',
					total: 6,
				},
				{
					id: 4,
					amount: 900,
					title: 'Ventas (S/)',
					total: 500,
				},
			],
			rowSalePointDetails: {
				heading: [
					{
						id: 1,
						title: 'Tipo',
						value: 'type',
					},
					{
						id: 2,
						title: 'Serie',
						value: 'serie',
					},
					{
						id: 3,
						title: 'Número',
						value: 'number',
					},
				],
				body: [
					{
						id: 1,
						number: 45345,
						serie: 2123,
						type: 'Facturas',
					},
					{
						id: 2,
						number: 45345,
						serie: 2123,
						type: 'Boletas',
					},
				],
			},
			search: '',
			searchReadonly: false,
			user: {
				fullName: 'Noah Emiliano Valladares',
				date: '27-09-2018 - 15:51:25',
			},
			vendorId: null,
			vendors: [],
			warehouseId: null,
			warehouseName: null,
			warehouses: [
				{
					id: 919,
					name: 'KEILA',
					code: 'KEILA',
					subsidiaryId: 251,
					externalCode: null,
					codeTaxes: 'KEILA',
					address: 'INCA YUPOANQUI',
					isMain: 0,
					phone: null,
					longitude: null,
					latitude: null,
					settings: {
						color: '#85da74',
					},
					companyId: 489,
					flagEcommerce: 0,
					flagActive: 1,
					createdAt: '2020-09-21T00:39:05.000Z',
					updatedAt: '2020-09-21T00:39:05.000Z',
					location: null,
					subsidiary: {
						id: 251,
						sucursalName: 'pry',
						location: {
							x: -12.0460631,
							y: -77.0401732,
						},
						ubigeo: '',
						sucursalCode: 'Qgfcrdrd was',
						phone: '77766655',
						address: 'drgdgrfdg',
						departmentId: null,
						provinceId: null,
						districtId: null,
						contactName: 'dfdd',
						contactLastname: 'dfd',
						email: 'fgfg',
						urlImage: '',
						websiteDescription: null,
						ruc: '9998889999889',
						rzSocial: 'prueba NUEVA',
						flagTaxes: 0,
						typeAmbientTax: 1,
						flagCreditDispatch: 1,
						debtsSales: {},
						specialContributor: null,
						flagAccount: 0,
						rise: null,
						settings: {
							allowProductFree: false,
						},
						flagAccountingEngine: 0,
						flagAccountingAutomatic: 0,
						urlLogo: '',
						companyId: 489,
						subsidiaryId: null,
						distributorCustomerId: null,
						flagIntegrations: 1,
						subsidiaryAclCode: 'QUIPUTEST_9998889999889',
						configIntegrations: {
							centerCost: {
								data: [
									{
										id: 18,
										code: '001',
										name: 'DESARROLLO',
										level: 0,
										account: null,
										companyId: 489,
										createdAt: '2020-09-16 21:10:35',
										deletedAt: null,
										updatedAt: '2020-09-16 21:10:35',
										flagActive: true,
										costCenterId: null,
										subsidiaryId: 251,
									},
									{
										id: 19,
										code: '001',
										name: 'prueba',
										level: 0,
										account: null,
										companyId: 489,
										createdAt: '2020-09-18 14:34:15',
										deletedAt: null,
										updatedAt: '2020-09-18 14:34:15',
										flagActive: true,
										costCenterId: null,
										subsidiaryId: 251,
									},
								],
								flagActive: true,
								flagConfig: false,
							},
							accountingPlan: {
								flagConfig: true,
								typeConfig: 1,
								uploadPlan: false,
							},
						},
						rucName: '9998889999889 - pry',
					},
				},
				{
					id: 0,
					name: 'Nueva Tienda',
					btn: true,
				},
			],
		};
	}

	export default {
		name: 'page-components',
		components: {
			barInformation,
			customerCard,
			dashboardCard,
			dateComponent,
			headerPage,
			headingCard,
			listAside,
			modal,
			rowData,
			rowDetail,
			userData,
		},
		created,
		data,
		methods: {
			cardAction,
			changeFormatDate,
			closeModal,
			goToCreateRegister,
			onAllSelected,
			onClick,
			onMain,
			openModal,
			setData,
			setDataAutocompleteCreate,
		},
	};
</script>