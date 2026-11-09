<template>
	<div class="warehouse">
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
			toda la información del listado de clientes`"
		/>
		<header-page
			:title="this.$route.meta.title"
			to-show
			:show-excel="false"
			show-excel-menu
			open-on-click
			:options="reportsExcel"
			@clean-product-filter="onCleanData"
			@emit-excel="downloadExcel"
		></header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter>
			<v-layout wrap align-end my-3>
				<v-flex xs2>
					<autocomplete-component
						append-icon="arrow_drop_down"
						class="autocomplete-cm"
						:item="params.groupId"
						item-text="name"
						item-value="id"
						:items="groups"
						label-value="Grupo"
						model="groupId"
						placeholder-value="Selecciona el grupo"
						prop="name"
						prop-search="name"
						:resource-url="`group?typeEntityId=${typeEntityIdCustomer}`"
						return-object
						select-create
						@return-data="setData($event, 'groupId')"
					></autocomplete-component>
				</v-flex>
				<v-flex xs2 ml-3>
					<app-select
						:item="state"
						:items="status"
						item-text="name"
						item-value="id"
						label="Deuda"
						model="state"
						@input="setState"
					></app-select>
				</v-flex>
				<v-flex xs2 ml-3>
					<app-select
						:item="params.subsidiaryId"
						:items="subsidiaries"
						item-text="sucursalName"
						item-value="id"
						label="Empresa"
						model="subsidiaryId"
						return-object
						@input="setData($event, 'subsidiaryId')"
					></app-select>
				</v-flex>
				<v-flex xs2 ml-3>
					<label class="caption">Fecha Inicio</label>
					<app-date-select
						:date-formatted="params.startDate"
						label=""
						model="startDate"
						@input="setDate($event)"
					/>
				</v-flex>
				<v-flex xs2 ml-3>
					<label class="caption">Fecha Final</label>
					<app-date-select
						:date-formatted="params.endDate"
						:min-date="params.startDate"
						:readonly="!params.startDate"
						label=""
						model="endDate"
						@input="setDate($event)"
					/>
				</v-flex>
			</v-layout>
		</general-filter>
		<v-layout wrap mt-4>
			<v-flex xs12>
				<app-table
					:check-all="checkAll"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
					name="customers"
					:selectable="true"
					:inputSearch="true"
					:filterColumns="true"
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					:disabled-search="disabledSearch"
					@on-search-event="callServiceAndSearch"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							{{ props.row.typePerson.documentNumber }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.typePerson.fullName }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.email || '-' }}
						</td>
						<td v-show="showRow(columns, 4)">{{ props.row.conPhones || '-' }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.address }}</td>
						<td v-show="showRow(columns, 6)">
							<a @click.prevent="goToSales(props.row)">
								{{ props.row.amountCustomer | round }}
							</a>
						</td>
						<td v-show="showRow(columns, 7)">
							{{ props.row.amountDebt | round }}
						</td>
						<td v-show="showRow(columns, 8)">
							{{ props.row.createdAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 9)">{{ getEmployee(props.row) }}</td>
						<td v-show="showRow(columns, 10)">{{ props.row.groupName || '-' }}</td>
						<td v-show="showRow(columns, 11)" v-if="showLoyalty">
							<span v-if="props.row.point === null">-</span>
							<span v-else>{{ props.row.point }}</span>
						</td>
						<td v-show="showRow(columns, 12)">{{ props.row.priceListName || '-' }}</td>
						<td v-show="showRow(columns, 13)">
							<app-tooltip-button
								img="/static/icon/whatsapp-logo.png"
								height="24"
								:text="`Enviar un mensaje a ${
									props.row.person ? props.row.person.fullname : null
								}`"
								@click-icon="sendWhatsapp(props.row)"
							/>
						</td>
						<td v-show="showRow(columns, 14)">
							<app-tooltip-button
								color="info"
								text="Ver Detalle"
								icon="remove_red_eye"
								@click-icon="openIt(props.row, 'detail')"
							/>
							<app-tooltip-button
								:disabled="!!props.row.flagGeneric"
								color="success"
								text="Editar"
								icon="edit"
								@click-icon="goTo('customers-edit', { params: { id: props.row.id } })"
							/>
							<app-tooltip-button
								color="error"
								text="Eliminar"
								icon="delete"
								@click-icon="openConfirm(props.row)"
							/>
							<v-menu
								offset-x
								left
								:nudge-left="10"
								attach
								content-class="options-menu-content"
								class="options-menu"
							>
								<v-btn icon slot="activator" class="btn-auto ma-0">
									<v-icon color="primary">more_horiz</v-icon>
								</v-btn>
								<v-list>
									<v-list-tile
										v-if="$userInfo.roleCode === 'SUPPORT' && !props.row.showFixByScript"
									>
										<v-list-tile-title>
											<app-tooltip-button
												color="lightBlue"
												text="Reparación de Cuentas por Cobrar"
												icon="construction"
												@click-icon="fixAccReceivable(props.row)"
											/>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile>
										<v-list-tile-title>
											<app-tooltip-button
												color="orange"
												text="Agregar Direcciones"
												icon="add_location"
												@click-icon="
													goTo('customer-address', {
														params: { id: props.row.id },
													})
												"
											/>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile>
										<v-list-tile-title>
											<app-tooltip-button
												color="secondary"
												text="Ver Direcciones"
												icon="where_to_vote"
												@click-icon="openIt(props.row, 'addresses')"
											/>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile>
										<v-list-tile-title>
											<app-tooltip-button
												color="warning"
												text="Cuentas por Cobrar"
												icon="local_atm"
												@click-icon="goToAmortizations(props.row)"
											/>
										</v-list-tile-title>
									</v-list-tile>
									<v-list-tile>
										<v-list-tile-title>
											<app-tooltip-button
												color="primary"
												text="Pagos realizados"
												icon="monetization_on"
												@click-icon="goToPayments(props.row)"
											/>
										</v-list-tile-title>
									</v-list-tile>
								</v-list>
							</v-menu>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:header-color="action.color"
			:help-actions="actionsToHelp"
			@close-modal="closeModal"
		>
			<v-layout wrap v-if="isConfig">
				<v-tabs v-model="active" dark next-icon="" slider-color="success">
					<v-tab v-for="tab in tabs" :key="tab.id" class="customer-tabs">
						{{ tab.name }}
					</v-tab>
					<v-tab-item v-for="tab in tabs" :key="tab.id" class="px-4 mt-4">
						<v-layout wrap v-if="tab.id === 1">
							<v-flex xs12 md6 pr-3 class="form-input--height">
								<v-text-field
									class="filter-select shadow-inset"
									label="DNI"
									single-line
									required
									type="number"
									v-model="customer.dni"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.dni && $v.customer.dni.$invalid"
								>
									El DNI es requerido, de {{ minDni }} a {{ maxDni }} dígitos.
								</span>
							</v-flex>
							<v-flex xs12 md6 pl-3>
								<v-text-field
									class="filter-select shadow-inset"
									label="Dirección"
									single-line
									v-model="customer.address"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.address && $v.customer.address.$invalid"
								>
									La dirección es requerida
								</span>
							</v-flex>
							<v-flex xs12 md6 pr-3 class="form-input--height">
								<v-text-field
									class="filter-select shadow-inset"
									label="Nombre"
									single-line
									required
									v-model="customer.name"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.name && $v.customer.name.$invalid"
								>
									El nombre es requerido.
								</span>
							</v-flex>
							<v-flex xs12 md6 pl-3>
								<v-text-field
									class="filter-select shadow-inset"
									label="Apellidos"
									single-line
									v-model="customer.lastname"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.lastname && $v.customer.lastname.$invalid"
								>
									El apellido es requerido.
								</span>
							</v-flex>
							<v-flex xs12 md6 pr-3>
								<v-text-field
									class="filter-select shadow-inset mb-4"
									label="Correo"
									single-line
									required
									v-model="customer.email"
								>
								</v-text-field>
							</v-flex>
							<v-flex xs12 md6 pl-3>
								<v-layout row wrap>
									<v-flex xs6 pr-2>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Nacionalidad"
											single-line
											type="email"
											v-model="customer.nationality"
										>
										</v-text-field>
									</v-flex>
									<v-flex xs6 pl-2>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Teléfono"
											single-line
											type="number"
											v-model="customer.phone"
										>
										</v-text-field>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
						<v-layout row wrap v-else>
							<v-flex xs12 md6 pr-3 class="form-input--height">
								<v-text-field
									class="filter-select shadow-inset"
									label="RUC"
									single-line
									required
									name="customer-ruc"
									type="number"
									@blur="sunatService($event, 'ruc')"
									v-model="customer.ruc"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.ruc && $v.customer.ruc.$invalid"
								>
									El RUC es requerido, {{ maxRuc }} dígitos.
								</span>
							</v-flex>
							<v-flex xs12 md6 pl-3>
								<v-text-field
									class="filter-select shadow-inset mb-4"
									label="Sitio Web"
									single-line
									v-model="customer.website"
								>
								</v-text-field>
							</v-flex>
							<v-flex xs12 md6 pr-3 class="form-input--height">
								<v-text-field
									class="filter-select shadow-inset"
									label="Razón Social"
									single-line
									name="customer-rzSocial"
									required
									v-model="customer.rzSocial"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.rzSocial && $v.customer.rzSocial.$invalid"
								>
									La razón social es requerida.
								</span>
							</v-flex>
							<v-flex xs12 md6 pl-3>
								<v-text-field
									class="filter-select shadow-inset"
									label="Dirección"
									single-line
									v-model="customer.address"
								>
								</v-text-field>
								<span
									class="form-group__message"
									v-if="$v.customer.address && $v.customer.address.$invalid"
								>
									La dirección es requerida.
								</span>
							</v-flex>
							<v-flex xs12 md6 pr-3>
								<v-text-field
									class="filter-select shadow-inset mb-4"
									label="Contacto"
									single-line
									v-model="customer.contact"
								>
								</v-text-field>
							</v-flex>
							<v-flex xs12 md6 pl-3>
								<v-layout row wrap>
									<v-flex xs6 pr-2>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Correo"
											single-line
											type="email"
											v-model="customer.email"
										>
										</v-text-field>
									</v-flex>
									<v-flex xs6 pl-2>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Teléfono"
											single-line
											type="number"
											v-model="customer.phone"
										>
										</v-text-field>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-tab-item>
				</v-tabs>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:is-loading="$v.customer.$invalid"
						@cancel-button-clicked="closeModal"
						@accept-button-clicked="saveData"
					/>
				</section>
			</v-layout>
			<customers-details v-if="isDetail" :customer-id="customerId" />
			<people-import
				v-if="isImport"
				@customers-errors="onCustomersErrors"
				@close="closeModal"
				@people-imported="customersImported"
			/>
			<customers-address-list
				class="pt-3"
				v-if="isCustomers"
				:columns="addressesColumns"
				:current-page="addressesCurrentPage"
				:items-quantity="addresses.length"
				:items-total-quantity="registersTotal"
				:last-page="addressesLastPage"
				:rows="addresses"
				@on-page="loadCustomerAddresses"
			></customers-address-list>
			<assign-price-list
				@cancel-modal="closeModal"
				@save-price="assignPrice"
				v-if="isAssign"
			/>
			<create-group
				v-if="isCreateGroup"
				:group="groupBody"
				@cancel-modal="closeModal"
				@create-group="createGroupCustomers"
			/>
			<assign-group
				show-customer
				:groups="groups"
				v-if="isAssignGroup"
				@close-modal="closeModal"
				@assign-group="assignGroups"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="info" dark @click.native="closeDialog">
						Cancelar
					</v-btn>
					<v-btn class="btn-action" color="error" dark @click.native="deleteCustomer">
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showColumnsError" persistent max-width="625">
			<v-card class="modal">
				<v-card-title class="title-card justify-center text-center">
					<span class="title-text">{{ dataCustError.messageError }}</span>
				</v-card-title>
				<app-table
					class="pa-0 mb-4 mt-2 is-not-selectable"
					:inputSearch="false"
					:filterColumns="false"
					:rows="rowFilter"
					:selectable="false"
					:columns="columnsErrors"
					:last-page="lastPageError"
					:current-page="currentPageError"
					:items-quantity="rowFilter.length"
					:items-total-quantity="totalItemsError"
					@on-page="changePageError"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable" v-show="showRow(columns, 1)">
							{{ props.row.row }}
						</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name || '-' }}</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.numberDocument || props.row.documentNumber || '-' }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.message }}
						</td>
					</template>
				</app-table>
				<v-card-actions class="justify-center pb-3">
					<v-btn
						class="btn-action"
						color="pink"
						type="button"
						@click="showColumnsError = false"
						small
					>
						Atras
						<v-icon color="white" size="16" class="ml-1"> highlight_off </v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import customersAddressList from '@/components/customers/customers-address-list';
import customersDetails from '@/components/customers/customers-details';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import peopleImport from '@/components/shared/people-import';
import generalFilter from '@/components/shared/general-filter';
import typeEntityId from '@/shared/type-entity';
import assignPriceList from '@/components/customers/assign-price-list';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import createGroup from '@/components/customers/create-group';
import assignGroup from '@/components/customers/assign-group';
import lib from '@/shared/lib';
import { format } from 'date-fns';

const { setNewProperty } = lib;

function actionsDisabled() {
	const disabledActions = [
		{ code: 'ALP', disabled: !this.dataSelected.length > 0 },
		{ code: 'AG', disabled: !this.dataSelected.length > 0 },
		{ code: 'reset-points', disabled: !this.dataSelected.length },
	];
	return disabledActions;
}

function created() {
	this.typeEntityIdCustomer = typeEntityId.Customer;
	this.updateColumns();
	this.loadData();
	this.loadResources();
	this.showLoyalty = this.$userInfo.company.flagLoyalti === 1;
	if (this.$userInfo.company.flagLoyalti === 0) {
		this.columns[10].visible = false;
	}
}

async function assignPrice(id) {
	const body = {
		customersId: this.dataSelected.map((p) => p.id),
	};
	const listsalPriceListId = id;
	try {
		await this.$httpSales.patch(`/customers/${listsalPriceListId}/sal-price-list`, body);
		this.showNotification('Las listas de precios fueron asignados correctamente.');
		this.closeModal();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function updateColumns() {
	const columnLabel = this.isPeru ? 'RUC/DNI' : 'RUC/CI';
	this.columns = this.columns.reduce((list, item) => {
		if (item.value === 'doc') {
			return list.concat(setNewProperty('name', columnLabel)(item));
		}
		return list.concat(item);
	}, []);
}

async function loadData() {
	this.disabledSearch = true;
	this.loadingGeneral = true;
	this.params.page = this.currentPage;
	this.dataSelected = [];
	try {
		const response = await this.$httpSalesRead.get('customers/amount', {
			params: this.params,
		});
		this.rows = response.data.map((row) => {
			const newRow = { ...row };
			newRow.flagUse = !row.flagActive;
			newRow.groupName = row.group ? row.group.name : '';
			const currentCurrency = this.labelsByCountry.currency;
			newRow.phone = row.phone ? row.phone : null;
			newRow.showFixByScript =
				row.additionalInformation && row.additionalInformation.flagFixByScript;
			newRow.conPhones =
				row.phoneNumbers && row.phoneNumbers.length > 0
					? row.phoneNumbers.join(', ')
					: newRow.phone;
			newRow.amountCustomer = row.amountCustomer || 0;
			newRow.priceListName = row.salPricelist ? row.salPricelist.name : null;
			newRow.amountDebt =
				row.debtsSales && row.debtsSales[currentCurrency]
					? row.debtsSales[currentCurrency]
					: 0;
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
		this.disabledSearch = false;
	}
}

function rowIsSelected(row) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.rows, this.dataSelected));
}

function selectedAll(value) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.rows, this.dataSelected));
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function customer(value) {
	if (value.id) {
		if (this.isEcuador) {
			this.active = value.flagTypePerson === 8 ? '0' : '1';
		} else {
			this.active = value.flagTypePerson === 1 ? '0' : '1';
		}
	}
}

function openIt(customerInfo, code) {
	if (code === 'addresses') {
		this.customerId = customerInfo.id;
		this.action.title = `${customerInfo.typePerson.fullName} - Direcciones`;
		this.action.code = 'addresses';
		this.loadCustomerAddresses();
	} else if (code !== 'detail') {
		this.customer = { ...customerInfo };
		this.action.title = `Editar Cliente: ${customerInfo.typePerson.fullName}`;
		this.action.code = 'edit-customer';
	} else {
		const { typePerson } = customerInfo;
		const { fullName, documentName, documentNumber } = typePerson;
		this.customerId = customerInfo.id;
		this.action.code = code;
		this.action.title = `${fullName} - ${documentName}: ${documentNumber}`;
		this.action.width = 720;
	}
	this.action.open = true;
}

function runAction({ code }) {
	if (code === 'customers-import') {
		this.action.code = code;
		this.action.title = 'Importar Clientes';
		this.action.width = 450;
		this.action.open = true;
	} else if (code === 'ALP') {
		this.action.code = code;
		this.action.title = 'Asignar Lista de Precios';
		this.action.width = 400;
		this.action.open = true;
	} else if (code === 'CG') {
		this.action.code = code;
		this.action.title = 'Crear Grupo';
		this.action.width = 400;
		this.action.open = true;
	} else if (code === 'AG') {
		this.action.code = code;
		this.action.title = 'Asignar grupo';
		this.action.width = 400;
		this.action.open = true;
	} else if (code === 'reset-points') {
		this.onResetPoints();
	} else {
		this.goTo('customers-new');
	}
}

async function saveData() {
	const id = this.customer.id;
	const url = id ? `customers/${id}` : 'customers';
	const method = id ? 'patch' : 'post';
	const action = id ? 'editado' : 'creado';
	const body = {
		address: this.customer.address,
		email: this.customer.email,
		phone: this.customer.phone,
	};
	if (this.active === '0') {
		body.flagTypePerson = this.isEcuador ? 8 : 1;
	} else {
		body.flagTypePerson = this.isEcuador ? 7 : 2;
	}
	if (body.flagTypePerson !== 2 && body.flagTypePerson !== 7) {
		body.name = this.customer.name;
		body.lastname = this.customer.lastname;
		body.dni = this.customer.dni;
	} else {
		body.rzSocial = this.customer.rzSocial;
		body.ruc = this.customer.ruc;
		body.contact = this.customer.contact;
	}
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`El cliente ha sido ${action} correctamente.`);
		this.closeModal();
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'CUSTOMER_EXIST_ERROR') {
				this.showGenericError('El cliente ya está registrado.');
			} else if (error.data.message === 'FLAG_TYPE_PERSON_NOT_FOUND') {
				this.showGenericError('El tipo de persona no ha sido encontrado.');
			}
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function closeModal() {
	this.action.open = false;
	this.action.code = '';
	this.clearModal();
}

function clearModal() {
	this.customer = { ...this.default };
	this.groupBody = {
		name: '',
		code: null,
	};
}

function goToSales({ id, typePerson }) {
	this.salesLink.query.customerId = id;
	this.salesLink.query.customerName = typePerson.fullName;
	this.$router.push(this.salesLink);
}

function goToAmortizations(customerInfo) {
	const query = {
		customerId: customerInfo.id,
		fullName: customerInfo.typePerson.fullName,
	};
	this.goTo('amortizations-list', { query });
}

function goToPayments({ id }) {
	this.goTo('amortizations-history', { params: { customerId: id } });
}

function openConfirm({ id, name, lastname, rzSocial, flagTypePerson }) {
	const fullName = flagTypePerson === 2 ? rzSocial : `${name} ${lastname}`;
	this.customerId = id;
	this.dialogMessage = `¿Desea eliminar a '${fullName}' de la lista de clientes?`;
	this.dialog = true;
}

function closeDialog() {
	this.dialog = false;
	this.dialogMessage = '';
	this.customerId = 0;
	this.loadData();
}

async function deleteCustomer() {
	try {
		await this.$httpSales.delete(`customers/${this.customerId}`);
		this.showNotification('El cliente ha sido eliminado correctamente.');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'CUSTOMER_SALES_EXIST_ERROR') {
				this.showNotification(
					'El cliente no puede ser eliminado por tener ventas asociadas.',
					'error'
				);
			} else if (err.data.message === 'CUSTOMER_GENERIC_NOT_DELETE') {
				this.showNotification('No se puede eliminar el cliente genérico.', 'error');
			} else if (err.data.message === 'CUSTOMER_ASSIGNED_TO_ORDER') {
				this.showNotification(
					'No se puede eliminar el cliente porque tiene pedidos relacionados.',
					'error'
				);
			} else {
				this.showGenericError();
			}
		}
	} finally {
		this.closeDialog();
	}
}

function validations() {
	this.maxRuc = this.isEcuador ? 13 : 11;
	if (this.active === '0') {
		this.maxDni = this.isEcuador ? 10 : 9;
		this.minDni = this.isEcuador ? 10 : 8;
		return {
			customer: {
				dni: {
					required,
					minLength: minLength(this.minDni),
					maxLength: maxLength(this.maxDni),
				},
				name: {
					required,
				},
				lastname: {
					required,
				},
				address: {
					required,
				},
			},
		};
	}
	return {
		customer: {
			ruc: {
				required,
				minLength: minLength(this.maxRuc),
				maxLength: maxLength(this.maxRuc),
			},
			rzSocial: {
				required,
			},
			address: {
				required,
			},
		},
	};
}

async function sunatService(e, type) {
	if (!this.$v.customer[type].$invalid) {
		this.showNotification('Cargando datos desde la SUNAT', 'primary');
		const value = e.target.value;
		const urlDni = `dni/${value}`;
		const urlRuc = `ruc/${value}`;
		const url = type === 'dni' ? `${urlDni}` : `${urlRuc}`;
		try {
			const { data: response } = await this.$httpSunat.get(url);
			const custSunat = response.data;
			if (type === 'dni') {
				this.customer.dni = custSunat.dni;
				this.customer.email = custSunat.email || '';
				this.customer.phone = custSunat.phone || '';
				this.customer.address = custSunat.domicilio || '';
				this.customer.name = custSunat.nombres;
				this.customer.lastname = `${custSunat.ape_materno} ${custSunat.ape_paterno}`;
			} else {
				this.customer.ruc = value;
				this.customer.rzSocial = custSunat.nombre;
				this.customer.address = custSunat.domicilio;
			}
		} catch (error) {
			this.showNotification('Sin resultados. Verifique el número de documento', 'error');
		}
	}
}

function getEmployee({ employee }) {
	return employee ? employee.email : null;
}

function isConfig() {
	return this.action.code === 'new-customer' || this.action.code === 'edit-customer';
}

function isDetail() {
	return this.action.code === 'detail';
}

function isImport() {
	return this.action.code === 'customers-import';
}

function isCustomers() {
	return this.action.code === 'addresses';
}

function isAssign() {
	return this.action.code === 'ALP';
}

function isCreateGroup() {
	return this.action.code === 'CG';
}

function isAssignGroup() {
	return this.action.code === 'AG';
}

function customersImported() {
	this.closeModal();
	this.loadData();
}

async function loadResources() {
	const params = { typeEntityId: typeEntityId.Customer };
	const requests = [
		this.$httpSalesRead.get('group', { params }),
		this.$httpSales.get('subsidiaries'),
	];
	[{ data: this.groups }, { data: this.subsidiaries }] = await Promise.all(requests);
}

function setData(value, model) {
	if (value) {
		if (value.value) {
			this.params[model] = value.value.id ? value.value.id : '';
		} else {
			this.params[model] = value.id ? value.id : '';
		}
		this.loadData();
	}
}

function filterRows() {
	this.params.flagDebts = this.state;
	this.loadData();
}

function onCleanData() {
	this.params = {
		flagDebts: null,
		groupId: null,
		startDate: null,
		endDate: null,
	};
	this.state = null;
	this.loadData();
}

async function loadCustomerAddresses(page = 1) {
	this.addressesCurrentPage = page;
	this.addressesParams.page = this.addressesCurrentPage;
	this.addressesParams.customerId = this.customerId;
	const params = { ...this.addressesParams };
	const { data: addresses, headers } = await this.$httpSales.get('customers-address', {
		params,
	});
	this.addresses = addresses.map((a) => {
		const newA = { ...a };
		newA.provinceName = a.province ? a.province.name : '';
		newA.cityName = a.city ? a.city.name : '';
		newA.parishName = a.parish ? a.parish.name : '';
		return newA;
	});
	this.addressesLastPage = Number(headers['x-last-page']);
	this.registersTotal = Number(headers['x-quantity']);
}

async function assignGroups(id) {
	const body = {
		customersId: this.dataSelected.map((row) => row.id),
	};
	const groupId = id;
	try {
		await this.$httpSales.patch(`customers/${groupId}/group`, body);
		this.showNotification('Los grupos fueron asignados correctamente.');
		this.closeModal();
		this.currentPage = 1;
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

async function createGroupCustomers() {
	const body = {
		name: this.groupBody.name,
		code: this.groupBody.code,
		description: this.groupBody.description,
		typeEntityId: typeEntityId.Customer,
	};
	try {
		await this.$httpSales.post('group', body);
		this.showNotification('El grupo fue creado correctamente');
		this.closeModal();
		this.loadResources();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'GROUP_EXISTS') {
				this.showGenericError('Codigo ya existe.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function setState({ model, value }) {
	this[model] = value.id;
	this.filterRows();
}

function sendWhatsapp({ phone }) {
	window.open(
		`https://web.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${phone}`,
		'_blank'
	);
}

function downloadExcel(code) {
	if (this.params.startDate && !this.params.endDate) {
		this.showNotification(
			'Debe ingresar la fecha final para generar el reporte',
			'error'
		);
		return;
	}
	const name = this.reportsExcel.find((r) => r.code === code).name;
	let params = {};
	if (code === 'list-customers') {
		params = {
			groupId: this.params.groupId,
			state: this.state || undefined,
			subsidiaryId: this.params.subsidiaryId,
			startDate: this.params.startDate || undefined,
			endDate: this.params.endDate || undefined,
		};
	} else if (code === 'list-customers-geolocated') {
		params = {
			relationAdd: 'customerGroup,parish,city,province',
			startDate: this.params.startDate || undefined,
			endDate: this.params.endDate || undefined,
		};
	}
	this.onEmitExcel(code, name, params);
}

function data() {
	return {
		salPriceListId: [],
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		active: '0',
		addresses: [],
		addressesColumns: [
			{
				id: 1,
				name: 'Alias',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Provincia',
				value: 'provinceName',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Ciudad',
				value: 'cityName',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Parroquia',
				value: 'parishName',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Dirección',
				value: 'addressLine1',
				checked: true,
				visible: true,
			},
		],
		addressesCurrentPage: 1,
		addressesLastPage: 0,
		addressesParams: {
			limit: 22,
			page: 1,
		},
		lastPageError: 0,
		currentPageError: 0,
		totalItemsError: 0,
		checkAll: false,
		columns: [
			{ id: 1, name: '', value: 'doc', visible: true, checked: true },
			{
				id: 2,
				name: 'Nombre/Razón Social',
				value: 'name',
				visible: true,
				checked: true,
			},
			{ id: 3, name: 'Correo', value: 'email', visible: true, checked: true },
			{ id: 4, name: 'Teléfono', value: 'phone', visible: true, checked: true },
			{
				id: 5,
				name: 'Dirección',
				value: 'address',
				visible: false,
				checked: false,
			},
			{
				id: 6,
				name: 'Monto Consumido',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Deuda',
				value: 'amountDebt',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Fecha Creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Correo Vendedor',
				value: 'sellerEmail',
				visible: true,
				checked: true,
			},
			{ id: 10, name: 'Grupo', value: 'group', visible: true, checked: true },
			{ id: 11, name: 'Puntos', value: 'point', visible: true, checked: true },
			{
				id: 12,
				name: 'Lista de precio',
				value: 'price',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'Whatsapp',
				value: 'number',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		customer: {
			dni: '',
			ruc: '',
			email: '',
			phone: '',
			flagTypePerson: 1,
			address: '',
			contact: '',
			name: '',
			lastname: '',
			rzSocial: '',
			typePerson: {
				documentNumber: '',
				fullName: '',
			},
		},
		customerId: 0,
		dataSelected: [],
		default: {
			dni: '',
			ruc: '',
			email: '',
			phone: '',
			flagTypePerson: 1,
			address: '',
			contact: '',
			name: '',
			lastname: '',
			rzSocial: '',
			typePerson: {
				documentNumber: '',
				fullName: '',
			},
		},
		dialog: false,
		dialogMessage: '',
		disabledSearch: false,
		groupBody: {
			description: '',
			name: '',
			code: null,
		},
		groupId: null,
		showLoyalty: false,
		lastPage: 0,
		itemsTotalQuantity: 0,
		loading: false,
		loadingGeneral: false,
		maxDni: 9,
		minDni: 8,
		maxRuc: 11,
		params: {
			page: null,
			search: null,
			startDate: null,
			endDate: null,
		},
		salesLink: {
			name: 'list-of-sales',
			query: { customerId: undefined, customerName: undefined },
		},
		searchData: '',
		subsidiaries: [],
		tabs: [
			{ id: 1, name: 'Persona Natural' },
			{ id: 2, name: 'Persona Jurídica' },
		],
		registersTotal: 0,
		rows: [],
		reportsExcel: [
			{
				code: 'list-customers',
				name: 'Reporte de cliente',
			},
			{
				code: 'list-customers-geolocated',
				name: 'Reporte de cliente con geolocalizacion',
			},
		],
		groups: [],
		status: [
			{
				id: 1,
				name: 'Con deuda',
			},
			{
				id: 2,
				name: 'Sin deuda',
			},
		],
		state: null,
		dataCustError: {
			messageError: null,
			details: [],
		},
		showColumnsError: false,
		rowFilter: [],
		columnsErrors: [
			{
				id: 1,
				name: 'Nro de filas',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre/Razon Social',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Nro de Documento',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Error',
				checked: true,
				visible: true,
			},
		],
	};
}

export default {
	name: 'customer',
	components: {
		actionSidebar,
		assignGroup,
		assignPriceList,
		appActions,
		appTable,
		createGroup,
		customersAddressList,
		customersDetails,
		headerPage,
		modalSidebarButton,
		peopleImport,
		generalFilter,
		autocompleteComponent,
	},
	computed: {
		actionsDisabled,
		isAssign,
		isAssignGroup,
		isCreateGroup,
		isCustomers,
		isConfig,
		isDetail,
		isImport,
	},
	created,
	data,
	methods: {
		assignGroups,
		assignPrice,
		callServiceAndSearch,
		changePage,
		clearModal,
		closeModal,
		closeDialog,
		createGroupCustomers,
		customersImported,
		deleteCustomer,
		downloadExcel,
		getEmployee,
		goToAmortizations,
		goToPayments,
		goToSales,
		loadCustomerAddresses,
		loadData,
		openConfirm,
		openIt,
		runAction,
		saveData,
		sendWhatsapp,
		sunatService,
		loadResources,
		setData,
		filterRows,
		updateColumns,
		selectedAll,
		onCleanData,
		rowIsSelected,
		setState,
		async onResetPoints() {
			const body = {
				customersIds: this.dataSelected.map((p) => p.id),
			};
			try {
				await this.$httpSales.post('customer-reset-points', body);
				this.showNotification(
					'Se resetearon correctamente los puntos de los clientes seleccionados.'
				);
				this.loadData();
			} catch (err) {
				this.showGenericError();
			}
		},
		changePageError(page) {
			this.currentPageError = page;
			const array = this.dataCustError.details;
			if (page < 1 || page > Math.ceil(array.length / 10)) return;
			this.displayPage(page);
		},
		displayPage(page) {
			const array = this.dataCustError.details;
			const start = (page - 1) * 10;
			const end = start + 10;
			this.lastPageError = Math.ceil(array.length / 10);
			this.rowFilter = array.slice(start, end);
			this.totalItemsError = array.length;
		},
		onCustomersErrors(obj) {
			this.showColumnsError = !this.showColumnsError;
			this.dataCustError = obj;
			this.currentPageError = 1;
			this.displayPage(1);
		},
		async fixAccReceivable(row) {
			const body = {
				customerId: row.id,
				flagGenerateScript: true,
			};
			try {
				await this.$httpSales.post('amortizations-repair', body);
				this.showNotification(
					'Se repararon correctamente las cuentas por cobrar correctamente del cliente.'
				);
				this.loadData();
			} catch (err) {
				this.showGenericError();
			}
		},
		setDate({ model, value }) {
			this.params[model] = format(value, 'YYYY-MM-DD');
			if (model === 'startDate') {
				this.params.endDate = null;
			} else {
				this.loadData();
			}
			// const date = new Date(this.params.startDate);
			// date.setDate(date.getDate() + 30);
			// this.maxDate = date.toISOString().split('T')[0];
		},
	},
	validations,
	watch: {
		customer,
	},
};
</script>

<style lang="scss" scoped>
.fonts {
	@include txt-config(lato-bold, medium);
}

.form-input--height {
	height: 60px;
}

.title-text {
	font-size: 0.8rem;
	color: red;
}

.modal {
	border-radius: 8px;
}

.title-card {
	border-bottom: 1px solid #e0e0e0;
	padding: 15px 25px;
	font-weight: bold;
}
</style>
