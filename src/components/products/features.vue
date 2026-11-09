<template>
	<div>
		<header-page
			:columns="filteredColumns"
			name="features"
			:rows="featuresSelected"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanData"
		/>
		<v-layout row wrap my-3 align-end>
			<v-flex xs4 pl-4>
				<app-select
					:item="params.subsidiaryId"
					:items="subsidiaries"
					item-text="sucursalName"
					item-value="id"
					label="Sucursal"
					model="subsidiaryId"
					:return-object="false"
					@input="setSubsidiary"
				></app-select>
			</v-flex>
			<v-flex xs8 pr-4 text-xs-right>
				<v-btn
					color="primary"
					class="btn-action white--text"
					@click="openSidebar"
				>
					Agregar
				</v-btn>
			</v-flex>
		</v-layout>
		<app-table
			name="features"
			:columns="columns"
			:current-page="currentPage"
			:rows="features"
			local-storage
			selectable
			:check-all="checkAll"
			:last-page="lastPage"
			:clean-search="isClean"
			@on-toggle-columns="toggleColumns"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll">
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.subsidiaryName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.updatedAt | formatDate }}</td>
				<td v-show="showRow(columns, 4)">
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							class="table-icon green--text"
							@click.native.stop="openSidebar(props.row)">
							<v-icon>edit</v-icon>
						</v-btn>
						<span>Editar</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							class="table-icon red--text"
							@click.native.stop="confirmDelete(props.row)">
							<v-icon>cancel</v-icon>
						</v-btn>
						<span>Eliminar</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:help-actions="actionsToHelp"
			@close-modal="closeSidebar">
			<features-action
				v-if="action.code"
				:code="action.code"
				:feature="feature"
				@call-to-action="actionFeature"
				@cancel-to-action="closeSidebar"
			/>
		</action-sidebar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="360">
			<v-card>
				<v-card-title class="headline">Eliminar Características</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					¿Desea eliminar la característica "{{ featureName }}"?
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2
							text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteFeature">
								Eliminar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import actionSidebar from './../shared/action-sidebar';
	import appTable from './../shared/table/app-table';
	import featuresAction from './utils/features-action';
	import headerPage from './../shared/header-page';

	function created() {
		this.loadSubsidiaries();
	}

	async function actionFeature(model) {
		const method = this.feature.id ? 'patch' : 'post';
		const url = this.feature.id ? `features/${this.feature.id}` : 'features';
		const message = this.feature.id ? 'actualizó' : 'creó';
		try {
			await this.$httpProducts[method](url, model);
			this.showNotification(`La característica se ${message} correctamente`);
			this.closeSidebar();
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function callServiceAndSearch(search) {
		if (search) {
			this.params.code = search;
		} else {
			this.params.code = null;
		}
		this.currentPage = 1;
		this.loadData(1);
	}

	function cancelDelete() {
		this.dialog = false;
		this.featureId = 0;
		this.featureName = '';
	}

	function changePage(page) {
		this.currentPage = page;
		this.loadData(page);
	}

	function closeSidebar() {
		this.action.open = false;
		this.action.code = '';
		this.action.title = '';
		this.feature = {};
	}

	function confirmDelete({ id, name }) {
		this.featureId = id;
		this.featureName = name;
		this.dialog = true;
	}

	async function deleteFeature() {
		try {
			await this.$httpProducts.delete(`features/${this.featureId}`);
			this.showNotification(`La característica ${this.featureName} ha sido eliminada`);
			this.cancelDelete();
			this.loadData();
		} catch (err) {
			this.showGenericError();
		}
	}

	async function loadData(page = 1) {
		this.params.page = page;
		try {
			const { data: features, headers } = await this.$httpProducts.get('features', { params: this.params });
			this.features = features.map((feat) => {
				const newFeat = { ...feat };
				const subsidiary = this.subsidiaries.find(s => s.id === feat.subsidiaryId) || {};
				newFeat.subsidiaryName = feat.subsidiaryId ? subsidiary.sucursalName || '' : '';
				newFeat.isSelected = false;
				return newFeat;
			});
			this.lastPage = Number(headers['x-last-page']);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.checkAll = this.features.every(d => d.isSelected);
			this.isClean = false;
		}
	}

	async function loadSubsidiaries() {
		try {
			({ data: this.subsidiaries } = await this.subsidiariesList());
			if (this.subsidiaries.length === 1) {
				this.params.subsidiaryId = this.subsidiaries[0].id;
			}
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onCleanData() {
		this.params = {
			page: 1,
			limit: 20,
			subsidiaryId: null,
		};
		this.isClean = true;
		helper.removeLocalData('features::search');
		this.callServiceAndSearch();
	}

	function openSidebar(feature) {
		if (feature.id) {
			this.feature = { ...feature };
			this.action.code = 'edit';
			this.action.title = 'EDITAR CARACTERÍSTICA';
		} else {
			this.feature = {};
			this.action.code = 'create';
			this.action.title = 'CREAR CARACTERÍSTICA';
		}
		this.action.open = true;
	}

	function rowIsSelected(row) {
		({ products: this.features, productsSelected: this.featuresSelected,
			checkAll: this.checkAll } = this.selectedRows(row, this.features,
			this.featuresSelected));
	}

	function selectedAll(value) {
		({ products: this.features, productsSelected: this.featuresSelected,
			checkAll: this.checkAll } = this.selecteAll(value, this.features,
			this.featuresSelected));
	}

	function toggleColumns() {
		return true;
	}

	function filteredColumns() {
		return this.columns.filter(c => c.name !== 'Acciones');
	}

	function setSubsidiary({ value }) {
		this.params.subsidiaryId = value;
		this.loadData();
	}

	function data() {
		return {
			action: {
				code: '',
				open: false,
				title: '',
				width: 550,
			},
			checkAll: false,
			columns: [
				{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 2, name: 'Sucursal', value: 'subsidiaryName', visible: true, checked: true },
				{ id: 3, name: 'Última Actualización', value: 'updatedAt', visible: true, checked: true },
				{ id: 4, name: 'Acciones', visible: true, value: 'Acciones', flagVisible: true },
			],
			currentPage: 1,
			dialog: false,
			feature: {},
			featureId: 0,
			featureName: '',
			features: [],
			featuresSelected: [],
			isClean: false,
			lastPage: 1,
			params: {
				limit: 20,
				page: 1,
				subsidiaryId: null,
			},
			subsidiaries: [],
		};
	}

	export default {
		name: 'features',
		components: {
			actionSidebar,
			appTable,
			featuresAction,
			headerPage,
		},
		computed: {
			filteredColumns,
		},
		created,
		data,
		methods: {
			actionFeature,
			callServiceAndSearch,
			cancelDelete,
			changePage,
			closeSidebar,
			confirmDelete,
			deleteFeature,
			loadData,
			loadSubsidiaries,
			onCleanData,
			openSidebar,
			rowIsSelected,
			selectedAll,
			setSubsidiary,
			toggleColumns,
		},
	};
</script>

<style lang="scss" scoped>

</style>
