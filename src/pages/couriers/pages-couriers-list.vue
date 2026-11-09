<template>
	<div>
		<header-page :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<couriers-list
			class="mt-5"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-delete="onDelete"
			@on-edit="runAction({
				code: 'courier-new',
				name: `Editar Transportista: ${$event.name}` },
				$event)"
			@on-page="onPage"
			@on-search="onSearch"
		/>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:code-action="action.code"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="close"
		>
			<couriers-form
				v-if="actionCodeIs('courier-new')"
				:id="courierId"
				@close="close"
				@save="save"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
						class="btn-action"
						color="info"
						dark
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="deleteCourier"
					>
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import appActions from '@/components/shared/app-actions';
	import couriersForm from '@/components/reference-guides/couriers/couriers-form';
	import couriersList from '@/components/couriers/couriers-list';
	import headerPage from '@/components/shared/header-page';
	import helper from '@/shared/helper';

	function created() {
		this.loadData();
	}

	function actionCodeIs(code) {
		return this.action.code === code;
	}

	function cleanFilters() {
		this.table.params.search = null;
		this.cleanSearch = true;
		helper.removeLocalData('couriers::search');
		this.loadData();
	}

	function close() {
		this.action.open = false;
		this.action.code = '';
		this.action.title = '';
	}

	function closeDialog() {
		this.dialog = false;
		this.courierId = 0;
		this.dialogMessage = '';
	}

	async function deleteCourier() {
		try {
			await this.$httpSales.delete(`courier/${this.courierId}`);
			this.showNotification('El registro ha sido eliminado correctamente.');
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'COURIER_REMISSION_GUIDE_EXIST') {
					this.showGenericError('El transportista no puede ser eliminado por estar asociado a una guía de remisión.');
				}
			}
		} finally {
			this.closeDialog();
		}
	}

	async function loadData() {
		const params = this.table.params;
		({ data: this.rows, headers: this.headers } = await this.$httpSales.get('courier', { params }));
		this.rows = this.rows.map((row) => {
			const newRow = { ...row };
			newRow.typePersonName = row.typePerson ? row.typePerson.name : '';
			newRow.platesInline = row.plates.length > 0 ? row.plates.join(', ') : '';
			return newRow;
		});
		this.lastPage = Number(this.headers['x-last-page']);
		this.cleanSearch = false;
	}

	function onDelete({ id, name }) {
		this.courierId = id;
		this.dialogMessage = `¿Desea eliminar al transportista '${name}' del listado?`;
		this.dialog = true;
	}

	function onPage(page) {
		this.table.params.page = page;
		this.loadData();
	}

	function onSearch(search) {
		this.table.params.search = search;
		this.loadData();
	}

	function runAction({ code, name }, row) {
		this.courierId = row ? row.id : 0;
		this.action.code = code;
		this.action.title = name;
		this.action.open = true;
	}

	async function save(courierData) {
		const method = this.courierId ? 'patch' : 'post';
		const url = this.courierId ? `courier/${this.courierId}` : 'courier';
		const message = this.courierId ? 'editado' : 'creado';
		try {
			await this.$httpSales[method](url, courierData);
			this.showNotification(`El transportista ha sido ${message} correctamente.`);
			this.close();
			this.loadData();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function data() {
		return {
			action: {
				code: '',
				open: false,
				title: '',
				width: 434,
			},
			cleanSearch: false,
			columns: [
				{
					id: 1,
					name: 'Nombre',
					value: 'name',
					visible: true,
					checked: true,
				},
				{
					id: 2,
					name: 'Tipo doc.',
					value: 'typePerson.name',
					visible: true,
					checked: true,
				},
				{
					id: 3,
					name: '# Document',
					value: 'documentNumber',
					visible: true,
					checked: true,
				},
				{
					id: 4,
					name: 'Cod. Establecimiento',
					value: 'establishmentCode',
					visible: true,
					checked: true,
				},
				{
					id: 5,
					name: 'Placas',
					value: 'plates',
					visible: true,
					checked: true,
				},
				{
					id: 6,
					name: 'Acción',
					visible: true,
					checked: true,
					flagVisible: true,
				},
			],
			courierId: 0,
			currentPage: 1,
			dialog: false,
			dialogMessage: '',
			headers: {},
			lastPage: 1,
			rows: [],
		};
	}

	export default {
		name: 'pages-couriers-list',
		components: {
			actionSidebar,
			appActions,
			couriersForm,
			couriersList,
			headerPage,
		},
		created,
		data,
		methods: {
			actionCodeIs,
			cleanFilters,
			close,
			closeDialog,
			deleteCourier,
			loadData,
			onDelete,
			onPage,
			onSearch,
			runAction,
			save,
		},
	};
</script>
