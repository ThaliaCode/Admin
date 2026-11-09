<template>
	<v-layout wrap pt-4>
		<v-flex xs6 pr-2>
			<v-layout row wrap>
				<v-flex xs12 px-4>
					<div class="title-slide primary--text lighten-2">Datos Generales</div>
				</v-flex>
			</v-layout>
			<vendors-general-data
				:create-password="createPassword"
				:disabled-email="disabledEmail"
				:document-types="documentTypes"
				:is-valid="isValid"
				:validations="validations"
				:vendor="vendor"
				:groups="groups"
				:type-transport-code="typeTransportCode"
				@on-input="$emit('on-input', $event)"
				@on-switch-change="$emit('on-switch-change', $event)"
				@on-change="$emit('on-input', $event)"
			></vendors-general-data>
			<!-- <v-layout row wrap v-if="$route.name === 'new-distributor'">
				<v-flex xs12 px-4 mt-2>
				<app-select
					:item="vendor.subsidiaryId"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					label="Sucursales"
					model="subsidiaryId"
					place-holder="Seleccionar Sucursal"
					:return-object="false"
					@input="$emit('on-input', $event)"
				></app-select>
				</v-flex>
			</v-layout>
			<v-layout row wrap v-if="$route.name === 'new-distributor'">
				<v-flex xs12 px-4 mt-2>
					<app-select
						chips
						multiple
						:disabled="!vendor.subsidiaryId"
						:item="vendor.warehousesMultiple"
						item-text="name"
						item-value="id"
						:items="warehouses"
						label="Almacen"
						model="warehousesMultiple"
						@input="$emit('on-input', $event)"
					></app-select>
					<span class="error--text caption" v-if="!vendor.subsidiaryId">
						Se requiere seleccionar una sucursal
					</span>
				</v-flex>
			</v-layout> -->
			<v-layout column v-if="$route.name === 'new-vendor'">
				<v-layout row wrap mt-4>
					<v-flex xs12 px-4>
						<div class="title-slide primary--text lighten-2">Permisos</div>
					</v-flex>
				</v-layout>
				<multiple-select
					item-text="name"
					item-value="id"
					:items="warehouses"
					placeholder="Tiendas"
					return-object
					:value="allowedWarehouses"
					:items-selected="warehousesSelected"
					@input="$emit('on-input', { value: $event, model: 'warehouses' })"
					@delete-item="$emit('delete-warehouse', $event)"
				></multiple-select>
				<span
					class="error--text caption ml-4"
					v-if="!$v.allowedWarehouses.required"
					>Seleccione una o más tiendas</span
				>
			</v-layout>
		</v-flex>
		<v-flex xs6 pl-2>
			<v-layout row wrap>
				<v-flex xs12 px-4>
					<div class="title-slide primary--text lighten-2">Configuración</div>
				</v-flex>
			</v-layout>
			<vendors-settings
				:actions="actions"
				:currency="currency"
				:modules="modules"
				:modules-disabled="modulesDisabled"
				:periods="periods"
				:sale-points="salePoints"
				:warehouses="warehouses"
				:sale-points-selected="salePointsSelected"
				:vendor="vendor"
				:subsidiaries="subsidiaries"
				:list-transport="listTransport"
				@click-icon="$emit('click-icon', $event)"
				@delete-sale-point="$emit('delete-sale-point', $event)"
				@on-change="$emit('on-change', $event)"
				@on-click="$emit('on-click', $event)"
				@on-input="$emit('on-input', $event)"
				@on-select-click="$emit('on-select-click')"
				@on-switch-change="$emit('on-switch-change', $event)"
				@set-value="$emit('set-value', $event)"
				@on-vehicle="$emit('on-vehicle', $event)"
			></vendors-settings>
		</v-flex>
		<modal-sidebar-button
			:is-loading="vendorCreateDisabled || validLicence || disabledBtn"
			success-text="Guardar"
			@cancel-button-clicked="$emit('cancel-form')"
			@accept-button-clicked="$emit('save-form')"
		></modal-sidebar-button>
	</v-layout>
</template>

<script>
import multipleSelect from '@/components/shared/selectors/multiple-select';
import vendorsGeneralData from '@/components/field-sale/vendors/vendors-general-data';
import vendorsSettings from '@/components/field-sale/vendors/vendors-settings';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required, requiredIf } from 'vuelidate/lib/validators';

function vendorCreateDisabled() {
	return this.$route.name === 'new-vendor'
		? this.$v.$invalid ||
				this.vendor.terminals.length === 0 ||
				this.modulesDisabled
		: this.$v.$invalid;
}

function validations() {
	if (this.$route.name === 'new-distributor') {
		return {
			vendor: {
				name: { required },
				lastName: {
					required: requiredIf(() => !(this.vendor.documentTypeId === 2)),
				},
				documentTypeId: { required },
				documentNumber: { required },
				email: { required },
				// password: {
				// 	required: requiredIf(() => this.vendor.flagLimit === 1),
				// },
				phone: { required },
				flagLimitUsers: { required },
			},
		};
	}
	return {
		allowedWarehouses: { required },
		vendor: {
			name: { required },
			lastName: { required },
			documentTypeId: { required },
			documentNumber: { required },
			email: { required },
			password: {
				required: requiredIf(() => this.createPassword),
			},
			phone: { required },
			flagLimitUsers: {
				required: requiredIf(() => !Number(this.idVendor)),
			},
		},
	};
}

export default {
	name: 'vendors-form',
	components: {
		modalSidebarButton,
		multipleSelect,
		vendorsGeneralData,
		vendorsSettings,
	},
	computed: {
		vendorCreateDisabled,
	},
	props: {
		actions: {
			default: () => {},
			type: Object,
		},
		allowedWarehouses: {
			default: () => [],
			type: Array,
		},
		createPassword: {
			default: true,
			type: Boolean,
		},
		currency: String,
		disabledEmail: {
			default: true,
			type: Boolean,
		},
		documentTypes: {
			default: () => [],
			type: Array,
		},
		isValid: {
			default: true,
			type: Boolean,
		},
		modules: {
			default: () => [],
			type: Array,
		},
		modulesDisabled: {
			default: false,
			type: Boolean,
		},
		periods: {
			default: () => [],
			type: Array,
		},
		salePoints: {
			default: () => [],
			type: Array,
		},
		salePointsSelected: {
			default: () => [],
			type: Array,
		},
		validations: {
			default: () => {},
			type: Object,
		},
		vendor: {
			default: () => {},
			type: Object,
		},
		warehouses: {
			default: () => [],
			type: Array,
		},
		warehousesSelected: {
			default: () => [],
			type: Array,
		},
		groups: {
			default: () => [],
			type: Array,
		},
		listTransport: {
			default: () => [],
			type: Array,
		},
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		validLicence: {
			default: false,
			type: Boolean,
		},
		idVendor: {
			type: Number,
		},
		typeTransportCode: {
			type: String,
		},
		disabledBtn: {
			default: false,
			type: Boolean,
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-slide {
	border-bottom: 1px solid color(border-footer);
	font-family: font(open-bold);
	font-size: size(small13);
	text-transform: uppercase;
}
</style>
