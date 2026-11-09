<template>
	<div class="cost-new">
		<v-layout row wrap px-4 justify-space-between py-2 mt-3>
			<v-flex xs6 mb-3 pr-1>
				<div class="d-flex flex-row align-center gap-2">
					<v-text-field
						label="Peso Mínimo"
						class="filter-select shadow-inset mr-1"
						v-model="model.from"
						type="number"
						suffix="kg"
					></v-text-field>
					<app-tooltip-button
						:height="16"
						icon="info"
						color="success"
						text="Recuerde que si no maneja peso en sus productos el peso minimo debe ser 0"
					></app-tooltip-button>
				</div>
				<span class="error-field" v-if="$v.model.from.$invalid">
					El peso mínimo es requerido.
				</span>
			</v-flex>
			<v-flex xs6 mb-3 pl-2>
				<v-text-field
					label="Peso Máximo"
					class="filter-select shadow-inset"
					v-model="model.to"
					type="number"
					suffix="Kg"
				></v-text-field>
				<span class="error-field" v-if="$v.model.to.$invalid">
					El peso máximo es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-2>
				<v-select
					label="Tipo de moneda"
					:items="currencies"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					class="filter-select shadow-inset"
					v-model="model.currency"
				></v-select>
				<span class="error-field" v-if="$v.model.currency.$invalid">
					El tipo de moneda es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					label="Precio (si impuesto)"
					class="filter-select shadow-inset mt-3"
					v-model="model.price"
					type="number"
				></v-text-field>
				<span class="error-field no-taxes" v-if="isEcuador">
					El precio no incluye impuesto.
				</span>
				<span class="error-field" v-if="$v.model.price.$invalid">
					El precio es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Departamento"
					:items="department"
					single-line
					item-text="name"
					item-value="id"
					bottom
					return-object
					hide-details
					:readonly="!!id"
					class="filter-select shadow-inset"
					v-model="model.provincesId"
				></v-select>
				<span class="error-field" v-if="$v.model.provincesId.$invalid">
					El departamento es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					chips
					class="filter-select shadow-inset"
					item-text="name"
					item-value="id"
					label="Provincia"
					multiple
					single-line
					return-object
					required
					:readonly="!!id"
					v-model="model.citiesId"
					:items="provinces"
				></v-select>
			</v-flex>
			<v-flex xs12>
				<v-select
					chips
					class="filter-select shadow-inset"
					item-text="name"
					item-value="id"
					label="Distrito"
					multiple
					return-object
					single-line
					required
					:readonly="!!id"
					v-model="model.parishesId"
					:items="districts"
				></v-select>
			</v-flex>
			<v-layout row wrap v-if="isEcuador">
				<v-flex xs12 mt-3>
					<v-checkbox
						color="success"
						hide-details
						label="Agregar impuesto"
						v-model="model.flagTax"
					></v-checkbox>
				</v-flex>
				<v-flex xs8 mt-3 v-if="model.flagTax">
					<v-select
						required
						single-line
						class="filter-select shadow-inset"
						label="Impuesto (%)"
						:items="taxesByCountry"
						v-model="model.tax"
					></v-select>
					<span class="error-field" v-if="$v.model.tax.$invalid">
						El impuesto debe ser un valor numérico.
					</span>
				</v-flex>
			</v-layout>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="!(!$v.model.$invalid && difference)"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="save"
			>
			</modal-sidebar-button>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required, requiredIf } from 'vuelidate/lib/validators';

function taxesByCountry() {
	return ['0', String(this.labelsByCountry.percentage)];
}

function data() {
	return {
		model: {
			citiesId: [],
			currency: null,
			flagTax: false,
			from: 0,
			parishesId: [],
			price: null,
			provincesId: null,
			tax: 0,
			taxAmount: 0,
			to: null,
		},
		provinces: [],
		districts: [],
		ubigeosProvinces: [],
	};
}

function created() {
	this.model.currency = this.labelsByCountry.currency;
	this.model.citiesId = [];
	if (this.id) {
		this.editCost();
	}
}

async function changeDepartament(value) {
	const service = this.id ? value : value.id;
	const { data: response } = await this.$httpSales.get(`cities/${service}`);
	this.provinces = response;
	this.districts = [];
	if (!this.id) {
		this.model.citiesId = [];
	}
	const newObject = {
		id: value.id,
		name: value.name,
	};
	this.ubigeosProvinces = [];
	this.ubigeosProvinces.push(newObject);
}

async function changeProvince(value) {
	if (!this.id) {
		this.model.parishesId = [];
	}
	if (value.length === 1) {
		const url = this.id ? value[0] : value[0].id;
		const { data: response } = await this.$httpSales.get(`parish/${url}`);
		this.districts = response;
	} else {
		this.districts = [];
	}
}

function validations() {
	return {
		model: {
			from: { required },
			to: { required },
			currency: { required },
			provincesId: { required },
			price: { required },
			tax: { required: requiredIf(() => this.model.flagTax) },
		},
	};
}

function buildBody() {
	this.model.taxAmount = this.taxAmountCalculated();
	return this.model;
}

function taxAmountCalculated() {
	this.model.taxAmount = 0;
	if (this.model.flagTax) {
		const { price, tax } = this.model;
		this.model.taxAmount = Number((price * (Number(tax) / 100)).toFixed(2));
	}
	return this.model.taxAmount;
}

async function save() {
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `weight/${this.id}` : 'weight';
	const message = this.id ? 'actualizó' : 'creó';
	let body = {};
	if (!this.id) {
		body = this.buildBody();
		let ubigeos = [];
		const ubigeoProvince = {
			id: this.model.provincesId.id,
			name: this.model.provincesId.name,
		};
		ubigeos.push(ubigeoProvince);
		if (this.model.citiesId.length) {
			const ubigeosCities = this.model.citiesId.map((c) => {
				const newU = {
					id: c.id,
					name: c.name,
				};
				return newU;
			});
			ubigeos = ubigeos.concat(ubigeosCities);
		}
		if (this.model.parishesId.length) {
			const ubigeosParishes = this.model.parishesId.map((p) => {
				const newP = {
					id: p.id,
					name: p.name,
				};
				return newP;
			});
			ubigeos = ubigeos.concat(ubigeosParishes);
		}
		body.provincesId = [this.model.provincesId.id];
		body.ubigeos = ubigeos;
		body.citiesId = this.model.citiesId.map((c) => c.id);
		body.parishesId = this.model.parishesId.map((p) => p.id);
	} else {
		body = {
			currency: this.model.currency,
			flagTax: this.model.flagTax,
			from: this.model.from,
			tax: Number(this.model.tax),
			taxAmount: this.taxAmountCalculated(),
			to: this.model.to,
			price: this.model.price,
		};
	}
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`Se ${message} correctamente`);
		this.$emit('update');
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'INVALID_RANK') {
				this.showNotification(
					'El rango de peso ya esta establecido para esta ubicación',
					'error'
				);
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function editCost() {
	try {
		const { data: response } = await this.$httpProducts.get(
			`weight/${this.id}`
		);
		this.model.from = response.from;
		this.model.to = response.to;
		this.model.currency = response.currency;
		this.model.price = response.price;
		this.model.provincesId = response.provinceId;
		this.model.citiesId = [response.cityId];
		this.model.parishesId = [response.parishId];
		this.model.flagTax = !!response.flagTax;
		this.model.tax = String(response.tax) || 0;
	} catch (error) {
		this.showGenericError();
	}
}

function difference() {
	return Number(this.model.to) - Number(this.model.from) > 0;
}

export default {
	data,
	name: 'cost-new',
	components: {
		modalSidebarButton,
	},
	created,
	computed: {
		difference,
		taxesByCountry,
	},
	methods: {
		buildBody,
		changeDepartament,
		changeProvince,
		editCost,
		save,
		taxAmountCalculated,
	},
	props: {
		currencies: {
			type: Array,
			default: () => [],
		},
		department: {
			type: Array,
			default: () => [],
		},
		id: {
			type: Number,
			default: null,
		},
	},
	validations,
	watch: {
		'model.provincesId': changeDepartament,
		'model.citiesId': changeProvince,
	},
};
</script>
<style lang="scss">
.cost-new {
	.input-group__input {
		padding: 0 5px !important;
	}
}

.no-taxes {
	color: color(black);
}

.error-field {
	color: #d5331a;
	font-size: 12px;
	margin-top: 5px;
	display: inline-block;
}
</style>
