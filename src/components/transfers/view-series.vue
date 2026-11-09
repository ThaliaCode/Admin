<template>
	<div>
		<v-flex mt-3>
			<span class="text-warning ml-4">{{ textAlert }}</span>
		</v-flex>
		<v-flex>
			<app-table
				class="is-not-selectable mt-3"
				name="view-series"
				:selectable="validateRoute || validateSelect || flag"
				:columns="columns"
				:check-all="checkAll"
				:check-all-disabled="checkAllDisabled"
				:input-search="false"
				:filter-columns="false"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				:items-quantity="rows.length"
				:items-total-quantity="itemsTotalQuantity"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-page="loadData"
				dispatch-detail
				disabled-value="disabled"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="pa-2 is-not-selectable">
						{{ props.row.serie }}
					</td>
					<td v-show="showRow(columns, 2)" class="pa-2">
						{{ props.row.comments || '-' }}
					</td>
					<td v-show="showRow(columns, 3)" class="pa-2">
						{{ props.row.observation || '-' }}
					</td>
					<td v-show="showRow(columns, 4)" class="pa-2 w-20">
						{{ props.row.quantity }}
					</td>
					<td v-show="showRow(columns, 5)" class="pa-2 w-20">
						{{ validateRoute ? props.row.warehouse.name : '' }}
					</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				cancelText="Atras"
				:is-loading="dataSelected.length === 0 || type === 6"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="sendSeries(dataSelected, product.productId)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appTable from '@/components/shared/table/app-table';
import helper from '@/shared/helper';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Serie', value: 'series', visible: true, checked: true },
			{
				id: 2,
				name: 'Comentario',
				value: 'comments',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Comentario 2',
				value: 'observation',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: `Und. medida ${this.product.unitName}`,
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Almacén',
				value: 'warehouse',
				visible: this.$route.name === 'new-discharge',
			},
		],
		rows: [],
		dataSelected: [],
		validateRoute: false,
		validateSelect: false,
		checkAll: false,
		sumSeries: 0,
		checkAllDisabled: false,
		itemsTotalQuantity: 0,
		lastPage: 0,
		currentPage: 1,
	};
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.validateRoute = this.$route.name === 'new-discharge';
	const params = {
		productId: this.product.productId,
		flagDispatch: false,
		search: this.search || undefined,
		warehousesId: this.product.warehouseId,
		page,
	};
	try {
		const response = await this.$httpProducts.get('/products-detail', {
			params,
		});
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		this.rows = response.data.map((row, index) => {
			const newRow = { ...row };
			newRow.number = index + 1;
			newRow.isSelected = false;
			newRow.dateFormat = helper.exactDate(row.date, 'DD/MM/YYYY');
			return newRow;
		});
		if (this.rows.length) {
			if (this.product.series) {
				this.selectAllExistent();
			} else {
				this.selectedAllValid();
			}
		} else if (!this.rows.length) {
			this.showNotification('El producto no tiene series registradas', 'info');
		}
	} catch (err) {
		this.showGenericError();
	}
}

function created() {
	if (this.$route.name === 'pages-transfers-detail' || this.flagReturn) {
		this.transferSeries();
	} else if (this.$route.name === 'convert' || this.flag) {
		this.convertSeries();
	} else if (this.$route.name === 'page-transfers-start') {
		this.transferStart();
	} else {
		this.loadData();
	}
}

function selectedAllValid() {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		newRow.isSelected = false;
		return newRow;
	});
}

function rowIsSelected({ number, isSelected, disabled }) {
	if (disabled) {
		this.rows = this.rows.map((row) => {
			const newRow = { ...row };
			if (row.number === number) {
				newRow.isSelected = true;
			}
			return newRow;
		});
	} else if (isSelected) {
		this.dataSelected.push(this.rows.find((row) => row.number === number));
	} else {
		const index = this.dataSelected.findIndex((row) => row.number === number);
		this.dataSelected.splice(index, 1);
		if (this.dataSelected.length < this.product.quantity) {
			this.checkAll = false;
		}
	}
}

function selectAllExistent() {
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		const flag = this.product.series.filter((r) => r.serie === row.serie);
		newRow.isSelected = !!flag.length;
		if (flag.length) {
			this.dataSelected.push(row);
		}
		return newRow;
	});
}

function selectedAll(isSelected) {
	this.checkAll = isSelected;
	if (isSelected) {
		this.selectedAllValid();
	} else {
		this.rows = this.rows.map((row) => {
			const newRow = { ...row };
			newRow.isSelected = false;
			return newRow;
		});
		this.dataSelected = [];
	}
}

export default {
	name: 'view-series',
	components: {
		appTable,
		modalSidebarButton,
	},
	data,
	created,
	props: {
		serie: {
			type: Object,
			default: () => {},
		},
		product: {
			type: Object,
			default: () => {},
		},
		type: {
			type: Number,
		},
		flag: {
			type: Boolean,
		},
		flagReturn: {
			type: Boolean,
		},
		textAlert: {
			type: String,
			default: '',
		},
	},
	methods: {
		loadData,
		selectAllExistent,
		selectedAllValid,
		selectedAll,
		rowIsSelected,
		transferSeries() {
			this.rows = this.serie.additionalInformation.series;
		},
		sendSeries(dataSelected, productId) {
			if (this.validateSelect || this.flag) {
				this.dataSelected = this.dataSelected.map((d) => {
					const newD = {
						id: d.id,
						comments: d.comments,
						observation: d.observation,
						quantity: d.quantity,
						serie: d.serie,
					};
					return newD;
				});
				this.sumSeries = this.dataSelected.reduce(
					(total, obj) => total + obj.quantity,
					0
				);
				this.$emit(
					'send-series',
					this.dataSelected,
					this.serie.product.id,
					this.sumSeries
				);
			} else {
				this.sumSeries = this.dataSelected.reduce(
					(total, obj) => total + obj.quantity,
					0
				);
				this.$emit('send-series', dataSelected, productId, this.sumSeries);
			}
		},
		convertSeries() {
			this.validateSelect = Boolean(
				this.$route.name === 'convert' && this.type
			);
			if (this.flag) {
				this.rows = this.serie.additionalInformation.series;
			} else {
				this.rows = this.serie.aditionalInformation.series;
			}
			this.rows = this.rows.map((row, index) => {
				const newRow = { ...row };
				newRow.number = index + 1;
				return newRow;
			});
			this.itemsTotalQuantity = this.rows.length;
			if (this.type === 6) {
				this.checkAll = true;
				this.checkAllDisabled = true;
				this.rows = this.rows.map((row) => {
					const newRow = { ...row };
					newRow.isSelected = true;
					newRow.disabled = 1;
					return newRow;
				});
				this.dataSelected = this.rows;
			} else if (this.product.series) {
				this.selectAllExistent();
			}
		},
		transferStart() {
			this.validateSelect = this.$route.name === 'page-transfers-start';
			this.rows = this.serie.additionalInformation.series;
			this.rows = this.rows.map((row, index) => {
				const newRow = { ...row };
				newRow.isSelected = false;
				newRow.number = index + 1;
				return newRow;
			});
			if (this.serie.seriesSend && this.serie.seriesSend.length) {
				this.rows = this.rows.map((row) => {
					const newRow = { ...row };
					const flag = this.serie.seriesSend.filter(
						(r) => r.serie === row.serie
					);
					newRow.isSelected = !!flag.length;
					if (flag.length) {
						this.dataSelected.push(row);
					}
					return newRow;
				});
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.text-warning {
	width: 100%;
	min-height: 1rem;
	font-size: 0.8rem;
	text-align: center;
	color: red;
}
</style>
