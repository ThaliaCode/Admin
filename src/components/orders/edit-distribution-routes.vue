<template>
<div class="edit-distribution">
	<v-layout wrap px-4 pt-3>
		<v-flex xs12>
			<v-text-field
				class="filter-select shadow-inset"
				name="new-product-code"
				label="Nombre"
				v-model="distribution.name"
			></v-text-field>
			<span class="form-group__message"
				v-if="$v.distribution.name.$invalid">
				El nombre es requerido.
			</span>
		</v-flex>
		<v-layout row>
			<v-flex xs12 md4 mt-1>
				<label class="caption">Fecha Final</label>
        <date-component
          :date="distribution.dateStart"
          icon="/static/img/calendar.svg"
          @on-input="$emit('set-filter-data', { model: 'dateStart', value: $event })"
        ></date-component>
			</v-flex>
			<v-flex xs12 md4 ml-3 mt-1>
				<app-input-text
					label="Hora"
					type="time"
					:text="distribution.hour"
				/>
			</v-flex>
			<v-flex xs12 md4 mt-1 ml-3>
				<label for="" class="label">Tipo de Distribución</label>
				<v-flex class="wrapper-select">
					<div class="wrapper-label">
						<v-layout>
							<v-flex xs6 class="text">Interno</v-flex>
							<v-flex xs6 class="text">Externo</v-flex>
						</v-layout>
					</div>
						<v-switch
						hide-details
						:false-value="1"
						:true-value="2"
						v-model="distribution.typeDistributor"
						disabled
						></v-switch>
				</v-flex>
			</v-flex>
		</v-layout>
		<!-- <v-flex xs12 md6 mt-3 pr-1 v-if="!isTwoDrivers">
			<app-select
				append-icon="search"
				autocomplete
				:items="vehicles"
				item-text="plate"
				item-value="id"
				:item="distribution.vehicleId"
				label="Vehículo"
				model="vehicleId"
				:return-object="false"
				@input="$emit('set-filter-data', $event)"
			></app-select>
			<span class="form-group__message"
				v-if="$v.distribution.vehicleId.$invalid">
				El vehículo es requerido.
			</span>
		</v-flex>
		<v-flex xs12 md6 mt-3 pl-1 v-if="!isTwoDrivers">
			<app-select
				append-icon="search"
				autocomplete
				:items="couriers"
				item-text="name"
				item-value="id"
				:item="distribution.responsibleUserId"
				label="Transportista"
				model="responsibleUserId"
				:return-object="false"
				@input="$emit('set-filter-data', $event)"
			></app-select>
			<span class="form-group__message"
				v-if="$v.distribution.responsibleUserId.$invalid">
				El transportista es requerido.
			</span>
		</v-flex> -->
		<v-flex xs12 md12 mt-3 pr-1>
			<app-select
				append-icon="search"
				autocomplete
				:items="drivers"
				item-text="name"
				item-value="id"
				:item="distribution.deliveryId"
				label="Repartidor"
				model="deliveryId"
				:return-object="false"
				@input="$emit('set-filter-data', $event)"
			></app-select>
			<!-- <span class="form-group__message"
				v-if="$v.distribution.deliveryId.$invalid">
				El repartidor es requerido.
			</span> -->
		</v-flex>
	</v-layout>
	<section class="modal-filter-footer">
		<modal-sidebar-button
			:is-loading="$v.$invalid"
			@cancel-button-clicked="$emit('cancel-modal')"
			@accept-button-clicked="$emit('edit-distribution')"
		/>
	</section>
</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import dateComponent from '@/components/shared/date-component';

function validations() {
	return {
		distribution: {
			name: { required },
			// vehicleId: {
			// 	required: requiredIf(() => !this.isTwoDrivers),
			// },
			// responsibleUserId: {
			// 	required: requiredIf(() => !this.isTwoDrivers),
			// },
			// deliveryId: {
			// 	required: requiredIf(() => this.isTwoDrivers),
			// },
		},
	};
}

export default {
	name: 'edit-distribution-routes',
	components: {
		autocompleteComponent,
		modalSidebarButton,
		dateComponent,
	},
	props: {
		distribution: {
			type: Object,
			default: () => {},
		},
		couriers: {
			type: Array,
			default: () => [],
		},
		vehicles: {
			type: Array,
			default: () => [],
		},
		drivers: {
			type: Array,
			default: () => [],
		},
	},
	validations,
};
</script>

<style lang="scss">
.edit-distribution {

	.input-group.input-group--selection-controls.switch {
		.input-group--selection-controls__toggle {
			background-color: transparent;
			border-radius: 16px;
			box-shadow: none;
			height: 30px;
			opacity: 1;
			width: 132px;
		}

	.input-group--selection-controls__ripple {
		transform: translate(0px, -23px);

		&::after {
			background-color: map-get($colors, success) !important;
			border-radius: 16px;
			content: 'Interno';
			color: map-get($colors, white);
			font-size: 12px;
			font-family: map-get($fonts, bold);
			height: 30px;
			left: 27%;
			padding-top: 6px;
			text-align: center;
			width: 78px;
		}

		&--active {
			transform: translate(0px, -23px) !important;
			&::after {
				content: 'Externo';
				left: 80% !important;
			}
		}
	}
}

	.input-group--selection-controls__ripple {
		width: 132px;
	}

	.text {
		color: map-get($colors, brown-grey);
		font-family: map-get($fonts, bold);
		font-size: 11px;
		padding-top: 8px;
		text-align: center;
	}

	.wrapper-label {
		background-color: map-get($colors, silver-detail-table);
		border-radius: 16px;
		height: 30px;
		position: absolute;
		top: 2px;
		width: 132px;
	}

	.wrapper-select {
		position: relative;
	}

	.label {
		font-size: 12px;
	}
}
</style>
