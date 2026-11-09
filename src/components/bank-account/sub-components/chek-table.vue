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
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ row.number }}</td>
					<td v-show="showRow(columns, 2)">{{ row.personName }}</td>
					<td v-show="showRow(columns, 3)">{{ row.personDocument }}</td>
					<td v-show="showRow(columns, 4)">{{ row.documentNumber }}</td>
					<td v-show="showRow(columns, 5)">
						<div class="check-image">
							<img v-if="row.urlImage" :src="row.urlImage" alt="imagen cheque">
							<small v-else>--</small>
						</div>
					</td>
					<td v-show="showRow(columns, 6)">{{countryCurrencySymbol}} {{ row.amount }}</td>
					<td v-show="showRow(columns, 7)" class="check-state">{{ getPropValue(row, 'status.name') }}</td>
					<td v-show="showRow(columns, 8)">
						<app-tooltip-button
							text="Editar"
							icon="edit"
							color="success"
							@click-icon="openEditCheck(row)"
						/>
						<app-tooltip-button
							text="Eliminar"
							icon="close"
							color="error"
							@click-icon="openConfirmDelete(row)"
						/>
					</td>
			</template>
		</app-table>
		<v-dialog v-model="toogleModal" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">¿Esta seguro que desea <b>ELIMINAR</b> este cheque?:</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h4 class="text-xs-center">Cheque:</h4>
						<h3 class="text-xs-center">{{currentCheck.number}} ({{currentCheck.description}})</h3>
					</v-layout>
				</v-card-text>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center">Esta acción eliminará el cheque y no se podrá deshacer</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							color="pink"
							class="btn-action mr-1"
							@click="toogleModal = false"
						>
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
							class="btn-action ml-1"
							@click="removeCheck"
						>
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

function openEditCheck(check) {
	this.$emit('edit-check', check);
}

function openConfirmDelete(check) {
	this.currentCheck = check;
	this.toogleModal = true;
}

function getPropValue(check, props) {
	return lib.getNewDeeper(props)(check);
}

async function removeCheck() {
	const id = this.currentCheck.id;
	await this.$httpSales.delete(`check/${id}`);
	this.showNotification(
		`Cheque número ${this.currentCheck.number} eliminado exitosamente`);
	this.toogleModal = false;
	this.$emit('re-load');
}

function data() {
	return {
		currentCheck: {},
		toogleModal: false,
	};
}

export default {
	name: 'check-book-table',
	components: {
		appTable,
	},
	data,
	methods: {
		getPropValue,
		openConfirmDelete,
		openEditCheck,
		removeCheck,
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
	.check-image {
		height: 23px;
		margin: auto;
		width: 58px;

		img {
			height: 100%;
			object-fit: fill;
			width: 100%;
		}
	}	
</style>

