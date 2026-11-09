<template>
	<div>
		<div class="overflow-auto">
			<app-table
				name="suppliers"
				:clean-search="cleanSearch"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				@on-page="onPage"
				@on-search-event="onSearch"
				@row-is-selected="rowIsSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">
						{{ props.row.autoCode }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.address }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.contactName }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.phones }}</td>
					<td v-show="showRow(columns, 7)">
						<router-link
							v-if="props.row.totalPurchase"
							:to="{
								name: 'suppliers-total',
								params: { id: props.row.id, type: 'amount' },
							}"
						>
							{{ props.row.currencySymbol
							}}{{ props.row.totalPurchase | round }}
						</router-link>
						<router-link
							v-if="props.row.totalPurchaseUsd"
							class="ml-3"
							:to="{
								name: 'suppliers-total',
								params: { id: props.row.id, type: 'amount' },
							}"
						>
							{{ props.row.currencySymbolUsd
							}}{{ props.row.totalPurchaseUsd | round }}
						</router-link>
					</td>
					<td v-show="showRow(columns, 8)">
						<router-link
							v-if="props.row.totalDebt"
							:to="{
								name: 'suppliers-total',
								params: { id: props.row.id, type: 'debt' },
							}"
						>
							{{ props.row.currencySymbol }}{{ props.row.totalDebt | round }}
						</router-link>
						<router-link
							v-if="props.row.totalDebtUsd"
							:to="{
								name: 'suppliers-total',
								params: { id: props.row.id, type: 'debt' },
							}"
						>
							{{ props.row.currencySymbolUsd
							}}{{ props.row.totalDebtUsd | round }}
						</router-link>
					</td>
					<td v-show="showRow(columns, 9)">
						{{
							props.row.accountingAccount
								? props.row.accountingAccount.accountingCode
								: null
						}}
						{{
							props.row.accountingAccount
								? props.row.accountingAccount.accountingName
								: null
						}}
					</td>
					<td v-show="showRow(columns, 10)">
						<app-tooltip-button
							text="Ver Detalle"
							icon="remove_red_eye"
							color="info"
							@click-icon="seeDetail(props.row)"
						/>
						<app-tooltip-button
							text="Adjuntar Documentos"
							icon="attachment"
							color="indigo"
							@click-icon="openDocument(props.row)"
						/>
						<app-tooltip-button
							text="Editar"
							icon="edit"
							color="success"
							@click-icon="openEdit(props.row)"
						/>
						<app-tooltip-button
							text="Eliminar"
							icon="delete"
							color="error"
							@click-icon="onDelete(props.row)"
						/>
						<app-tooltip-button
							text="Listado de productos"
							icon="list"
							color="info"
							@click-icon="viewList(props.row)"
						/>
						<app-tooltip-button
							v-if="
								$userInfo.roleCode === 'SUPPORT' &&
								!props.row.additionalInformation.flagFixByScript
							"
							text="Reparar datos del proveedor"
							icon="construction"
							color="success"
							@click-icon="repairSupplier(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function onDelete(row) {
	this.$emit('on-delete', row);
}

function onPage(page) {
	this.$emit('on-page', page);
}

function onSearch(search) {
	this.$emit('on-search', search);
}

function openEdit(row) {
	this.$emit('open-edit', row);
}

function seeDetail(row) {
	this.$emit('see-detail', row);
}

function openDocument(row) {
	this.$emit('open-document', row);
}

export default {
	name: 'suppliers-list',
	components: {
		appTable,
	},
	props: {
		cleanSearch: {
			default: false,
			type: Boolean,
		},
		columns: {
			type: Array,
			default: () => [],
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		lastPage: {
			default: 1,
			type: Number,
		},
		rows: {
			type: Array,
			default: () => [],
		},
	},
	methods: {
		onDelete,
		onPage,
		onSearch,
		openEdit,
		seeDetail,
		openDocument,
		rowIsSelected(row) {
			this.$emit('row-is-select', row);
		},
		viewList(row) {
			this.$emit('view-list', row);
		},
		repairSupplier(row) {
			this.$emit('repair-supplier', row);
		},
	},
};
</script>
