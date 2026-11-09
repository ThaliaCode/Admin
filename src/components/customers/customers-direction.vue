<template>
	<div class="warehouse" :v-if="false">
		<header-page
			:title="this.$route.meta.title"
			to-show
			:options="options"
			show-excel-menu
			:show-excel="false"
			@clean-product-filter="cleanFilter"
			@emit-excel="emitExcel"
			:open-on-click="true"
		>
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>

		<!-- FILTRO DE DIRECCIONES -->
		<v-layout row wrap align-end my-3 px-5>
			<!-- FILTRO EJEMPLO -->
			<!-- <v-flex xs2 ml-2>
				<label class="caption">Lista de Precios</label>
				<v-select
					autocomplete
					clearable
					solo
					hide-details
					:items="priceLists"
					v-model="priceListIdTable"
					label="Lista de Precio"
					item-value="id"
					item-text="name"
					class="filter-select"
					content-class="filter-select-content"
					@input="setDataPriceList"
				>
				</v-select> -->
			<!-- </v-flex> -->
			<!-- DEPARTAMENTO PROVINCIA -->
			<v-flex xs2 px-2 mb-1>
				<app-select
					:item="params.provinceId"
					item-text="name"
					item-value="id"
					:items="provinces"
					:label="isPeru ? 'Departamento' : 'Provincia'"
					model="provinceId"
					:return-object="false"
					@input="setParams"
				/>
			</v-flex>
			<!-- PROVINCIA O CIUDAD -->
			<v-flex xs2 px-2 mb-1>
				<app-select
					:item="params.cityId"
					item-text="name"
					item-value="id"
					:items="cities"
					:disabled="!params.provinceId"
					:label="isPeru ? 'Provincia' : 'Ciudad'"
					model="cityId"
					:return-object="false"
					@input="setParams"
				/>
			</v-flex>
			<!-- DISTRITO O PARROQUIA -->
			<v-flex xs2 px-2 mb-1>
				<app-select
					:item="params.parishId"
					item-text="name"
					item-value="id"
					:items="parishes"
					:disable="!params.cityId"
					:label="isPeru ? 'Distrito' : 'Parroquia'"
					model="parishId"
					:return-object="false"
					@input="setParams"
				/>
			</v-flex>
			<!-- FILTRO GRUPO -->
			<v-flex xs2 px-2 mb-1>
				<app-select
					:item="params.groupId"
					item-text="name"
					item-value="id"
					:items="groups"
					:label="'Grupo'"
					model="groupId"
					:return-object="true"
					placeholder="Selecciona el grupo"
					@input="filterGroups"
				/>
			</v-flex>
			<!-- ZONAS -->
			<v-flex xs3 px-2 mb-1>
				<app-select
					chips
					multiple
					:item="params.zoneIds"
					item-text="name"
					item-value="id"
					:items="zones"
					:label="'Zonas'"
					model="zoneIds"
					:return-object="false"
					placeholder="Selecciona la zona"
					@input="setParams"
				/>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:value="action.value"
			:img-src="action.imgSrc"
			@close-modal="closeModal"
		>
			<create-group
				v-if="isCreateGroup"
				:group="groupBody"
				@cancel-modal="closeModal"
				@create-group="createGroupCustomers"
			/>
			<assign-group
				show-customer
				is-general-id-two
				:groups="groups"
				:multiSelect="true"
				v-if="isAssignGroup"
				@close-modal="closeModal"
				@assign-group="assignGroups"
			/>

			<address-slide
				v-if="action.code === 'address-slide'"
				:commerce="informationOrder"
				@get-data="setAddressData"
				@accept-action="updateInformationOrder"
				@cancel-action="closeModal"
			/>
		</action-sidebar>
		<!-- TABLA DE LISTADO DE DIRECCIONES -->
		<v-layout>
			<v-flex xs12 mt-5>
				<app-table
					name="address"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:selectable="true"
					:columns="columns"
					:check-all="checkAll"
					:last-page="lastPage"
					:current-page="currentPage"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotal"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
					@row-is-selected="rowIsSelected"
					@on-selected-all="rowSelectedAll"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.customer.typePerson.documentNumber | limitTo(15) }}
								</span>
								<span>
									{{ props.row.customer.typePerson.documentNumber }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 2)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.customer.typePerson.fullName | limitTo(15) }}
								</span>
								<span>
									{{ props.row.customer.typePerson.fullName }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 3)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.name | limitTo(15) }}
								</span>
								<span>
									{{ props.row.name }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 4)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.province ? props.row.province.name : '-' | limitTo(15) }}
								</span>
								<span>
									{{ props.row.province ? props.row.province.name : '-' }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 5)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.city ? props.row.city.name : '-' | limitTo(15) }}
								</span>
								<span>
									{{ props.row.city ? props.row.city.name : '-' }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 6)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.parish ? props.row.parish.name : '-' | limitTo(15) }}
								</span>
								<span>
									{{ props.row.parish ? props.row.parish.name : '-' }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 7)">
							{{ props.row.groupsName }}
						</td>
						<td v-show="showRow(columns, 8)">
							{{
								props.row.customer && props.row.customer.zone
									? props.row.customer.zone
									: '-'
							}}
						</td>
						<td v-show="showRow(columns, 9)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.addressLine1 || '-' | limitTo(15) }}
								</span>
								<span>
									{{ props.row.addressLine1 }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 10)">
							<app-tooltip-button
								v-if="!props.row.location"
								text="Esta dirección no cuenta con localización."
								color="error"
								icon="report_problem"
							/>
							<app-tooltip-button
								text="Editar Información del Pedido"
								icon="public"
								color="success"
								@click-icon="updateLocation(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>

		<!-- <v-layout wrap mt-4>
			<v-flex xs12>
				<app-table
					:check-all="checkAll"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
					name="customers-direction"
					:selectable="true"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					:items-quantity="rows.length"
					:disabled-search="disabledSearch"
					:clean-search="cleanSearch"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.typePerson.documentNumber }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.typePerson.fullName }}</td>
						<td  v-show="showRow(columns, 3)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.name | limitTo(15) }}
								</span>
								<span>
									{{ props.row.name }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 4)">{{ props.row.conPhones }}</td>
						<td v-show="showRow(columns, 5)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.provinceName | limitTo(15) }}
								</span>
								<span>
									{{ props.row.provinceName }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 6)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.parishName | limitTo(15) }}
								</span>
								<span>
									{{ props.row.parishName }}
								</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 5)">
							<v-tooltip top>
								<span slot="activator">
									{{ props.row.addressLine1 | limitTo(15) }}
								</span>
								<span>
									{{ props.row.addressLine1 }}
								</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout> -->
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import appActions from '@/components/shared/app-actions';
import addressSlide from '@/components/ecommerce/address-slide';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import createGroup from '@/components/customers/create-group';
import assignGroup from '@/components/customers/assign-group';
import typeEntityId from '@/shared/type-entity';

function isCreateGroup() {
	return this.action && this.action.code === 'CG';
}

function isAssignGroup() {
	return this.action && this.action.code === 'AG';
}

function runAction({ code }) {
	if (code === 'CG') {
		this.action.code = code;
		this.action.title = 'Crear Grupo';
		this.action.width = 400;
		this.action.open = true;
	} else if (code === 'AG') {
		this.action.code = code;
		this.action.title = 'Asignar grupo';
		this.action.width = 400;
		this.action.open = true;
	}
}

function actionsDisabled() {
	const disabledActions = [{ code: 'AG', disabled: !this.dataSelected.length > 0 }];
	return disabledActions;
}

export default {
	name: 'customer',
	components: {
		headerPage,
		generalFilter,
		autocompleteComponent,
		appTable,
		appActions,
		actionSidebar,
		createGroup,
		assignGroup,
		typeEntityId,
		addressSlide,
	},
	created() {
		this.loadData();
	},
	computed: {
		isAssignGroup,
		isCreateGroup,
		actionsDisabled,
	},
	data() {
		return {
			// isPeru: true?
			groupBody: {
				description: '',
				name: '',
				code: null,
			},
			itemsTotal: null,
			dataSelected: [],
			params: {
				page: null,
				search: null,
				provinceId: null,
				cityId: null,
				parishId: null,
				groupId: null,
				zoneIds: null,
			},
			action: {
				value: false,
				code: '',
				open: false,
				title: '',
				width: 600,
			},
			groups: [],
			searchData: '',
			currentPage: 1,
			lastPage: null,
			checkAll: false,
			provinces: [],
			cities: [],
			parishes: [],
			zones: [],
			rows: [],
			informationOrder: {},
			options: [
				{
					id: 1,
					code: 'with_zones',
					name: 'Listado de direcciones de cliente por zona',
				},
				{
					id: 2,
					code: 'without_zones',
					name: 'Listado de direcciones de cliente sin zonas',
				},
			],
			columns: [
				{
					id: 1,
					name: 'RUC/DNI',
					value: 'documentNumber',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre/Razón Social',
					value: 'fullName',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Alias',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Departamento',
					value: 'provinceName',
					checked: true,
					visible: true,
				},
				{
					id: 5,
					name: 'Provincia',
					value: 'provinceName',
					checked: true,
					visible: true,
				},
				{
					id: 6,
					name: 'Distrito',
					value: 'provinceName',
					checked: true,
					visible: true,
				},
				{
					id: 7,
					name: 'Grupo',
					checked: true,
					visible: true,
				},
				{
					id: 8,
					name: 'Zona',
					value: 'zone',
					checked: true,
					visible: true,
				},
				{
					id: 9,
					name: 'Dirección',
					value: 'provinceName',
					checked: true,
					visible: true,
				},
				{
					id: 10,
					name: 'Acciones',
					checked: true,
					visible: true,
				},
			],
		};
	},
	methods: {
		loadData() {
			this.typeEntityIdCustomer = typeEntityId.Customer;
			this.loadProvinces();
			this.loadGroups();
			this.loadZones();
			this.loadCustomersAddress();
		},
		closeModal() {
			this.action.open = false;
			this.action.code = null;
			this.action.value = false;
			this.clearModal();
		},
		filterGroups({ model, value }) {
			this.params[model] = value.id ? value.id : '';
			this.loadCustomersAddress();
		},
		rowIsSelected(row) {
			({
				products: this.rows,
				productsSelected: this.dataSelected,
				checkAll: this.checkAll,
			} = this.selectedRows(row, this.rows, this.dataSelected));
		},
		rowSelectedAll(val) {
			({
				products: this.rows,
				productsSelected: this.dataSelected,
				checkAll: this.checkAll,
			} = this.selecteAll(val, this.rows, this.dataSelected));
		},
		async assignGroups(id) {
			const body = {
				customerAddressId: this.dataSelected.map((row) => row.id),
				groupIds: id,
			};
			try {
				await this.$httpSales.patch('customers-address/groups', body);
				this.showNotification('Los grupos fueron asignados correctamente.');
				this.closeModal();
				this.currentPage = 1;
				this.loadCustomersAddress();
			} catch (error) {
				this.showGenericError();
			}
		},
		clearModal() {
			this.customer = { ...this.default };
			this.groupBody = {
				name: '',
				code: null,
			};
			this.informationOrder = {};
		},
		async createGroupCustomers() {
			const body = {
				name: this.groupBody.name,
				code: this.groupBody.code,
				description: this.groupBody.description,
				typeEntityId: typeEntityId.Customer,
				typeGeneralId: 2,
			};
			// if (this.$route.path === 'customers/direction') {
			// 	body.params.typeGeneraldId = 2;
			// }
			try {
				await this.$httpSales.post('group', body);
				this.showNotification('El grupo fue creado correctamente');
				this.closeModal();
				this.loadGroups();
			} catch (error) {
				if (error.status === 400) {
					if (error.data.message === 'GROUP_EXISTS') {
						this.showGenericError('Codigo ya existe.');
					}
				} else {
					this.showGenericError();
				}
			}
		},
		async loadProvinces() {
			({ data: this.provinces } = await this.$httpSales.get('province'));
			this.cities = [];
			this.params.parishId = null;
			this.parishes = [];
			this.params.cityId = null;
		},
		async loadGroups() {
			const groupId = this.params.groupId;
			const params = {
				typeEntityId: typeEntityId.Customer,
				typeGeneralId: 2,
				groupId,
			};
			const requests = [this.$httpSalesRead.get('group', { params })];
			[{ data: this.groups }] = await Promise.all(requests);
		},
		async loadCitiesByProvince() {
			const { provinceId } = this.params;
			const { data } = await this.$httpSales.get(`cities/${provinceId}`);
			this.cities = data;
			this.params.parishId = null;
			this.parishes = [];
		},
		async loadParishByCity() {
			const { cityId } = this.params;
			const { data } = await this.$httpSales.get(`parish/${cityId}`);
			this.parishes = data;
		},
		async loadCustomersAddress() {
			try {
				this.params.page = this.currentPage;
				const params = {
					...this.params,
					zoneIds:
						this.params.zoneIds && this.params.zoneIds.length
							? this.params.zoneIds.join(',')
							: null,
					flagAllCustomer: true, // Para esta vista siempre
					flagActive: true,
				};
				const { data: addresses, headers } = await this.$httpSales.get(
					'customers-address',
					{ params }
				);
				this.lastPage = Number(headers['x-last-page']);
				this.itemsTotal = Number(headers['x-quantity']);
				this.dataSelected = [];
				this.rows = this.mapperRows(addresses);
				if (this.params.groupId) {
					this.rows = this.rows.filter((item) => {
						const groupFiltered =
							item.groupIds && item.groupIds.includes(this.params.groupId);
						return groupFiltered;
					});
				}
			} catch (error) {
				this.showGenericError();
			}
		},
		callServiceAndSearch(search) {
			this.searchData = search;
			if (search) {
				this.params.search = search;
			} else {
				this.params.search = null;
			}
			this.currentPage = 1;
			this.loadCustomersAddress();
		},
		mapperRows(addresses) {
			return addresses.map((item) => {
				const newItem = { ...item };
				newItem.groupsName =
					item.groupIds && item.groupIds.length
						? this.groups
								.filter((group) => item.groupIds.includes(group.id))
								.map((group) => group.name)
								.join(', ')
						: '-';
				return newItem;
			});
		},
		changePage(page) {
			this.currentPage = page;
			this.loadCustomersAddress();
		},
		setParams({ value, model }) {
			this.params[model] = value;
			if (model === 'zoneIds') {
				this.params[model] = value;
			}
			this.loadCustomersAddress();
			// Si se cambia la provincia trae las ciudades
			if (model === 'provinceId') {
				this.currentPage = 1;
				this.loadCitiesByProvince();
			} else if (model === 'cityId') {
				// Si se cambie las ciudad buscar los distritos
				this.currentPage = 1;
				this.loadParishByCity();
			}
		},
		async loadZones() {
			const { data: zones } = await this.$httpSales.get('zones');
			this.zones = zones;
		},
		cleanFilter() {
			this.params = {
				page: null,
				search: null,
				provinceId: null,
				cityId: null,
				parishId: null,
				groupId: null,
				zoneIds: [],
			};
			this.loadCustomersAddress();
		},
		emitExcel(code) {
			const params = { ...this.params };
			delete params.page;
			delete params.search;
			// Eliminar los campos que tienen como valor null
			const filteredParams = Object.keys(params).reduce((acc, key) => {
				if (params[key] !== null) {
					acc[key] = params[key];
				}
				return acc;
			}, {});
			if (code === 'without_zones') {
				filteredParams.flagWithoutZone = true;
			}
			if (code === 'without_zones' || this.params.zoneIds) {
				filteredParams.zoneIds =
					this.params.zoneIds && this.params.zoneIds.length
						? this.params.zoneIds.join(',')
						: null;
				this.reportCustomerDirection(filteredParams, code);
			} else {
				this.showGenericError(
					'Debe seleccionar al menos la zona, para poder generar el reporte.'
				);
			}
		},
		updateLocation(row) {
			this.informationOrder = { ...row, address: row.addressLine1 };
			this.action = {
				code: 'address-slide',
				title: 'Editar Dirección',
				open: true,
				width: 500,
			};
		},
		setAddressData({ model, value }) {
			this.informationOrder[model] = value;
		},
		async updateInformationOrder() {
			const {
				address,
				addressLine2,
				latitude,
				longitude,
				additionalInformation,
				cityId,
				customerId,
				documentNumber,
				name,
				parishId,
				phone,
				provinceId,
				reference,
				number,
			} = this.informationOrder;

			const body = {
				addressLine1: address,
				addressLine2,
				latitude,
				longitude,
				additionalInformation,
				cityId,
				customerId,
				documentNumber,
				name,
				parishId,
				phone,
				provinceId,
				reference,
				number,
			};

			try {
				await this.$httpSales.patch(
					`customers-address/${this.informationOrder.id}`,
					body
				);
				this.showNotification('La dirección ha sido actualizada correctamente.');
				this.loadCustomersAddress();
				this.closeModal();
			} catch (error) {
				if (error.status === 400) {
					this.showGenericError(error.data.messageError);
				} else if (error.status === 500) {
					this.showGenericError();
				}
			}
		},
		runAction,
		// validateName(obj, prop) {
		// 	return obj[prop] ? obj[prop].name : '-';
		// },
	},
};
</script>
