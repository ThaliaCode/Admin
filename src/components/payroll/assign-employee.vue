<template>
	<div>
		<v-layout mt-4>
			<v-flex xs12>
				<app-table
					name="assign-employee"
					:columns="columns"
					:rows="rows"
					:current-page="currentPage"
					:last-page="lastPage"
					@on-page="changePage"
					selectable
					:check-all="checkAll"
					@row-is-selected="rowIsSelected"
					@on-selected-all="selectedAll"
					dispatchDetail
					disabledValue="disabled"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" @click.stop="stopClick">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 2)" @click.stop="stopClick">{{ props.row.documentNumber }}</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!dataSelected.length"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="assignEmployee"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get(`payroll-heading/${this.data.id}/employees`, { params: this.params });
		this.rows = response.data.map((r) => {
			const newRow = { ...r };
			newRow.disabled = Number(r.isSeleted);
			return newRow;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	} finally {
		this.checkAll = this.rows.every(d => d.isSelected);
	}
}

function rowIsSelected(row) {
	if (!row.disabled) {
		({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selectedRows(row, this.rows, this.dataSelected));
	}
}

function selectedAll(value) {
	if (value) {
		({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selecteAll(value, this.rows, this.dataSelected));
	} else {
		this.checkAll = false;
		this.dataSelected = [];
		this.rows = this.rows.map((r) => {
			const newRow = { ...r };
			newRow.isSelected = !!r.disabled;
			return newRow;
		});
	}
}

async function assignEmployee() {
	this.dataSelected = this.dataSelected.filter(d => !d.disabled);
	const arrayEmployee = this.dataSelected.map((d) => {
		const newData = {
			id: d.id,
			isSelected: d.isSelected,
		};
		return newData;
	});
	const body = {
		payrollHeadingId: this.data.id,
		addEmployees: arrayEmployee,
		comSubsidiariesId: this.data.comSubsidiariesId,
	};
	try {
		await this.$httpSales.post('payroll-details', body);
		this.$emit('update');
		this.showNotification('La acción se realizó correctamente');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'PAYROLL_LOCKED_ERROR') {
				this.showGenericError('No se puede asignar empleados, el item está bloqueado');
			}
		} else {
			this.showGenericError('Error');
		}
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Número de Documento', visible: true, checked: true },
		],
		rows: [],
		currentPage: 1,
		lastPage: 1,
		dataSelected: [],
		params: {
			page: '',
		},
		checkAll: false,
	};
}

export default {
	name: 'assign-employee',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		changePage,
		loadData,
		rowIsSelected,
		selectedAll,
		assignEmployee,
	},
	props: {
		data: {
			type: [Object, Array],
			default: () => {},
		},
	},
};
</script>

