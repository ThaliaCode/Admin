<template>
	<div>
		<v-layout wrap pa-3 align-center>
			<v-flex
				xs12
				class="filter-by-row filter-by-row-sales mb-2"
				v-if="$route.name !== 'quotations-list'"
			>
				<v-checkbox
					class="filter-checkbox"
					label="Omitir documentos relacionados fuera del rango de fechas"
					color="primary"
					size="small"
					v-model="flagNotDocumentRelated"
					hide-details
				>
				</v-checkbox>
			</v-flex>
			<v-flex
				xs12
				class="filter-by-row filter-by-row-sales mb-2"
				v-if="$route.name !== 'quotations-list'"
			>
				<v-checkbox
					class="filter-checkbox"
					label="Excluir documentos anulados"
					color="primary"
					size="small"
					v-model="flagNotCancel"
					hide-details
				>
				</v-checkbox>
			</v-flex>
			<v-flex
				xs12
				class="filter-by-row filter-by-row-sales mb-2"
				v-if="$route.name !== 'quotations-list'"
			>
				<v-checkbox
					class="filter-checkbox"
					label="Excluir Notas de Crédito"
					color="primary"
					size="small"
					v-model="flagNotNtc"
					hide-details
				>
				</v-checkbox>
			</v-flex>
			<v-flex
				xs12
				class="filter-by-row filter-by-row-sales mb-2"
				v-if="$route.name !== 'quotations-list'"
			>
				<v-checkbox
					class="filter-checkbox"
					label="Excluir Notas de Débito"
					color="primary"
					size="small"
					v-model="flagNotNtd"
					hide-details
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs12 class="filter-by-row filter-by-row-sales mb-2">
				<v-checkbox
					class="filter-checkbox"
					label="Grupo de Clientes"
					color="primary"
					size="small"
					v-model="groupClient"
					hide-details
				>
				</v-checkbox>
				<app-select
					v-if="groupClient"
					autocomplete
					class="mt-2"
					label="Grupo de Clientes"
					item-text="name"
					item-value="id"
					:return-object="false"
					:items="groupClients"
					model="paramsGroupClient"
					:item="paramsGroupClient"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs12 class="filter-by-row filter-by-row-sales mb-2">
				<v-checkbox
					class="filter-checkbox"
					label="Estado de Envio al Kardex"
					color="primary"
					size="small"
					v-model="stateShippingKardex"
					hide-details
				>
				</v-checkbox>
				<app-select
					v-if="stateShippingKardex"
					label="Estados de Kardex"
					item-text="name"
					item-value="id"
					:return-object="false"
					class="mt-2"
					:items="stateKardex"
					:item="paramsStateKardex"
					model="paramsStateKardex"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 mt-1 mb-2 v-if="$route.name === 'list-of-sales'">
				<app-select
					item-text="name"
					item-value="id"
					:item="paramsStatusWithholding"
					label="Est. de Retención"
					:items="statesWithholding"
					model="paramsStatusWithholding"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('on-action', 'cancel')"
				@accept-button-clicked="
					$emit('on-action', 'accept', {
						flagNotDocumentRelated,
						flagNotCancel,
						flagNotNtc,
						flagNotNtd,
						groupClient,
						paramsGroupClient,
						stateShippingKardex,
						paramsStateKardex,
						flagWithholding,
						paramsStatusWithholding,
					})
				"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.flagNotDocumentRelated = this.flag || null;
	this.flagNotCancel = this.flagCancel || null;
	this.flagNotNtc = this.flagNtc || null;
	this.flagNotNtd = this.flagNtd || null;
	this.groupClient = this.flagGroup || null;
	this.stateShippingKardex = this.flagKardex || null;
	this.flagWithholding = null;
	this.paramsGroupClient = this.groupId || null;
	this.paramsStateKardex = this.stateKardexId || null;
	this.paramsStatusWithholding = this.stateWith || null;
}

function clean(val) {
	if (val) {
		this.flagNotDocumentRelated = null;
		this.flagNotCancel = null;
		this.flagNotNtc = null;
		this.flagNotNtd = null;
		this.groupClient = null;
		this.stateShippingKardex = null;
		this.flagWithholding = null;
		this.paramsStatusWithholding = null;
	}
}

function data() {
	return {
		flagNotDocumentRelated: false,
		flagNotCancel: false,
		flagNotNtc: false,
		flagNotNtd: false,
		groupClient: null,
		stateShippingKardex: null,
		flagWithholding: null,
		paramsGroupClient: null,
		paramsStateKardex: null,
		paramsStatusWithholding: null,
		stateKardex: [
			{ id: 3, name: 'Enviado al Kardex' },
			{ id: 1, name: 'Pendiente de Envio' },
			{ id: 7, name: 'Reversión de reserva en kardex' },
			{ id: 8, name: 'Error al registrar en Kardex' },
		],
	};
}

function setData({ model, value }) {
	this[model] = value;
}

export default {
	name: 'select-filters',
	components: {
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		setData,
	},
	props: {
		clean: {
			default: false,
			type: Boolean,
		},
		flag: {
			default: false,
			type: Boolean,
		},
		flagCancel: {
			default: false,
			type: Boolean,
		},
		flagNtc: {
			default: false,
			type: Boolean,
		},
		flagNtd: {
			default: false,
			type: Boolean,
		},
		flagGroup: {
			default: false,
			type: Boolean,
		},
		flagKardex: {
			default: false,
			type: Boolean,
		},
		groupId: {
			type: [Number, String],
		},
		stateKardexId: {
			type: [Number, String],
		},
		stateWith: {
			type: [Number, String],
		},
		groupClients: {
			default: () => [],
			type: Array,
		},
		statesWithholding: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		clean,
	},
};
</script>

<style lang="scss" scoped>
.filter-by-row-sales {
	&:nth-child(even) {
		background: map-get($colors, background-even-modal);
	}

	.input-group {
		label {
			font-family: map-get($fonts, open-semibold) !important;
			font-size: map-get($sizes, medium) !important;
			white-space: normal !important;
		}
	}
}
</style>
