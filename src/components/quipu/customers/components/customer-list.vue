<template>
	<div class="mt-5">
		<app-table
			name="admin-customers"
			:selectable="false"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			class="is-not-selectable">
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.startDateFunctions | formatDate }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.ruc }}
				</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.phone }}
				</td>
				<td v-show="showRow(columns, 5)">
					{{ props.row.email }}
				</td>
				<td v-show="showRow(columns, 6)">
					<v-tooltip top>
						<v-btn
							slot="activator"
							@click.stop="openSideModal(modalActions.credentialsApp)"
							icon>
							<v-icon color="primary">developer_board</v-icon>
						</v-btn>
						<span>Crear credenciales (app)</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
							slot="activator"
							@click.stop="openSideModal(modalActions.contablePlan)"
							icon>
							<v-icon color="primary">insert_drive_file</v-icon>
						</v-btn>
						<span>Plan contable</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
							slot="activator"
							@click.stop="openSideModal(modalActions.contablePeriod)"
							icon>
							<v-icon color="primary">code</v-icon>
						</v-btn>
						<span>Periodo contable</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
							slot="activator"
							@click.stop="openSideModal(modalActions.creatEditCustomers, props.row)"
							icon>
							<v-icon color="primary">edit</v-icon>
						</v-btn>
						<span>Editar cliente</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon>
							<v-icon color="error">delete</v-icon>
						</v-btn>
						<span>Eliminar</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from './../../../shared/table/app-table';

	function callServiceAndSearch(row) {
		this.$emit('search-data', row);
	}

	function changePage(page) {
		this.$emit('change-page', page);
	}

	function openSideModal(action, customerData = {}) {
		this.$emit('open-side-modal', action, customerData);
	}

	function data() {
		return {
			action: {
				active: false,
				code: '',
				title: '',
				open: false,
				width: 0,
			},
			modalActions: {
				contablePlan: {
					active: true,
					code: 'PLC',
					title: 'Plan Contable',
					open: true,
					width: 350,
				},
				credentialsApp: {
					active: true,
					code: 'CAPP',
					title: 'Crear Credencial App',
					open: true,
					width: 450,
				},
				contablePeriod: {
					active: true,
					code: 'CPE',
					title: 'Periodo contable',
					open: true,
					width: 550,
				},
				creatEditCustomers: {
					active: true,
					code: 'NC',
					title: 'Editar Cliente',
					open: true,
					width: 550,
				},
			},
		};
	}

	export default {
		name: 'customer-list',
		components: {
			appTable,
		},
		data,
		methods: {
			callServiceAndSearch,
			changePage,
			openSideModal,
		},
		props: {
			columns: {
				required: true,
				type: Array,
			},
			currentPage: {
				type: Number,
			},
			lastPage: {
				type: Number,
			},
			rows: {
				required: true,
				type: Array,
			},
		},
	};
</script>
