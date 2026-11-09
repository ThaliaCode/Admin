<template>
	<div>
		<v-layout wrap row>
			<v-flex xs6 pr-4>
				<p>Listado de cuentas bancarias</p>
				<div class="content-table">
					<app-table
					:columns="columns"
					:rows="rows"
					:filter-columns="false"
					:main-list="false"
					name="bank-accounts-tab"
					selectable
					dispatch-detail
					disabled-value="disabled"
					:check-all="checkAll"
					@on-search-event="onSearch"
					@on-selected-all="onSelectedAll"
					@row-is-selected="rowIsSelected"
					>
						<template slot="rows" slot-scope="props">
							<td v-show="showRow(columns, 1)" :class="{ 'disabled': props.row.disabled }">{{ props.row.bank.name }}</td>
							<td v-show="showRow(columns, 2)" :class="{ 'disabled': props.row.disabled }">{{ props.row.bankAccountType ? props.row.bankAccountType.name : '' }}</td>
							<td v-show="showRow(columns, 3)" :class="{ 'disabled': props.row.disabled }">{{ props.row.name }}</td>
							<td v-show="showRow(columns, 4)" :class="{ 'disabled': props.row.disabled }">{{ props.row.accountNumber }}</td>
						</template>
					</app-table>
				</div>
				<div class="mt-4 text-xs-center">
					<v-btn
						small
						dark
						color="info"
						class="btn-action"
						@click="assignAccounts"
					>
						Asignar
					</v-btn>
				</div>
			</v-flex>
			<v-flex xs6 pl-4>
				<p>Cuentas Bancarias asignadas - {{titleCommerce}}</p>
				<div class="content-table">
					<app-table
					:columns="columnsAssigned"
					name="bank-accounts-assigned"
					:rows="rowsAssigned"
					:filter-columns="false"
					:main-list="false"
					>
					<template slot="rows" slot-scope="props">
						<td v-show="(columns, 1)">{{ props.row.bank.name }}</td>
						<td v-show="(columns, 2)">{{ props.row.bankAccountType ? props.row.bankAccountType.name : '' }}</td>
						<td v-show="(columns, 3)">{{ props.row.name }}</td>
						<td v-show="(columns, 4)">{{ props.row.accountNumber }}</td>
							<td v-show="(columns, 5)">
								<button 
								type="button"
								@click="openConfirmDelete(props.row)">
									<v-icon color="error" slot="activator">
										cancel
									</v-icon>
								</button>
							</td>
						</template>
					</app-table>
				</div>
			</v-flex>
		</v-layout>
		<v-dialog v-model="dialog" persistent max-width="400">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
					class="btn-action"
					color="info"
					dark
					@click.native="closeDialog"
					>Cancelar</v-btn>
					<v-btn
					class="btn-action"
					color="error"
					dark
					@click.native="deleteRow"
					>Eliminar</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';

function onSearch(search) {
	this.$emit('on-search', search);
}

function onSelectedAll(checked) {
	this.$emit('on-selected-all', checked);
}

function rowIsSelected(row) {
	this.$emit('is-selected', row);
}

function assignAccounts() {
	this.$emit('assign-bank');
}

function closeDialog() {
	this.dialog = false;
	this.bankId = null;
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿ Desea eliminar "'${name}'"?`;
	this.dialog = true;
	this.bankId = id;
}

function deleteRow() {
	this.$emit('delete-row', this.bankId);
	this.closeDialog();
}

function data() {
	return {
		dialogMessage: '',
		dialog: false,
		bankId: null,
		columnsAssigned: [
			{ id: 1, name: 'Banco', value: 'bank', visible: true, checked: true },
			{ id: 2, name: 'Tipo', value: 'typeAccount', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 4, name: 'Número', value: 'number', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true },
		],
	};
}


export default {
	name: 'bank-accounts-tab',
	data,
	components: {
		appTable,
	},
	methods: {
		assignAccounts,
		closeDialog,
		deleteRow,
		rowIsSelected,
		openConfirmDelete,
		onSearch,
		onSelectedAll,
	},
	props: {
		columns: {
			type: Array,
			default: () => [],
		},
		rows: {
			type: Array,
			default: () => [],
		},
		rowsAssigned: {
			type: Array,
			default: () => [],
		},
		titleCommerce: String,
		checkAll: {
			type: Boolean,
			default: () => false,
		},
	},
};
</script>
<style lang="scss" scoped>
	.content-table {
		background: map-get($colors, white);
		border: 1px solid map-get($colors, border-tab);
		border-radius: 0.8rem;
		padding-top: 11px;
	}

	.disabled {
		opacity: 0.2;
	}
</style>

