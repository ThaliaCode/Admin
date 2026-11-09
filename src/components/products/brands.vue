<template>
	<div class="warehouse">
		<header-page
			:title="$route.meta.title"
		/>
		<v-layout row px-4>
			<v-flex xs6 md3 offset-xs6 offset-md9 my-3 class="fonts">
				<v-layout justify-space-around align-center>
					<button
						class="product-add-btn mt-1"
						type="button"
						@click="openIt"
					>
						<span>Agregar nueva Marca</span>
						<v-icon
							class="product-add-btn-icon"
							color="primary" size="17"
						>
							add_circle
						</v-icon>
					</button>
					<!-- <v-flex xs6>
						Agregar nueva Marca
					</v-flex>
					<v-flex xs2 md6>
						<button
							class="pl-add-container size"
							@click="openIt"
						>
							<v-icon id="add-icon" color="white">add</v-icon>
						</button>
					</v-flex> -->
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout>
			<v-flex xs12>
				<app-table
					name="units"
					:selectable="false"
					:inputSearch="false"
					:filterColumns="false"
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:items-quantity="rows.length"
					:current-page="currentPage"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.index + 1 }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.id }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 5)">
							<app-tooltip-button
								class="table-icon mr-2"
								height="21"
								color="primary"
								icon="mode_edit"
								text="Editar Producto"
								@click-icon="openIt(props.row)"
							></app-tooltip-button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:title="action.title"
			:help-actions="actionsToHelp"
			:active="action.active">
			<v-container>
				<v-layout wrap>
					<v-flex xs10 mb-3>
						<label class="caption">Nombre</label>
						<v-text-field
							required
							class="filter-select shadow-inset"
							name="new-product-name"
							label="Nombre"
							single-line
							v-model="newBrand.name"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.newBrand.name.required">
							El nombre de la marca es requerida
						</span>
					</v-flex>
					<v-flex xs10>
						<label class="caption">Código</label>
						<v-text-field
							required
							class="filter-select shadow-inset"
							name="new-product-name"
							label="Código"
							single-line
							v-model="newBrand.code"
						></v-text-field>
						<span class="form-group__message" v-if="!$v.newBrand.code.required">
							El código de la marca es requerida
						</span>
						<span
							class="text-not-code-blank"
							v-if="checkBlankCode(newBrand.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
				</v-layout>
			</v-container>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.newBrand.$invalid || checkBlankCode(newBrand.code) || isLoading"
					v-on:cancel-button-clicked="closeModal"
					v-on:accept-button-clicked="saveData" />
			</section>
		</action-sidebar>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from './../shared/utils/modal-sidebar-button';
import appTable from './../shared/table/app-table';
import actionSidebar from './../shared/action-sidebar';

function created() {
	this.loadData();
}

async function loadData() {
	try {
		({ data: this.rows } = await this.brandsList());
	} catch (error) {
		this.showGenericError();
	}
}

function openIt(brand) {
	this.action = { ...this.actionCreate };
	if (brand.name) {
		this.action.title = 'Editar Marca';
		this.newBrand.name = brand.name;
		this.newBrand.code = brand.code;
		this.id = brand.id;
	}
}

function clearModal() {
	this.newBrand = { name: '', code: '' };
	this.id = 0;
}

function closeModal() {
	this.action = this.actionDefault;
	this.clearModal();
}

function changePage(page) {
	this.currentPage = page;
}

async function saveData() {
	this.isLoading = true;
	const urlPost = 'brands';
	const urlPatch = `brands/${this.id}`;
	const url = this.id ? urlPatch : urlPost;
	const mPost = 'post';
	const mPatch = 'patch';
	const method = this.id ? mPatch : mPost;
	const messagePost = 'creada';
	const messagePatch = 'actualizada';
	const message = this.id ? messagePatch : messagePost;
	const body = {
		code: this.newBrand.code,
		name: this.newBrand.name,
	};
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`Marca ${message} exitosamente`);
		this.closeModal();
		this.loadData();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'BRAND_DUPLICATE_CODE') {
				this.showNotification('El código de la marca ya se encuentra registrado.', 'error');
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function validations() {
	return {
		newBrand: {
			name: {
				required,
			},
			code: {
				required,
			},
		},
	};
}

function data() {
	return {
		action: {
			open: false,
			active: false,
			width: 350,
			title: 'Título desde data',
		},
		actionDefault: {
			open: false,
			active: false,
			width: 350,
			title: 'Título desde data',
		},
		actionCreate: {
			open: true,
			active: true,
			width: 350,
			title: 'Nueva marca',
		},
		columns: [
			{ id: 1, name: 'Posición', value: 'position', visible: true, checked: true },
			{ id: 2, name: 'id', value: 'id', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		currentPage: 1,
		id: 0,
		isLoading: false,
		lastPage: 0,
		newBrand: {
			name: '',
			code: '',
		},
		rows: [],
	};
}
export default {
	name: 'brands',
	components: {
		actionSidebar,
		appTable,
		headerPage,
		modalSidebarButton,
	},
	data,
	created,
	methods: {
		changePage,
		clearModal,
		closeModal,
		loadData,
		openIt,
		saveData,
	},
	validations,
};
</script>

<style lang="scss" scoped>

</style>
