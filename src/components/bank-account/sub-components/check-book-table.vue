<template>
	<div>
		<app-table
			include-filter
			name="checkBookTable"
			:clean-search="isClean"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="{ row }">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ row.numberStart }}</td>
					<td v-show="showRow(columns, 2)">{{ row.numberEnd }}</td>
					<td v-show="showRow(columns, 3)">{{countryCurrencySymbol}} {{row.amount || 0}}</td>
					<td v-show="showRow(columns, 4)">
						<v-layout row align-center justify-space-around>
							<v-flex xs1>
								<v-switch
									hide-details
									class="active-checkbook"
									color="success"
								></v-switch>
							</v-flex>
							<app-tooltip-button
								text="Editar"
								icon="edit"
								color="success"
								@click-icon="openEditCheckBook(row)"
							/>
							<app-tooltip-button
								icon="remove_red_eye"
								text="Ver Detalle"
								color="primary"
								size="16"
								@click-icon="checkBookDetails(row)"
							/>
							<app-tooltip-button
								text="Eliminar"
								icon="close"
								color="error"
								@click-icon="openConfirmDelete(row)"
							/>
						</v-layout>
					</td>
			</template>
		</app-table>
		<v-dialog v-model="removeCheckBook" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">¿Esta seguro que desea <b>ELIMINAR</b> esta chequera?:</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h4 class="text-xs-center">Chequera:</h4>
						<h3 class="text-xs-center">{{currentCheckBook.description}}</h3>
					</v-layout>
				</v-card-text>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center">Esta acción eliminará la chequera y no se podrá deshacer</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							@click="removeCheckBook = false"
							color="pink"
							class="btn-action mr-1">
							Cancelar
							<v-icon
								color="white"
								size="16">
								highlight_off
							</v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="success"
							@click="removeIt"
							class="btn-action ml-1">
							Aceptar
							<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import productsMixin from '@/mixins/products-mixins';
import lib from '@/shared/lib';

const { compose, setNewProperty } = lib;

function openEditCheckBook(row) {
	this.$emit('check-book-selected', row);
}

function openConfirmDelete(row) {
	this.removeCheckBook = true;
	this.currentCheckBook = row;
}

async function removeIt() {
	const url = `check-series/${this.currentCheckBook.id}`;
	const body = this.buildBody(this.currentCheckBook);
	try {
		await this.$httpSales.delete(url, body);
		this.showNotification('Chequera eliminada con éxito');
		this.removeCheckBook = false;
		this.$emit('load-check-book-list');
	} catch (error) {
		this.showGenericError(error);
	}
}

function buildBody(ckb) {
	const { serieStart, serieEnd, numberStart, numberEnd, description, bankAccountId } = ckb;
	return compose(
		setNewProperty('serieStart', serieStart),
		setNewProperty('serieEnd', serieEnd),
		setNewProperty('numberStart', numberStart),
		setNewProperty('numberEnd', numberEnd),
		setNewProperty('description', description),
		setNewProperty('bankAccountId', bankAccountId),
	)({});
}

function checkBookDetails(row) {
	const { id: checkBookId, bankAccountId: bankId } = row;
	this.$router.push({ name: 'check', params: { bankId, checkBookId } });
}

function data() {
	return {
		currentCheckBook: {},
		removeCheckBook: false,
	};
}

export default {
	name: 'check-book-table',
	components: {
		appTable,
	},
	data,
	methods: {
		buildBody,
		checkBookDetails,
		openConfirmDelete,
		openEditCheckBook,
		removeIt,
	},
	mixins: [productsMixin],
	props: {
		columns: {
			default: () => [],
			type: Array,
		},
		rows: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
<style lang="scss" scoped>
	.action-column {
		width: 220px;
	}	
</style>

