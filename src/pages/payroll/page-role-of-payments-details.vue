<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="role-of-payments-details"
		/>
		<v-layout wrap row>
			<v-flex xs5>
				<app-table
					class="mt-4"
					name="list-employees"
					:columns="columns"
					:rows="rows"
					:last-page="lastPage"
					:current-page="currentPage"
					@on-search-event="search"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">{{props.row.code}}</td>
						<td v-show="showRow(columns, 2)">{{props.row.name}}</td>
						<td v-show="showRow(columns, 3)">
							<v-tooltip top>
								<v-btn
									slot="activator"
									icon
									@click="goToDetail(props.row.id)"
								>
									<v-icon color="success">visibility</v-icon>
								</v-btn>
								<span>Detalle</span>
							</v-tooltip>
						</td>
					</template>
				</app-table>
			</v-flex>
			<v-flex xs7>
				<detail-employee 
					:employee="employeeSelect"
					v-if="rows.length"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import detailEmployee from '@/components/payroll/detail-employee';
import helper from '@/shared/helper';
import { differenceInDays } from 'date-fns';

function data() {
	return {
		rows: [],
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Nombre de Empleado', visible: true, checked: true },
			{ id: 3, name: 'Acciones', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		employeeSelect: {},
		params: {
			search: null,
		},
		subsidiaries: [],
	};
}

function created() {
	this.loadSubsidiaries();
}

async function loadData() {
	try {
		const response = await this.$httpSales.get(`payroll-heading/${this.id}`, { params: this.params });
		this.rows = response.data.employees.map((r) => {
			const newEmployee = { ...r };
			newEmployee.dateEnd = helper.exactDate(response.data.dateEnd, 'YYYY-MM-DD');
			newEmployee.dateStart = helper.exactDate(response.data.dateStart, 'YYYY-MM-DD');
			newEmployee.subsidiary = this.subsidiaries.filter(s =>
				s.id === r.comSubsidiariesId)[0].sucursalName;
			newEmployee.dateStartFormat = this.monthLetters(newEmployee.dateStart);
			newEmployee.dateEndFormat = this.monthLetters(newEmployee.dateEnd);
			newEmployee.days = differenceInDays(newEmployee.dateEnd, newEmployee.dateStart);
			newEmployee.antiquity = newEmployee.controlDate ?
				helper.exactDate(newEmployee.controlDate.dateInput, 'YYYY-MM-DD') : null;
			newEmployee.antiquityFormat = newEmployee.antiquity ?
				this.monthLetters(newEmployee.antiquity) : null;
			return newEmployee;
		});
		this.employeeSelect = this.rows[0];
		if (!this.rows.length) {
			this.showNotification('No se ha asignado empleados al ítem', 'info');
		}
	} catch (error) {
		this.showGenericError('Error');
	}
}

function search(value) {
	const searchTrim = value ? value.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

async function loadSubsidiaries() {
	try {
		const { data: response } = await this.$httpSales.get('subsidiaries');
		this.subsidiaries = response;
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function goToDetail(id) {
	this.employeeSelect = this.rows.filter(r => r.id === id)[0];
}

function monthLetters(date) {
	const letters = date.split('-');
	const moths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	return `${letters[2]} de ${moths[letters[1] - 1]} del ${letters[0]}`;
}

export default {
	name: 'role-of-payments-details',
	components: {
		headerPage,
		appTable,
		detailEmployee,
	},
	data,
	created,
	methods: {
		loadData,
		loadSubsidiaries,
		search,
		goToDetail,
		monthLetters,
	},
	props: {
		id: [Number, String],
	},
};
</script>

