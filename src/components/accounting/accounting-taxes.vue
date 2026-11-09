<template>
	<div>
		<header-page
			name="accounting-taxes"
			:title="$route.meta.title">
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-container class="accounting-taxes">
			<v-layout row d-flex justify-space-between>
				<v-flex xs5>
					<v-flex xs12 mb-4 class="title-section">
						<span>AGREGAR CUENTAS</span>
						<span class="products-selected">({{productsSelectedForTaxes}})</span>
					</v-flex>
					<v-flex xs12 d-flex align-center mb-4>
						<v-flex xs1>
							<v-checkbox
								color="primary"
								v-model="entry.flagActive"
								hide-details
								class="mr-2"></v-checkbox>
						</v-flex>
						<auto-complete
							:item-text="'name'"
							:label-value="'Ingreso'"
							:resource-url="'/users'"
							:http-code="'$httpAccount'"
							@return-data="setNewValueToObject($event, 'entry')"/>
					</v-flex>
					<v-flex xs12 d-flex align-center mb-4>
						<v-flex xs1>
							<v-checkbox
								v-model="active.flagActive"
								hide-details
								color="primary"
								class="mr-2"></v-checkbox>
						</v-flex>
						<auto-complete
							:item-text="'name'"
							:label-value="'Activo'"
							:resource-url="'/users'"
							:http-code="'$httpAccount'"
							@return-data="setNewValueToObject($event, 'active')"/>
					</v-flex>
					<v-flex xs12 d-flex align-center mb-4>
						<v-flex xs1>
							<v-checkbox
								v-model="inventory.flagActive"
								hide-details
								color="primary"
								class="mr-2"></v-checkbox>
						</v-flex>
						<auto-complete
							:item-text="'name'"
							:label-value="'Inventario'"
							:resource-url="'/users'"
							:http-code="'$httpAccount'"
							@return-data="setNewValueToObject($event, 'inventory')"/>
					</v-flex>
					<v-flex xs12 offset-xs1 mb-4>
						<v-flex xs5>
							<v-text-field
								type="number"
								class="filter-select shadow-inset"
								name="new-product-model"
								label="Stock mínimo"
								v-model.number="minStock"
							></v-text-field>
						</v-flex>
					</v-flex>
					<v-flex xs12 offset-xs1 d-flex>
						<v-flex xs2>
							<span>Seriado</span>
						</v-flex>
						<v-flex xs1>
							<v-checkbox
								color="primary"
								v-model="serie"
								hide-details
								class="mr-2"></v-checkbox>
						</v-flex>
					</v-flex>
				</v-flex>
				<v-flex xs5>
					<v-flex xs12 mb-4 class="title-section">
						<span>IMPUESTOS</span>
					</v-flex>
					<v-flex xs12 d-flex mb-4>
						<v-flex xs5>
							<span class="label">Imp. al valor agregado:</span>
						</v-flex>
						<v-flex xs3>
							<v-text-field
								class="filter-select shadow-inset"
								name="new-product-model"
								label="Porcentaje"
								v-model.number="iva.value"
							></v-text-field>
						</v-flex>
					</v-flex>
					<v-flex xs12 d-flex mb-4>
						<v-flex xs5>
							<span class="label">Imp. a los consumos esp.:</span>
						</v-flex>
						<v-flex xs3 mr-2>
							<v-text-field
								class="filter-select shadow-inset"
								name="new-product-model"
								label="Porcentaje"
								v-model.number="consume.value"
							></v-text-field>
						</v-flex>
						<v-flex xs2>
							<span>%</span>
						</v-flex>
					</v-flex>
					<v-flex xs12 d-flex>
						<v-flex xs7>
							<span class="label">Imp. a las boletas plásticas no retornables:</span>
						</v-flex>
						<v-flex xs1 mr-2>
							<v-checkbox
								v-model="plasticTicket"
								hide-details
								color="primary"
								class="mr-2"></v-checkbox>
						</v-flex>
					</v-flex>
				</v-flex>
			</v-layout>
			<v-layout row wrap justify-center align-center>
				<v-flex xs12 text-xs-center>
					<v-btn
						type="button"
						color="pink"
						class="btn-action"
						@click="cancel"
						:disabled="isLoading">
						Cancelar
						<v-icon
							color="white"
							size="16">
							highlight_off
						</v-icon>
					</v-btn>
					<v-btn
						:disabled="$v.$invalid"
						type="button"
						color="success"
						class="btn-action"
						@click="saveTaxes">
						Aceptar
						<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
					</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<help-action
				v-if="action.code === 'HELP'"
				:items="helpItems"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import { required, numeric, minValue, minLength } from 'vuelidate/lib/validators';
import appActions from '@/components/shared/app-actions';
import actionSidebar from './../shared/action-sidebar';
import autoComplete from './../shared/autocomplete/autocomplete-component';
import headerPage from './../shared/header-page';
import helpAction from './../shared/help-action';
import lib from './../../shared/lib';

const { buildMainObject } = lib;

function created() {
	if (this.productsSelected.length === 0) {
		this.showNotification('Debe seleccionar almenos un (1) producto', 'warning');
	}
}

function cancel() {
	this.goTo('accounting');
}

function closeModal() {
	this.action.code = '';
	this.action.open = false;
}

function openHelp({ code, actions }) {
	this.helpItems = [...actions];
	this.action.code = code;
	this.action.open = true;
}

function runAction(item) {
	this.goTo(item.codeWeb);
}

function setNewValueToObject(val, object) {
	this[object].id = val.id;
	this[object].value = val.name;
}

function buildBody(entry, inventory, active, minStock, iva, consume, serial) {
	return {
		accounts: buildMainObject(entry, inventory, active)('id', 'value', 'flagActive'),
		taxes: buildMainObject(iva, consume)('id', 'value'),
		minStock,
		serial,
	};
}
async function saveTaxes() {
	this.isLoading = true;
	const body = this.buildBody(
		this.entry,
		this.inventory,
		this.active,
		this.minStock,
		this.iva,
		this.consume,
		this.serie,
	);
	const requests
		= this.dataSelected.map(d => this.$httpProducts.patch(`products/${d.id}/taxes`, body));
	try {
		await Promise.all(requests);
		this.goTo('accounting');
	} catch (error) {
		this.showGenericError();
	}
	this.isLoading = false;
}

function productsSelectedForTaxes() {
	const quantity = this.productsSelected.length;
	let message = `${quantity} productos seleccionados`;
	if (quantity === 0) {
		message = 'ningún producto seleccionado';
	} else if (quantity === 1) {
		message = `${quantity} producto seleccionado`;
	}
	return message;
}

function validations() {
	return {
		consume: {
			value: { required, numeric, minValue: minValue(1) },
		},
		iva: {
			value: { required, numeric, minValue: minValue(1) },
		},
		minStock: { numeric },
		productsSelected: { required, minLength: minLength(1) },
	};
}

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: '',
			width: 553,
		},
		active: {
			id: null,
			flagActive: false,
			value: '',
		},
		consume: {
			id: 2,
			value: 0,
		},
		dataSelected: [...this.productsSelected],
		entry: {
			id: null,
			flagActive: false,
			value: '',
		},
		inventory: {
			id: null,
			flagActive: false,
			value: '',
		},
		isLoading: false,
		iva: {
			id: 1,
			value: 0,
		},
		minStock: 0,
		plasticTicket: false,
		serie: false,
	};
}

export default {
	name: 'accounting-taxes',
	components: {
		actionSidebar,
		appActions,
		autoComplete,
		headerPage,
		helpAction,
	},
	computed: {
		productsSelectedForTaxes,
	},
	created,
	data,
	methods: {
		buildBody,
		cancel,
		closeModal,
		openHelp,
		runAction,
		saveTaxes,
		setNewValueToObject,
	},
	props: {
		productsSelected: {
			type: Array,
			default: () => [],
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.accounting-taxes {
	display: flex;
	flex-direction: column;
	height: 83vh;
}
.label {
	font-size: size(medium);
}
.products-selected {
	color: color(subheaderText);
}
</style>
