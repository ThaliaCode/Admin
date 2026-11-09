<template>
	<v-layout row wrap px-4 pt-3>
		<v-flex xs2 pr-1>
			<app-input-text
				:disabled="disabled"
				:readonly="disabled"
				label="Nombre de ruta"
				model="name"
				:text="distribution.name"
				@input="$emit('set-data', $event)"
			></app-input-text>
		</v-flex>
		<v-flex xs5>
			<v-layout row wrap>
				<v-flex xs4 pl-1 pr-2>
					<label class="caption">Fecha</label>
					<date-component
						:disabled="disabled"
						:readonly="disabled"
						:date="distribution.date"
						icon="/static/img/calendar.svg"
						@on-input="$emit('set-data', { model: 'date', value: $event })"
					></date-component>
				</v-flex>
				<v-flex xs4 pl-1 pr-2>
					<app-input-text
						:disabled="disabled"
						:readonly="disabled"
						label="Hora"
						model="hour"
						:text="distribution.hour"
						type="time"
						@input="$emit('set-data', $event)"
					></app-input-text>
				</v-flex>
				<v-flex xs4 pl-1>
					<label class="caption">Tipo de distribución</label>
					<switch-vendor
						:disabled="disabled"
						:readonly="disabled"
						:false-value="1"
						model="typeDistributor"
						:model-value="distribution.typeDistributor"
						reseller
						:true-value="2"
						@on-switch-change="$emit('set-data', $event)"
					></switch-vendor>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs5 v-if="show">
			<v-layout row wrap>
				<v-flex xs5>
					<autocomplete-component
						append-icon="arrow_drop_down"
						http-code="$httpSales"
						:item="distribution.deliveryId"
						item-text="fullname"
						item-value="id"
						:items="drivers"
						label-value="Repartidor"
						model="deliveryId"
						placeholder="Seleccionar"
						prop="name"
						resource-url="delivery"
						:return-object="false"
						@return-data="setData('deliveryId', $event)"
					></autocomplete-component>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex v-else>
			<v-layout row wrap>
				<v-flex xs5>
					<autocomplete-component
						append-icon="arrow_drop_down"
						http-code="$httpSales"
						:item="distribution.responsibleUserId"
						item-text="name"
						item-value="id"
						:items="transportsAgency"
						label-value="Agencia de Transporte"
						model="responsibleUserId"
						placeholder="Seleccionar"
						prop="name"
						resource-url="transport-agency"
						:return-object="false"
						@return-data="setData('responsibleUserId', $event)"
					></autocomplete-component>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
import dateComponent from '@/components/shared/date-component';
import helper from '@/shared/helper';
import switchVendor from '@/components/field-sale/vendors/switch-vendor';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';

const { exactDate } = helper;

function created() {
	this.dateField = exactDate(this.distribution.date, 'DD/MM/YYYY');
}

function show() {
	return this.distribution.typeDistributor === 1;
}

function setData(model, $event) {
	if ($event !== undefined) {
		this.$emit('set-data', {
			model,
			value: $event,
		});
	}
}

function data() {
	return {
		dateField: '',
	};
}

export default {
	name: 'distribution-config',
	components: {
		dateComponent,
		switchVendor,
		autocompleteComponent,
	},
	computed: {
		show,
	},
	methods: {
		setData,
	},
	created,
	data,
	props: {
		couriers: {
			default: () => [],
			type: Array,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		distribution: {
			default: () => {},
			type: Object,
		},
		vehicles: {
			default: () => [],
			type: Array,
		},
		isNewFlow: {
			type: Boolean,
			default: false,
		},
		drivers: {
			default: () => [],
			type: Array,
		},
		transportsAgency: {
			default: () => [],
			type: Array,
		},
	},
};
</script>

<style lang="scss" scoped></style>
