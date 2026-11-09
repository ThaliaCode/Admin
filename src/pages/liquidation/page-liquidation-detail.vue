<template>
	<div>
		<header-page
			name="liquidation-detail"
			:number-bill="detailName"
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			@clean-product-filter="clearFilter"
		></header-page>
		<general-filter>
			<v-layout mt-2 mb-3>
				<v-flex xs2 pr-3>
					<label class="caption">Vendedor</label>
					<v-select
						v-model="params.employeeId"
						:items="vendors"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					>
					</v-select>
				</v-flex>
				<v-flex xs2>
					<label class="caption">Estado</label>
					<v-select
						v-model="params.status"
						:items="status"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
					>
					</v-select>
				</v-flex>
				<v-flex mt-3 ml-5>
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						@click="searchParams"
					>
						Buscar
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="inventories-list-master"
				:columns="columns"
				selectable
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-quantity="totalItemsVisible"
				:items-total-quantity="totalItems"
				:check-all="checkAll"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.totalSales }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.baseSalary }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.totalEarnedComission }}
					</td>
					<td v-show="showRow(columns, 5)">{{ props.row.totalLiquidate }}</td>
					<td v-show="showRow(columns, 6)">
						<document-state
							:color="getColor(props.row.status)"
							icon="radio_button_checked"
							:tooltip="getTooltip(props.row.status)"
						/>
					</td>
					<td v-show="showRow(columns, 7)">
						<app-tooltip-button
							class="mr-2"
							icon="remove_red_eye"
							text="Ver detalle liquidación"
							color="primary"
							height="20"
							@click-icon="viewDetailVendor(props.row)"
						/>
						<app-tooltip-button
							class="mr-2"
							text="Cerrar liquidación"
							height="20"
							:disabled="props.row.status === 3"
							color="pink"
							icon="highlight_off"
							@click-icon="modalCloseLiquidation(props.row)"
						></app-tooltip-button>
						<!-- <app-tooltip-button
							class="mr-2"
							height="20"
							icon="cloud_download"
							color="primary"
							text="Descargar liquidación"
						></app-tooltip-button> -->
					</td>
				</template>
			</app-table>
		</div>
		<template>
			<simple-modal
				:open="showModalLiquidation"
				@close="modalCloseLiquidation"
				textCancel="Cancelar"
				@cancel="modalCloseLiquidation"
				textConfirm="Aceptar"
				@confirm="updateStatus"
			>
				<span slot="title">
					<div class="icon-text-container">
						<v-icon class="icon-error" color="success">error</v-icon>
						<span class="title--alert"
							>¿Esta seguro que desea cerrar la liquidación?</span
						>
					</div>
				</span>
				<span slot="subtitle" class="subtitle--alert">
					Al cerrar esta liquidación ninguna otra venta se contabilizará dentro
					de ella.
				</span>
			</simple-modal>
		</template>
	</div>
</template>

<script>
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import simpleModal from '@/components/field-sale/shared/simple-modal';

function data() {
	return {
		data: [],
		columns: [
			{ id: 1, name: 'Vendedor', visible: true, checked: true },
			{ id: 2, name: 'Venta Total', visible: true, checked: true },
			{ id: 3, name: 'Sueldo Base', visible: true, checked: true },
			{ id: 4, name: 'Comisión Total de Ventas', visible: true, checked: true },
			{ id: 5, name: 'Total de liquidación', visible: true, checked: true },
			{ id: 6, name: 'Estado', visible: true, checked: true },
			{ id: 7, name: 'Acciones', visible: true, checked: true },
		],
		lastPage: 0,
		totalItems: 0,
		totalItemsVisible: 0,
		currentPage: 1,
		checkAll: false,
		detailName: '',
		showModalLiquidation: false,
		params: {
			status: null,
			employeeId: null,
		},
		idLiquidation: null,
		row: null,
		status: [
			{
				name: 'Inactiva',
				id: 0,
				color: '#000000',
			},
			{
				name: 'Pendiente',
				id: 1,
				color: 'baseText',
			},
			{
				name: 'Iniciada',
				id: 2,
				color: 'success',
			},
			{
				name: 'Cerrada',
				id: 3,
				color: 'pink',
			},
		],
		vendors: [],
	};
}

async function loadData() {
	const { data: obj } = await this.$httpSettlement.get(
		`/settlements/${this.id}`
	);
	({ data: this.vendors } = await this.$httpSales.get('employees'));
	this.idLiquidation = obj.id;
	this.detailName = ` - ${obj.name}`;
	this.data = obj.employees.map((obj2) => {
		const matchedObj = this.vendors.find((obj1) => obj1.id === obj2.employeeId);
		return matchedObj ? { ...obj2, name: matchedObj.fullname } : obj2;
	});
}

export default {
	name: 'liquidation-detail',
	created() {
		this.loadData();
	},
	data,
	components: {
		headerPage,
		generalFilter,
		appTable,
		documentState,
		simpleModal,
	},
	methods: {
		loadData,
		async searchParams() {
			try {
				const { data: obj } = await this.$httpSettlement.get(
					`/settlements/${this.idLiquidation}/employees`,
					{ params: this.params }
				);
				this.data = obj.settlementEmployee.map((obj2) => {
					const matchedObj = this.vendors.find(
						(obj1) => obj1.id === obj2.employeeId
					);
					return matchedObj ? { ...obj2, name: matchedObj.fullname } : obj2;
				});
			} catch (err) {
				this.showGenericError();
			}
		},
		modalCloseLiquidation(row) {
			if (row) {
				this.row = row;
			}
			this.showModalLiquidation = !this.showModalLiquidation;
		},
		async updateStatus() {
			const body = {
				status: 3,
				employeeId: this.row.employeeId,
			};
			try {
				await this.$httpSettlement.post(
					`/settlements/${this.idLiquidation}/update-employee-status`,
					body
				);
				this.modalCloseLiquidation();
				this.loadData();
			} catch (err) {
				this.showGenericError();
			}
		},
		viewDetailVendor({ id }) {
			this.goTo('liquidation-detail-vendor', { params: { id } });
		},
		getColor(id) {
			const statusItem = this.status.find((item) => item.id === id);
			return statusItem ? statusItem.color : null;
		},
		getTooltip(id) {
			const statusItem = this.status.find((item) => item.id === id);
			return statusItem ? statusItem.name : null;
		},
		clearFilter() {
			this.params = {
				status: null,
				employeeId: null,
			};
			this.loadData();
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.icon-text-container {
	display: flex;
	flex-direction: column;
	align-items: center;

	.icon-error {
		font-size: 80px;
	}
}

.title--alert {
	color: #31656e;
	font-size: 27px;
	margin-top: 10px;
	font-weight: bolder;
}

.subtitle--alert {
	color: color(primary);
	font-size: 16px;
}
</style>
