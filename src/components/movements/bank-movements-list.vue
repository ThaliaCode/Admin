<template>
	<div class="layout wrap align-start justify-center">
		<v-flex :class="toShow ? 'xs7 active' : 'xs12'">
			<app-table
				name="bank-movements"
				class="is-not-selectable"
				:clean-search="cleanSearch"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				:items-quantity="rows.length"
				:items-total-quantity="totalQuantity"
				@on-page="$emit('on-page', $event)"
				@on-search-event="$emit('on-search', $event)"
				@on-column-sortable="$emit('column-sortable', $event)"
			>
				<template slot="rows" slot-scope="props">
					<td
						v-show="showRow(columns, 1)"
						class="is-not-selectable"
						:class="getClassCell(props.row)"
					>
						{{ props.row.bankAccount.accountNumber }}
					</td>
					<td v-show="showRow(columns, 2)" :class="getClassCell(props.row)">
						{{ props.row.createdAt | formatDate }}
					</td>
					<td v-show="showRow(columns, 3)" :class="getClassCell(props.row)">
						{{ props.row.paymentDate | formatPaymentDate }}
					</td>
					<td v-show="showRow(columns, 4)" :class="getClassCell(props.row)">
						{{ props.row.moduleOrigin ? props.row.moduleOrigin.name : null }}
					</td>
					<td v-show="showRow(columns, 5)" :class="getClassCell(props.row)">
						{{ props.row.typePayment ? props.row.typePayment.name : null }}
					</td>
					<td v-show="showRow(columns, 6)" :class="getClassCell(props.row)">
						{{ props.row.cashName }}
					</td>
					<td v-show="showRow(columns, 7)" :class="getClassCell(props.row)">
						{{
							props.row.typeTransactionBank ? props.row.typeTransactionBank.name : null
						}}
					</td>
					<td v-show="showRow(columns, 8)" :class="getClassCell(props.row)">
						{{ getAnnexNameByDetail(props.row) }}
					</td>
					<td v-show="showRow(columns, 9)" :class="getClassCell(props.row)">
						{{ props.row.documentNumber || '-' }}
					</td>
					<td v-show="showRow(columns, 10)" :class="getClassCell(props.row)">
						{{ props.row.currencySymbol }} {{ props.row.amount | round }}
					</td>
					<td v-show="showRow(columns, 11)" :class="getClassCell(props.row)">
						{{ props.row.concept }}
					</td>
					<td v-show="showRow(columns, 12)" v-if="showEntity">
						<v-tooltip top>
							<span
								:style="
									props.row.entityStateId === 4
										? 'background-color: #2abca4'
										: 'background-color: #f40029'
								"
								slot="activator"
								class="state-entity"
							>
								{{ props.row.entityStateId === 4 ? 'C' : 'SC' }}
							</span>
							<span>{{
								props.row.entityStateId === 4 ? 'Contabilizado' : 'Sin Contabilizado'
							}}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 13)" :class="getClassCell(props.row)">
						{{ getBeneficiary(props.row) }}
					</td>
					<td v-show="showRow(columns, 14)">
						<v-tooltip top>
							<span class="text-reconcilement" slot="activator">{{
								props.row.flagReconcilement === 1 ? 'SC' : 'C'
							}}</span>
							<span>{{
								props.row.flagReconcilement === 1 ? 'Sin conciliación' : 'Conciliado'
							}}</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 15)">
						<v-layout wrap>
							<v-flex xs4>
								<app-tooltip-button
									:icon="props.row.iconArrow"
									text="Ver Detalle En Tabla"
									color="success"
									size="20"
									@click-icon="detailBank(props.row)"
								/>
							</v-flex>
							<v-flex xs4>
								<app-tooltip-button
									v-if="getUrlLink(props.row)"
									color="success"
									icon="insert_drive_file"
									text="Ver Voucher"
									class="ml-2"
									@click-icon="$emit('show-voucher', props.row)"
								/>
							</v-flex>
							<v-flex xs4>
								<app-tooltip-button
									v-if="props.row.allowDelete"
									color="error"
									icon="delete"
									text="Eliminar"
									class="ml-2"
									@click-icon="deleteRow(props.row)"
								/>
							</v-flex>
						</v-layout>
					</td>
				</template>
			</app-table>
		</v-flex>
		<transition name="fade-left" mode="out-in">
			<v-flex xs5 :class="{ active: toShow }" v-show="toShow">
				<bank-detail
					v-if="toShow"
					:modules="modules"
					:data="detail"
					:type-payments="typePayments"
					:type-movement="typeMovement"
					:transactions="transactions"
					@update="update"
					@close="close"
					@show-detail="showDetail"
				/>
			</v-flex>
		</transition>
	</div>
</template>

<script>
import { format } from 'date-fns';
import accountingSeatDetail from '@/components/sales/accounting-seat-detail';
import appTable from '@/components/shared/table/app-table';
import bankDetail from '@/components/movements/bank-details';
import documentState from '@/components/shared/document-state';
import lib from '@/shared/lib';

function onPage(page) {
	this.$emit('on-page', page);
}

function onSearch(search) {
	this.$emit('on-search', search);
}

async function detailBank({ id }) {
	if (this.detail.id === id) {
		this.detail = {};
	} else {
		try {
			({ data: this.detail } = await this.$httpSales.get(`transaction-bank/${id}`));
			this.detail.paymentDate = format(this.detail.paymentDate, 'YYYY-MM-DD');
			this.detail.dateBankReconcilement = this.detail.bankReconcilement
				? format(this.detail.bankReconcilement.date, 'YYYY-MM-DD')
				: null;
			this.detail.additionalInformation = this.detail.additionalInformation || {};
		} catch (error) {
			this.showGenericError();
		}
	}
	this.toShow = !!this.detail.id;
	this.$emit('update-rows', { id, show: this.toShow });
}

function update() {
	this.toShow = false;
	this.$emit('update');
}

function deleteRow(item) {
	this.toShow = false;
	this.$emit('delete', item);
}

function close() {
	this.toShow = false;
}

function showDetail(acco) {
	this.$emit('show-accounting', acco);
}

function getBeneficiary(bank) {
	return lib.getDeeper('additionalInformation', 'beneficiary')(bank) || '-';
}

function data() {
	return {
		toShow: false,
		selectedId: null,
		detail: {},
		rowSelected: {},
	};
}

export default {
	name: 'bank-movements-list',
	components: {
		accountingSeatDetail,
		appTable,
		bankDetail,
		documentState,
	},
	data,
	methods: {
		close,
		detailBank,
		deleteRow,
		getBeneficiary,
		onPage,
		onSearch,
		showDetail,
		update,
		getClassCell(row = {}) {
			return row.amount < 0 || row.typeMovement === 2 ? 'paint-red-row' : 'xs10';
		},
		getAnnexNameByDetail(row) {
			if (!row) return null;
			return row.annexTransaction && row.annexTransaction.name;
		},
		getUrlLink(row) {
			if (row.urlImage) return row.urlImage;
			return row?.accTransactionEvent?.voucher?.urlLink || null;
		},
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
		modules: {
			type: Array,
			default: () => [],
		},
		typePayments: {
			type: Array,
			default: () => {},
		},
		typeMovement: {
			type: Array,
			default: () => [],
		},
		transactions: {
			type: Array,
			default: () => [],
		},
		showEntity: {
			type: Boolean,
			default: false,
		},
		totalQuantity: {
			default: 1,
			type: Number,
		},
	},
};
</script>
<style lang="scss" scoped>
.table-and-details {
	align-items: flex-start;
	display: flex;
	justify-items: center;
}

.paint-red-row {
	color: color(error) !important;
	font-weight: bold;
}

.item-table {
	flex: 1 1 100%;
}

.item-table.active,
.item-details.active {
	flex: 1 1 50%;
}

.text-reconcilement {
	color: #767676;
	font-family: map-get($fonts, open-bold);
}

.state-entity {
	border-radius: 4px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	padding: 3px 6px;
}
</style>
