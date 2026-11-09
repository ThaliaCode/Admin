<template>
	<div>
		<header-page
			caption-navigation="Productos"
			:title="$route.meta.title"
		></header-page>
		<v-layout row align-end class="px-5 py-4 mt-2">
			<v-flex xs3 text-xs-left>
				<app-select
					:items="modes"
					item-text="name"
					item-value="id"
					label="Modo"
					model="modeFilter"
					:item="modeFilter"
					@input="setMode"
				/>
			</v-flex>
			<v-flex xs9 text-xs-right>
				<v-btn
					class="btn-action btn-auto px-4 py-2"
					color="primary"
					@click="onClick({ action: 'create', row: rowSelected })"
				>
					Crear atributo
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="px-3 py-4">
			<attributes-table
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-click="onClick"
				@on-page="loadAttributes"
				@on-search="onSearch"
			></attributes-table>
		</div>
		<action-sidebar
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="closeSlide"
		>
			<attributes-action-slide
				v-if="action.code === 'create' || action.code === 'edit'"
				:row="rowSelected"
				@add-identifier="addIdentifier"
				@cancel-action="closeSlide"
				@delete-identifier="deleteIdentifier"
				@get-data="setData"
				@save-attribute="saveAttribute"
			></attributes-action-slide>
		</action-sidebar>
		<v-dialog
			v-model="dialog.open"
			persistent
			max-width="425"
		>
			<v-card>
				<v-card-title class="headline justify-center">
					{{ dialog.title }}
				</v-card-title>
				<v-card-text class="subtext">
					{{ dialog.message }}
				</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap justify-center>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="closeDialog"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1 text-xs-left>
							<v-btn
								color="success"
								class="btn-action white--text"
								@click.native="rightAction">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import attributesActionSlide from '@/components/attributes/attributes-action-slide';
	import attributesTable from '@/components/attributes/attributes-table';
	import headerPage from '@/components/shared/header-page';

	function created() {
		this.modeFilter = this.modes[0].id;
		this.loadSubsidiaries();
	}

	function addIdentifier(identifier, index) {
		const indexCode = this.rowSelected.attributeDetail.findIndex(d =>
			d.code.toLowerCase() === identifier.code.toLowerCase());
		const indexName = this.rowSelected.attributeDetail.findIndex(d =>
			d.name.toLowerCase() === identifier.name.toLowerCase());
		if (indexCode > -1 && indexName > -1 && indexCode !== index && indexName !== index) {
			this.showNotification('Ya existe un identificador con los mismos datos', 'warning');
		} else if (indexCode > -1 && indexCode !== index) {
			this.showNotification('Ya existe un identificador con el mismo código', 'warning');
		} else if (indexName > -1 && indexName !== index) {
			this.showNotification('Ya existe un identificador con el mismo nombre', 'warning');
		} else if (index !== null) {
			this.$set(this.rowSelected.attributeDetail, index, identifier);
		} else {
			this.rowSelected.attributeDetail.push({ ...identifier });
		}
	}

	function closeDialog() {
		this.dialog.open = false;
		this.dialog.message = '';
		this.dialog.title = '';
		this.rowSelected = {
			attributeDetail: [],
			code: '',
			name: '',
			type: 1,
		};
	}

	function closeSlide() {
		this.action.value = false;
		this.action.code = '';
		this.action.title = '';
		this.rowSelected = {
			attributeDetail: [],
			code: '',
			name: '',
			type: 1,
			mode: '',
		};
	}

	async function deleteAttribute() {
		try {
			await this.$httpProducts.delete(`attribute/${this.rowSelected.id}`);
			this.showNotification('El atributo ha sido eliminado correctamente.');
			this.closeDialog();
			this.loadAttributes();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'ATTRIBUTE_NOT_DELETE') {
					this.showGenericError('No se puede eliminar un atributo que se encuentra asignado a uno o más productos.');
				}
			}
		}
	}

	function deleteIdentifier(index) {
		this.rowSelected.attributeDetail.splice(index, 1);
	}

	async function loadAttributes(page = 1) {
		this.currentPage = page;
		this.params.page = this.currentPage;
		this.params.mode = this.modeFilter;
		const params = { ...this.params };
		const { data: rows, headers } = await this.$httpProducts.get('attribute', { params });
		this.rows = [...rows];
		this.lastPage = Number(headers['x-last-page']);
	}

	async function loadSubsidiaries() {
		({ data: this.subsidiaries } = await this.subsidiariesList());
		const subsidiaryDefault = this.subsidiaries.find(s =>
			s.id === this.$userInfo.comSubsidiariesId) || this.subsidiaries[0];
		this.selectedSubsidiary({ model: 'subsidiaryId', value: subsidiaryDefault });
	}

	function onClick({ action, row }) {
		this.rowSelected = { ...row };
		this.rowSelected.mode = row.mode === 1 ? 'online' : 'sales';
		if (action === 'edit' || action === 'create') {
			this.action.code = action;
			this.action.title = action === 'edit' ? 'Editar Atributo' : 'Crear Atributo';
			this.action.value = true;
		} else if (action === 'delete') {
			this.dialog.code = action;
			this.dialog.message = 'Al aceptar, el atributo será eliminado del listado.';
			this.dialog.title = 'Eliminar Atributo';
			this.dialog.open = true;
		}
	}

	function onSearch(search) {
		const searchTrim = search && search.trim() ? search.trim() : null;
		this.params.search = searchTrim;
		this.loadAttributes();
	}

	function rightAction() {
		if (this.dialog.code === 'delete') {
			this.deleteAttribute();
		}
	}

	async function saveAttribute() {
		const url = this.rowSelected.id ? `attribute/${this.rowSelected.id}` : 'attribute';
		const method = this.rowSelected.id ? 'patch' : 'post';
		const message = this.rowSelected.id ? 'actualizado' : 'creado';
		const body = {
			attributeDetail: [...this.rowSelected.attributeDetail],
			code: this.rowSelected.code,
			name: this.rowSelected.name,
			nameSubsidiary: this.subsidiaryName,
			subsidiaryId: this.params.subsidiaryId,
			type: this.rowSelected.type,
			// mode: this.rowSelected.showType === 'sales' ? 2 : 1,
		};
		if (!this.rowSelected.id) {
			body.mode = this.rowSelected.mode === 'sales' ? 2 : 1;
		}
		try {
			await this.$httpProducts[method](url, body);
			this.showNotification(`El atributo ha sido ${message} correctamente.`);
			this.closeSlide();
			this.loadAttributes();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'ATTRIBUTE_CODE_EXIST') {
					this.showGenericError('No se puede crear o editar un atributo con un código ya existente.');
				}
			}
		}
	}

	function selectedSubsidiary({ model, value }) {
		this.params[model] = value.id;
		this.subsidiaryName = value.sucursalName;
		this.loadAttributes();
	}

	function setData({ model, value }) {
		this.rowSelected[model] = value;
	}

	function setMode({ model, value }) {
		this[model] = value.id;
		this.loadAttributes();
	}

	function data() {
		return {
			action: {
				code: '',
				title: '',
				value: false,
				width: 539,
			},
			columns: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Tipo',
					value: 'type',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Acciones',
					value: 'actions',
					checked: true,
					visible: true,
					flagVisible: true,
				},
			],
			currentPage: 1,
			dialog: {
				code: '',
				message: '',
				open: false,
				title: '',
			},
			lastPage: 0,
			modes: [
				{
					id: 1,
					name: 'Tienda Online',
				},
				{
					id: 2,
					name: 'Venta',
				},
			],
			modeFilter: null,
			params: {
				limit: 20,
				page: 1,
				search: null,
				subsidiaryId: null,
			},
			rows: [],
			rowSelected: {
				attributeDetail: [],
				code: '',
				name: '',
				mode: 'online',
				type: 1,
			},
			subsidiaries: [],
			subsidiaryName: '',
		};
	}

	export default {
		name: 'page-products-attributes',
		components: {
			actionSidebar,
			attributesActionSlide,
			attributesTable,
			headerPage,
		},
		created,
		data,
		methods: {
			addIdentifier,
			closeDialog,
			closeSlide,
			deleteAttribute,
			deleteIdentifier,
			loadAttributes,
			loadSubsidiaries,
			onClick,
			onSearch,
			rightAction,
			saveAttribute,
			selectedSubsidiary,
			setData,
			setMode,
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
</style>