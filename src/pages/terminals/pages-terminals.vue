<template>
	<div>
		<header-page :title="this.$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<terminals-list
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:rows="rows"
			@on-delete="onDelete"
			@on-page="onPage"
			@on-search="onSearch"
			@open-edit="openEdit"
		/>
		<router-view></router-view>
	</div>
</template>

<script>
	import appActions from '@/components/shared/app-actions';
	import headerPage from '@/components/shared/header-page';
	import terminalsList from '@/components/terminals/terminals-list';

	function created() {
		this.updateColumns();
		this.loadData();
	}

	function updateColumns() {
		if (this.isEcuador) {
			const label = 'Autorización SRI';
			const index = this.columns.findIndex(col => col.value === 'sunat');
			this.$set(this.columns[index], 'name', label);
		}
		return this.columns;
	}

	async function loadData() {
		const params = this.table.params;
		({ data: this.rows } = await this.$httpSales.get('terminals', { params }));
	}

	function onDelete({ id, name }) {
		this.goTo('terminals-delete', { params: { id, name } });
	}

	function onPage(page) {
		this.currentPage = page;
		this.table.params.page = page;
		this.loadData();
	}

	function onSearch(search) {
		this.table.params.search = search;
		this.loadData();
	}

	function openEdit({ id }) {
		this.goTo('terminals-edit', { params: { id } });
	}

	function runAction({ code }) {
		if (code === 'new-terminal') {
			this.goTo('terminals-new');
		}
	}

	function data() {
		return {
			cleanSearch: false,
			columns: [
				{ id: 1, name: 'Código', value: 'code', checked: true, visible: true },
				{ id: 2, name: 'Autorización Sunat', value: 'sunat', checked: true, visible: true },
				{ id: 3, name: 'Nombre', value: 'name', checked: true, visible: true },
				{ id: 4, name: 'Almacén - Tienda', value: 'store', checked: true, visible: true },
				{ id: 5, name: 'Descripción', value: 'description', checked: true, visible: true },
				{ id: 6, name: 'Serie de Impresora', value: 'print', checked: true, visible: true },
				{ id: 7, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			currentPage: 1,
			rows: [],
		};
	}

	export default {
		name: 'pages-terminals',
		components: {
			appActions,
			headerPage,
			terminalsList,
		},
		created,
		data,
		methods: {
			loadData,
			onDelete,
			onPage,
			onSearch,
			openEdit,
			runAction,
			updateColumns,
		},
		watch: {
			$route(newVal) {
				if (newVal) {
					if (newVal.name === 'terminals') {
						this.loadData();
					}
				}
			},
		},
	};
</script>
