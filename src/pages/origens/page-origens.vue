<template>
	<div>
		<app-loading
			:show-loading="showLoading"
			label="La carga terminará en un momento y podrás ver
        	toda la información del listado de origenes"
		/>
		<header-page
			name="suppliers-list-product"
			:title="$route.meta.title"
			show-clean
			to-show
			:show-excel="false"
			@clean-product-filter="cleanFilter"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout class="text-xs-left mb-2 ml-4 mt-4">
			<v-flex xs2 ml-2>
				<app-select
					item-text="name"
					item-value="code"
					:items="origens"
					label="Tipos de origen"
					:item="params.typeOrigin"
					@input="setData($event, 'typeOrigin', true)"
				/>
			</v-flex>
		</v-layout>
		<app-table
			class="mt-3"
			name="products-by-seller"
			:rows="data"
			:columns="columns"
			:input-search="false"
			:last-page="lastPage"
			:items-total-quantity="itemsTotalQuantity"
			:current-page="params.page"
			:items-quantity="data.length"
			@on-search-event="searchEvent"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.description || '-' }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.typeGeneral.name }}
				</td>
			</template>
		</app-table>
		<action-sidebar
			:width="action.width"
			:title="action.title"
			:value="action.open"
			@close-modal="closeModal"
		>
			<v-container v-if="action.code !== 'HELP'">
				<v-layout wrap px-2>
					<v-flex xs12 px-2 mt-3>
						<app-input-text
							label="Nombre"
							model="name"
							:text="createOrigin.name"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs12 px-2 mt-3>
						<app-input-text
							label="Código"
							model="code"
							:text="createOrigin.code"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs12 px-2 mt-3>
						<app-input-text
							label="Descripción"
							model="description"
							:text="createOrigin.description"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs12 px-2 mt-3>
						<app-select
							item-text="name"
							item-value="code"
							:items="origens"
							label="Tipos de origen"
							:item="createOrigin.typeOrigin"
							@input="setData($event, 'typeOrigin')"
						/>
					</v-flex>
				</v-layout>
			</v-container>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.$invalid"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="saveData"
				/>
			</section>
		</action-sidebar>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import headerPage from '@/components/shared/header-page';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import listProductsBySeller from '@/components/sales/list-products-by-seller';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appActions from '@/components/shared/app-actions';
import { required } from 'vuelidate/lib/validators';

const { getDeeper } = lib;

function data() {
	return {
		action: {
			open: false,
			code: '',
			title: '',
			width: 600,
		},
		origens: [
			{
				id: 1,
				code: 'typeOriginOrder',
				name: 'Ventas/Pedidos',
			},
			{
				id: 2,
				code: 'typeOriginPurchase',
				name: 'Compras',
			},
		],
		cleanInput: false,
		columns: [
			{
				id: 1,
				name: 'Código',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Descripción',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Origen',
				visible: true,
				checked: true,
			},
		],
		data: [],
		searchVal: null,
		showLoading: false,
		params: {
			page: 1,
			limit: 20,
			typeOrigin: 'typeOriginOrder',
		},
		itemsTotalQuantity: 0,
		lastPage: 0,
		createOrigin: {
			name: null,
			code: null,
			description: null,
			typeOrigin: 'typeOriginOrder',
		},
	};
}

async function created() {
	this.loadData();
}

export default {
	name: 'page-products-by-seller',
	components: {
		headerPage,
		productsSearchInput,
		appTable,
		actionSidebar,
		productsSearchForm,
		listProductsBySeller,
		appActions,
		modalSidebarButton,
	},
	created,
	data,
	computed: {
		allowProductFree() {
			const adminUser = helper.getLocalData('admin-user');
			return getDeeper('subsidiary', 'settings', 'allowProductFree')(adminUser);
		},
	},
	methods: {
		setData(value, model, isFilter) {
			if (isFilter) {
				this.params[model] = value.value.code;
				this.params.page = 1;
				this.loadData();
			} else {
				const modelT = model || value.model;
				this.createOrigin[modelT] = value.value.code || value.value;
			}
		},
		closeModal() {
			this.action.open = false;
			this.action.code = null;
			this.action.title = '';
			this.action.width = 0;
			this.searchVal = null;
			this.createOrigin = {
				name: null,
				code: null,
				description: null,
				typeOrigin: 'typeOriginOrder',
			};
		},
		async loadData() {
			try {
				this.showLoading = true;
				const params = { ...this.params };
				const response = await this.$httpSales.get('type-origins', {
					params,
				});
				this.data = response.data || [];
				this.lastPage = Number(response.headers['x-last-page']);
				this.itemsTotalQuantity =
					Number(response.headers['x-quantity']) || this.data.length;
			} catch (error) {
				this.showGenericError();
			} finally {
				this.showLoading = false;
			}
		},
		changePage(page) {
			this.params.page = page;
			this.loadData();
		},
		cleanFilter() {
			this.cleanInput = true;
			this.params = {
				page: 1,
				limit: 20,
				typeOrigin: 'typeOriginOrder',
			};
			this.searchVal = null;
			this.loadData();
		},
		searchEvent(searchValue) {
			if (searchValue) {
				this.params.search = searchValue;
			} else {
				this.params.search = null;
			}
			this.params.page = 1;
			this.loadData();
		},
		runAction(item) {
			this.action.active = true;
			this.action.code = item.code;
			this.action.open = true;
			this.action.title = item.name;
			this.action.width = 500;
		},
		async saveData() {
			try {
				const body = { ...this.createOrigin };
				await this.$httpSales.post('type-origins', body);
				this.cleanFilter();
				this.closeModal();
				this.showNotification('Origen creado correctamente');
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	validations() {
		return {
			createOrigin: {
				code: {
					required,
				},
				name: {
					required,
				},
			},
		};
	},
};
</script>
<style lang="scss" scoped>
.label-container {
	background-color: color(border-green-light);
	display: inline-flex;
	height: 31px;
	line-height: 31px;
	padding-left: 5px;
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
	padding-left: 15px;
}
</style>
