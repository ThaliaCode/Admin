<template>
	<div>
		<header-page :title="$route.meta.title" />
		<v-layout mt-5 px-5 justify-space-between>
			<v-flex xs5>
				<v-text-field
					type="text"
					class="filter-select"
					label="Código"
					v-model="model.code"
				></v-text-field>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs5>
				<v-text-field
					type="text"
					class="filter-select"
					label="Nombre"
					v-model="model.name"
				></v-text-field>
					<span class="form-group__message" v-if="!$v.model.name.required">
						El nombre es requerido
					</span>
			</v-flex>
		</v-layout>
		<v-layout px-5 mb-3>
			<v-flex xs12 mt-5 class="title-section">
				<span>Tipo de Movimiento</span>
			</v-flex>
		</v-layout>
		<v-layout px-5>
			<v-flex xs6>
				<p class="title-table px-4">Entradas</p>
				<app-table
					selectable
					:columns="columnsIn"
					:rows="dataIn"
					:input-search="false"
					:filter-columns="false"
					:check-all="checkAllIn"
					@row-is-selected="rowIsSelected($event, 'In')"
					@on-selected-all="selectedAll($event, 'In')"
				>
					<template slot="rows" slot-scope="props" class="is-not-selectable">
						<td v-show="showRow(columnsIn, 1)" class="is-not-selectable">{{ props.row.code }}</td>
						<td v-show="showRow(columnsIn, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columnsIn, 3)">
							<span class="text--info bold">{{ props.row.flagAvgCost ? 'SI' : 'NO' }}</span>
						</td>
						<td v-show="showRow(columnsIn, 4)">
							<span class="bold">{{ props.row.flagApplyCostAvg ? 'SI' : 'NO' }}</span>
						</td>
					</template>
				</app-table>
			</v-flex>
			<v-flex xs6>
				<p class="title-table px-4">Salidas</p>
				<app-table
					:columns="columns"
					:rows="dataOut"
					:input-search="false"
					:filter-columns="false"
					selectable
					@row-is-selected="rowIsSelected($event,'Out')"
					@on-selected-all="selectedAll($event, 'Out')"
					:check-all="checkAllOut"
				>
					<template slot="rows" slot-scope="props" class="is-not-selectable">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)">
							<span class="text--info bold">{{ props.row.flagAvgCost ? 'SI' : 'NO' }}</span>
						</td>
						<td v-show="showRow(columns, 4)">
							<span class="bold">{{ props.row.flagApplyCostAvg ? 'SI' : 'NO' }}</span>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center align-center mb-5>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="pink"
					class="btn-action mr-1"
					@click="cancelNewGroup"
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
					:disabled="$v.$invalid || checkBlankCode(model.code)"
					@click="createNewGroup"
				>
					Aceptar
					<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadData();
}

async function loadData() {
	let requests = [
		this.$httpProducts.get('type-documents?typeOperation=1'),
		this.$httpProducts.get('type-documents?typeOperation=0'),
	];
	if (this.id) {
		requests = requests.concat(this.$httpProducts.get(`groups/${this.id}`));
	}
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.dataIn },
			{ data: this.dataOut },
		] = responses;
		if (this.id) {
			[, , { data: this.model }] = responses;
			this.checkSelects('In');
			this.checkSelects('Out');
		}
	} catch (error) {
		this.showGenericError();
	}
}

function rowIsSelected(row, flag) {
	({ products: this[`data${flag}`], productsSelected: this.model[`type${flag}`], checkAll: this[`checkAll${flag}`] }
	= this.selectedRows(row, this[`data${flag}`], this.model[`type${flag}`]));
}

function selectedAll(value, flag) {
	({ products: this[`data${flag}`], productsSelected: this.model[`type${flag}`], checkAll: this[`checkAll${flag}`] }
	= this.selecteAll(value, this[`data${flag}`], this.model[`type${flag}`]));
}

function validations() {
	const minTypeIt = value => value.length >= 1;
	const minTypeOut = value => value.length >= 1;
	return {
		model: {
			name: { required },
			typeIn: { minTypeIt },
			typeOut: { minTypeOut },
		},
	};
}

async function createNewGroup() {
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `groups/${this.id}` : 'groups';
	const body = {
		name: this.model.name,
		code: this.model.code.toString(),
		typeIn: this.model.typeIn.map(t => t.id),
		typeOut: this.model.typeOut.map(t => t.id),
	};
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification('El grupo se cerró correctamente');
		this.goTo('group-inventory');
	} catch (error) {
		this.showGenericError('Error');
	}
}

function cancelNewGroup() {
	this.goTo('group-inventory');
}

function checkSelects(flag) {
	this[`data${flag}`] = this[`data${flag}`].map((d) => {
		const newDataIn = { ...d };
		newDataIn.isSelected = this.model[`type${flag}`].findIndex(m => m.id === d.id) > -1;
		return newDataIn;
	});
	this[`checkAll${flag}`] = this[`data${flag}`].every(d => d.isSelected);
}

function data() {
	return {
		model: {
			code: null,
			name: null,
			typeIn: [],
			typeOut: [],
		},
		dataIn: [],
		dataOut: [],
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Recal', value: 'recalculate', visible: true, checked: true },
			{ id: 4, name: 'Activo', value: 'active', visible: true, checked: true },
		],
		columnsIn: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Recal', value: 'recalculate', visible: true, checked: true },
			{ id: 4, name: 'Activo', value: 'active', visible: true, checked: true },
		],
		checkAllIn: false,
		checkAllOut: false,
		group: {},
	};
}
export default {
	name: 'page-new-group',
	components: {
		appTable,
		headerPage,
	},
	created,
	data,
	methods: {
		cancelNewGroup,
		createNewGroup,
		loadData,
		rowIsSelected,
		selectedAll,
		checkSelects,
	},
	props: {
		id: {
			type: [String, Number],
			default: null,
		},
	},
	validations,
};
</script>
<style lang="scss" scoped>
	.title-section {
		width: 100%;
	}

	.title-table {
		color: map-get($colors, accent);
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;
	}

	.text--info {
		color: map-get($colors, primary);
	}

	.bold {
		font-weight: bold;
	}
</style>
