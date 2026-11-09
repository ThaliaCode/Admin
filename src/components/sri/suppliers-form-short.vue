<template>
	<div>
		<v-form method="post" @click.prevent="save">
			<v-layout wrap px-4 my-3>
				<v-flex xs12 md6 px-2 mb-2>
					<app-input-text
						:disabled="readonly"
						:readonly="readonly"
						label="Documento"
						model="documentNumber"
						:text="model.documentNumber"
					/>
				</v-flex>
				<v-flex xs12 md6 px-2 mb-2>
					<app-select
						:items="typeDocuments"
						:item="model.flagTypePerson"
						item-text="name"
						item-value="codeTaxes"
						:label="labelsByCountry.idLabel"
						model="flagTypePerson"
						@input="changeTypePerson"
					/>
					<span class="form-group__message" v-if="$v.model.flagTypePerson.$invalid">
						El tipo de documento es requerido
					</span>
				</v-flex>
				<v-flex xs12 px-2 mb-2>
					<app-input-text
						:disabled="readonlyName"
						:readonly="readonlyName"
						label="Nombre Proveedor"
						model="name"
						:text="model.name"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 px-2 mb-2>
					<app-input-text
						label="Nombre Comercial"
						model="commercialName"
						:text="model.commercialName"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.commercialName.$invalid">
						El nombre comercial es requerido
					</span>
				</v-flex>
				<v-flex xs12 px-2 mb-2>
					<app-input-text
						label="Dirección"
						model="address"
						:text="model.address"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 px-2 mb-2>
					<label class="caption">Teléfonos</label>
					<v-select
						v-model="model.phone"
						class="filter-select"
						placeholder="Teléfonos"
						chips
						tags
						append-icon=""
						type="number"
					>
						<template slot="selection" slot-scope="data">
							<v-chip
								:selected="data.selected"
								class="tags-form"
								close
								color="info"
								label
								outline
								small
								@input="remove(data.item)"
							>
								{{ data.item }}
							</v-chip>
						</template>
					</v-select>
				</v-flex>
				<v-flex xs12 px-2 mb-2>
					<app-input-text
						label="E-mail"
						model="email"
						:text="model.email"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.email.$invalid">
						El email ingresado no es válido. Recuerde que email no es requerido
					</span>
				</v-flex>
				<v-flex xs12 px-2 mb-2>
					<v-checkbox label="Activo" hide-details v-model="model.flagActive"></v-checkbox>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || disabledSupplier"
					:hidden="hideCancel"
					@cancel-button-clicked="close"
					@accept-button-clicked="save"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import {
	email,
	maxLength,
	minLength,
	minValue,
	required,
} from 'vuelidate/lib/validators';
import appSelect from '@/components/shared/app-select';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadResources();
	this.model.address = this.address;
	this.model.commercialName = this.commercialName;
	this.model.documentNumber = this.ruc;
	this.model.name = this.name;
	this.model.flagTypePerson = this.flagTypePerson;

	// Fallback para infoDocument si no hay props directas
	if (
		this.$parent &&
		this.$parent.purchase &&
		this.$parent.purchase.additionalInformation &&
		this.$parent.purchase.additionalInformation.infoDocument
	) {
		const info = this.$parent.purchase.additionalInformation.infoDocument;
		if (!this.model.documentNumber) this.model.documentNumber = info.issuerRuc;
		if (!this.model.name) this.model.name = info.issuerName;
		if (!this.model.commercialName) this.model.commercialName = info.issuerName;
	}

	if (this.model.documentNumber && !this.model.name) {
		this.loadSupplierData();
	}
}

function close() {
	this.$emit('close');
}

function getData({ model, value }) {
	this.model[model] = value;
	// if (model === 'documentNumber') {
	// 	this.searchDocument(value);
	// }
}

function getSelectData({ model, value }) {
	if (value) {
		this[model] = value;
	}
}

async function loadResources() {
	const request = [
		this.$httpSales.get('type-person'),
		// this.$httpSales.get('supplier-type'),
	];
	[
		{ data: this.typeDocuments },
		// { data: this.suppliersTypes },
	] = await Promise.all(request);
}

async function loadSupplierData() {
	const params = { codeCountry: this.labelsByCountry.code };
	try {
		const { data: response } = await this.$httpSunat.get(
			`ruc/${this.model.documentNumber}`,
			{ params }
		);
		this.model.address = response.data.domicilio;
		this.model.commercialName = response.data.nombre;
		this.model.name = response.data.nombre;
		if (!this.model.name) {
			this.blockName = false;
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function remove(item) {
	const index = this.model.phone.findIndex((number) => number === item);
	if (index > -1) {
		this.model.phone.splice(index, 1);
	}
}

function save() {
	this.$emit('save', this.model);
}

function setDate(input, model) {
	this[model] = input;
}

function validations() {
	const typePerson = this.typeDocuments.find((td) => td.id === this.model.flagTypePerson);
	const newDocument = {
		required,
	};
	if (typePerson && typePerson.configuration) {
		if (typePerson.configuration.validations) {
			this.maxDocument = typePerson.configuration.validations.maxLength || 0;
			this.minDocument = typePerson.configuration.validations.minLength || 0;
			if (typePerson.configuration.validations.maxLength) {
				newDocument.maxLength = maxLength(this.maxDocument);
			}
			if (typePerson.configuration.validations.minLength) {
				newDocument.minLength = minLength(this.minDocument);
			}
			if (this.maxDocument && this.minDocument) {
				if (this.maxDocument === this.minDocument) {
					this.documentMessage = `Es necesario ingresar ${this.minDocument} dígitos`;
				} else {
					this.documentMessage = `Es necesario ingresar entre ${this.minDocument} y ${this.maxDocument} dígitos`;
				}
			} else if (this.minDocument) {
				this.documentMessage = `Ingrese un mínimo de ${this.minDocument} dígitos`;
			} else if (this.maxDocument) {
				this.documentMessage = `Ingrese un máximo de ${this.maxDocument} dígitos`;
			}
		}
	}
	return {
		model: {
			commercialName: {
				required,
			},
			documentNumber: newDocument,
			email: {
				email,
			},
			flagTypePerson: {
				minValue: minValue(1),
				required,
			},
			name: {
				required,
			},
		},
	};
}

async function peruDatosRequest(typePerson, num) {
	const url = `${typePerson}/${num}`;
	const params = { codeCountry: this.labelsByCountry.code };
	try {
		const response = await this.$httpSunat.get(url, { params });
		this.model.name = response.data.data.Nombre_completo
			? response.data.data.Nombre_completo
			: response.data.data.nombre || '';
		this.model.commercialName = response.data.data.Nombre_completo
			? response.data.data.Nombre_completo
			: response.data.data.nombre || '';
		this.model.address = response.data.data.domicilio || '';
		if (response.data.data.telefono) {
			this.model.phone.push(response.data.data.telefono);
		}
	} catch (error) {
		this.showNotification(
			'Los datos no se consiguieron. Verifique la información o complete el formulario manualmente',
			'info'
		);
		this.clearSearch();
	}
}

function clearSearch() {
	this.model.name = '';
	this.model.commercialName = '';
	this.model.address = '';
	this.model.phone = [];
}

function searchDocument(val) {
	this.model.name = '';
	this.model.commercialName = '';
	const model = this.setTypePersonEcu(val);
	this.peruDatosRequest(model, val);
}

function setTypePersonEcu(num) {
	const len = num.length;
	this.model.flagTypePerson = 7;
	if (len === 13) {
		return 'ruc';
	} else if (len === 10) {
		this.model.flagTypePerson = 8;
		return 'dni';
	}
	this.model.flagTypePerson = null;
	return null;
}

function changeTypePerson(payload) {
	const { model, value } = payload;
	const codeTaxes = value && typeof value === 'object' ? value.codeTaxes : value;
	this.$set(this.model, model, codeTaxes);
	if (this.$v.model[model]) {
		this.$v.model[model].$touch();
	}
}

function readonlyName() {
	return this.readonly && this.blockName;
}

function data() {
	return {
		blockName: true,
		documentMessage: '',
		maxDocument: 0,
		minDocument: 0,
		model: {
			accountingBank: '',
			accountingCode: '',
			accountingTypeId: null,
			additionalInformation: {
				beneficiaryCode: '',
				endDate: '',
				initDate: '',
				person: '',
				printAuthNumber: '',
				rangeFrom: '',
				rangeUp: '',
				serie: '',
				sriAuthNumber: '',
				taxIdentification: '',
				taxSupportId: null,
				transactionTypeId: null,
				typePaymentIds: [],
			},
			address: '',
			bankId: null,
			cityId: null,
			codeTaxes: null,
			codeTaxesGoods: null,
			commercialName: '',
			contactName: '',
			creditDays: null,
			creditLimitation: null,
			documentNumber: '',
			email: '',
			flagActive: true,
			flagTypePerson: null,
			geoPosition: null,
			groupId: null,
			latitude: null,
			longitude: null,
			name: '',
			observation: '',
			parishId: null,
			paymentMethod: null,
			phone: [],
			postalCode: '',
			provinceId: null,
			supplierTypeId: null,
			typeExpenseId: null,
			zoneId: null,
		},
		typeDocuments: [],
	};
}

export default {
	name: 'suppliers-form-short',
	components: {
		appSelect,
		modalSidebarButton,
	},
	computed: {
		readonlyName,
	},
	created,
	data,
	methods: {
		changeTypePerson,
		clearSearch,
		close,
		getData,
		getSelectData,
		loadResources,
		loadSupplierData,
		peruDatosRequest,
		remove,
		save,
		setDate,
		setTypePersonEcu,
		searchDocument: helper.debounce(searchDocument),
	},
	props: {
		address: String,
		commercialName: String,
		name: String,
		readonly: {
			default: true,
			type: Boolean,
		},
		ruc: [Number, String],
		flagTypePerson: {
			default: null,
			type: [Number, String],
		},
		hideCancel: {
			default: false,
			type: Boolean,
		},
		disabledSupplier: {
			default: false,
			type: Boolean,
		},
	},
	validations,
};
</script>

<style lang="scss" scoped>
.tabs-form {
	width: 100%;
}
</style>
