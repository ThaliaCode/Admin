<!-- MODAL PARA REGISTRAR UN NUEVO LOTE -->
<template>
	<v-card>
		<v-card-title class="modal-items-title">
			Ingresar configuración de Fecha de Vencimiento y Lote
		</v-card-title>
		<v-divider></v-divider>
		<v-card-text>
			<v-layout mt-2>
				<v-layout row wrap align-center>
					<v-flex d-flex align-center pl-2 class="column-label"> Nombre: </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ newObject && newObject.name }}
					</v-flex>
				</v-layout>
				<v-layout row wrap align-center>
					<v-flex d-flex align-center pl-2 class="column-label"> Código: </v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ newObject && newObject.code }}
					</v-flex>
				</v-layout>
			</v-layout>
			<v-flex class="title-header" mt-4>
				<v-layout row wrap justify-space-between>
					<v-flex xs7 pb-1>Información del lote</v-flex>
				</v-layout>
			</v-flex>
			<v-flex mt-3>
				<v-layout row wrap>
					<v-flex xs6 class="mb">
						<v-layout column mr-2>
							<v-flex class="label-input" align-self="center"> Código de lote </v-flex>
							<v-flex>
								<app-input-text
									:disabled="disabledEdit"
									type="text"
									:text="localCode"
									@input="setCodeLote"
									:rules="[rules.alphaNumeric]"
								/>
								<span class="error--text caption">
									{{
										localCode
											? invalidCode
												? 'Solo se permiten caracteres alfanuméricos'
												: ''
											: 'El campo codigo es requerido'
									}}
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 class="mb">
						<v-layout column>
							<v-flex class="label-input" align-self="center">
								Código EAN de producto
							</v-flex>
							<v-flex>
								<v-flex>
									<app-input-text
										:disabled="disabledEdit"
										type="text"
										:min="0"
										step="1"
										:text="localCodeEan"
										@input="setCodeEAN"
									/>
									<span class="error--text caption">
										{{
											localCodeEan && invalidCodeEAN
												? 'Solo se permiten caracteres numéricos'
												: ''
										}}
									</span>
								</v-flex>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 class="mb">
						<v-layout column mr-2>
							<v-flex class="label-input" align-self="center"> Fecha de creación </v-flex>
							<v-flex>
								<app-date-select
									:date-formatted="localDate"
									label=""
									model="date"
									@input="setDate($event, 'date')"
								/>
							</v-flex>
							<span class="error--text caption" v-if="!localDate">
								El campo fecha es requerido
							</span>
						</v-layout>
					</v-flex>
					<v-flex xs6 class="mb">
						<v-layout column>
							<v-flex class="label-input" align-self="center">
								Fecha de vencimiento
							</v-flex>
							<v-flex>
								<app-date-select
									:date-formatted="localDateDue"
									label=""
									model="dateDue"
									@input="setDate($event, 'dateDue')"
									:minDate="localDate"
								/>
							</v-flex>
							<span class="error--text caption" v-if="!localDateDue">
								El campo fecha es requerido
							</span>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<v-layout column h-100>
							<v-flex class="label-input" align-self="center"> Ubicación </v-flex>
							<app-input-text
								textarea
								no-resize
								:text="localLocation"
								@input="setLocation($event)"
							/>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-card-text>
		<v-card-actions class="modal-items-action">
			<v-layout row wrap justify-center>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="primary"
						class="btn-action white--text"
						@click="addProductModalLocal"
						:disabled="!isEverythingOK || invalidCode || invalidCodeEAN"
					>
						Aceptar
					</v-btn>
				</v-flex>
				<v-flex xs3 v-if="showAddModal" text-xs-center>
					<v-btn color="error" class="btn-action white--text" @click="closeModalLotes">
						Cancelar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-card-actions>
	</v-card>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import { format } from 'date-fns';

export default {
	name: 'modal-lotes',
	components: {
		appDateSelect,
	},
	props: {
		newObject: {
			type: Object,
			default: () => {},
		},
		disabledEdit: {
			type: Boolean,
			default: false,
		},
		showAddModal: {
			type: Boolean,
			default: false,
		},
		lotInfo: {
			type: Object,
			default: () => {},
		},
	},
	methods: {
		closeModalLotes() {
			// this.clearFields();
			this.$emit('closeModalLotes');
		},
		addProductModalLocal() {
			const productsLotsData = {
				dateDue: format(this.localDateDue, 'YYYY-MM-DD') || null,
				date: format(this.localDate, 'YYYY-MM-DD') || null,
				code: this.localCode || null,
				codeEan: this.localCodeEan || this.localCode || null,
				location: this.localLocation || null,
			};
			this.$emit('addProductModal', productsLotsData);
			// this.clearFields();
			this.closeModalLotes();
		},
		setCodeLote({ value }) {
			this.localCode = value;
		},
		setCodeEAN(value) {
			this.localCodeEan = value.value;
		},
		setLocation(value) {
			this.localLocation = value.value;
		},
		setDate({ model, value }) {
			// eslint-disable-next-line
			this['local' + model.charAt(0).toUpperCase() + model.slice(1)] = format(
				value,
				'YYYY-MM-DD'
			);
		},
		clearFields() {
			this.localDateDue = null;
			this.localDate = null;
			this.localCode = '';
			this.localCodeEan = '';
			this.localLocation = '';
		},
	},
	computed: {
		isEverythingOK() {
			if (!this.localCode || !this.localDate || !this.localDateDue) {
				return false;
			}
			if (this.localDateDue <= this.localDate) {
				this.showNotification(
					'La fecha de vencimiento debe ser mayor que la fecha de creacion',
					'error'
				);
				return false;
			}
			return true;
		},
		invalidCode() {
			return !/^[a-zA-Z0-9]*$/.test(this.localCode);
		},
		invalidCodeEAN() {
			return this.localCodeEan && !/^[0-9]*$/.test(this.localCodeEan);
		},
	},
	data() {
		return {
			localDateDue: this.dateDue,
			localDate: this.date,
			localCode: this.code,
			localCodeEan: this.codeEan,
			localLocation: this.location,
			minDateFormatted: format(this.date, 'YYYY-MM-DD'),
			maskAN: 'alpha_num',
			rules: {
				alphaNumeric: (v) =>
					/^[a-zA-Z0-9]*$/.test(v) || 'Solo se permiten caracteres alfanuméricos',
			},
		};
	},
	watch: {
		dateDue(newVal) {
			this.localDateDue = newVal;
		},
		date(newVal) {
			this.minDateFormatted = format(newVal, 'YYYY-MM-DD');
			this.localDate = newVal;
		},
		code(newVal) {
			this.localCode = newVal;
		},
		codeEan(newVal) {
			this.localCodeEan = newVal;
		},
		location(newVal) {
			this.localLocation = newVal;
		},
	},
};
</script>
<style>
.column-value {
	font-size: 14px;
	color: #575757;
	margin-left: 10px;
}
.modal-items-title {
	background-color: rgba(195, 231, 232, 0.21);
	color: color(primary);
	font-weight: 600;
	padding: 13px 29px;
}
.title-header {
	border-bottom: solid 0.5px rgba(8, 95, 101, 0.25);
	color: color(sidebar);
	font-family: 'Opens_semibold';
	font-size: 14px;
}
.width-stock {
	max-width: 185px !important;
}
.width-cprom {
	max-width: 138px !important;
}
.gray-color {
	color: #4a4a4a;
	font-family: font(open-semibold);
	font-size: 11px;
}
.ft-11 {
	font-size: 11px;
}
.mb {
	margin-bottom: 12px;
}
.item-column {
	background-color: white;
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
	padding: 6px 5px;
}
.table-sale {
	border-collapse: collapse;
	width: 100%;
}
.row-table {
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	padding: 4px 6px;
	text-align: center;
}
.label-input {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
}
.ft-8 {
	font-family: font(open-semibold);
	font-size: 8px;
}
.label-util {
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: 9px;
}
.link-purchase {
	color: #237bf5;
	font-family: font(open-regular);
	font-size: 12px;
}
.label-checkbox {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 11px;
}
.text-information-list {
	color: #4a4a4a;
	font-size: 12px;
}
.text-not-list {
	color: color(primary);
	font-size: 14px;
	font-weight: 600;
}
.text-alert {
	font-size: 12px;
	font-weight: 500;
}
.bg-header {
	background-color: rgba(2, 151, 155, 0.06);
}
.quantity-title {
	color: #8f8f8f;
	font-size: 13px;
}
</style>
