<template>
	<v-layout wrap pa-2>
		<v-flex xs6 px-2>
			<app-input-text
				label="Saldo"
				readonly
				model="totalToPay"
				:disabled="validateEdit"
				:text="movement.totalToPay"
				type="number"
			></app-input-text>
		</v-flex>
		<v-flex xs6 px-2>
			<app-input-text
				label="Nro de documento de cobro"
				model="documentNumberReference"
				:disabled="validateEdit"
				:readonly="movement.documents.length > 0"
				:text="movement.documentNumberReference"
				@input="$emit('set-data', $event, 'movement')"
			></app-input-text>
		</v-flex>
		<v-flex xs6 px-2 mt-1>
			<app-select
				:item="originId"
				item-text="name"
				item-value="id"
				:items="modules"
				:disabled="validateEdit"
				label="Origen"
				model="moduleId"
				@input="setModule"
			></app-select>
		</v-flex>
		<v-flex xs6 px-2 mt-1>
			<app-input-text
				label="Importe"
				model="amount"
				:disabled="(typePayment && typePayment.code === 'cntc') || validateEdit"
				:text="movement.amount"
				type="number"
				@input="$emit('set-data-amount', $event, 'movement')"
			></app-input-text>
			<span class="form-group__message" v-if="amountRequired">
				El importe es requerido
			</span>
		</v-flex>
		<v-layout align-center row mt-2 mb-2 pl-2 v-if="originId.id === 1">
			<v-flex xs4>
				<app-select
					:item="movement.typeDocument"
					label="Tipo de Doc."
					item-value="id"
					item-text="nameTypeDocument"
					:items="documentsType"
					model="typeDocument"
					@input="$emit('set-data', $event, 'typeDocument')"
				/>
			</v-flex>
			<v-flex xs3 ml-1>
				<app-input-text
					label="Serie"
					model="serie"
					type="number"
					:text="movement.serie"
					@input="$emit('set-data', $event, 'serie')"
				/>
			</v-flex>
			<v-flex ml-1 xs3>
				<app-input-text
					label="Número"
					model="number"
					type="number"
					:text="movement.number"
					@input="$emit('set-data', $event, 'number')"
				/>
			</v-flex>
			<v-flex pt-3 pl-2>
				<v-btn
					@click="$emit('valid-sale', movement, cashs)"
					color="primary"
					class="btn-action px-1"
				>
					Validar
				</v-btn>
			</v-flex>
		</v-layout>
		<small xs12 class="black--text pl-2 mb-3" v-if="originId.id === 1">
			*Solamente se puede consultar documentos relacionado al cliente.
		</small>
		<v-flex xs6 px-2 mt-1 v-if="originId.id !== 1">
			<app-select
				:item="movement.typePaymentId"
				item-text="name"
				item-value="id"
				:items="paymentsType"
				:disabled="validateEdit"
				label="Tipo de Pago"
				model="typePaymentId"
				@input="isActiveForm($event)"
			></app-select>
			<span class="form-group__message" v-if="$v.movement.typePaymentId.$invalid">
				El tipo de pago es requerido
			</span>
		</v-flex>
		<v-flex xs6 px-2 mt-1 v-if="originId.id !== 1">
			<app-date-select
				:date-formatted="paymentDate"
				label="Fecha de pago"
				:disabled="validateEdit"
				:max-date="maxDate"
				@input="setDate({ value: $event, model: 'paymentDate' })"
			/>
			<span class="form-group__message" v-if="$v.date.$invalid">
				La fecha de pago es requerida
			</span>
		</v-flex>
		<v-flex xs6 px-2 mt-1 v-else>
			<v-layout column>
				<v-flex xs2 class="primary--text detail-title-row mb-1"> Fecha de Pago: </v-flex>
				<v-flex class="detail-description-row">
					{{ movement.paymentDate }}
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex
			xs12
			mt-1
			v-if="!forms.Deposit && movement.typePaymentId != 19 && movement.typePaymentId"
			ml-2
		>
			<label ref="label" for="upload-image">
				<vue-six-four id="upload-image" hidden @vue-six-four="getFileUpdate" />
				<v-layout wrap>
					<v-flex xs10>
						<app-input-text label="Adjuntar Voucher" readonly :text="movement.urlImage" />
					</v-flex>
					<v-flex xs2 mt-4 text-xs-left>
						<v-btn
							@click="showDialog"
							class="ma-0 pl-0 btn-auto"
							small
							:disabled="readonly"
							color="pink"
						>
							<v-icon color="white">attach_file</v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</label>
		</v-flex>
		<v-flex xs12 px-2 mt-1>
			<app-input-text
				label="Observación"
				model="observation"
				:text="movement.observation"
				@input="$emit('set-data', $event, 'movement')"
			></app-input-text>
		</v-flex>
		<v-flex
			xs6
			mt-2
			px-2
			v-if="forms.Card || (showCashCxC && originCode === moduleCXC && originId.id !== 1)"
		>
			<app-select
				:item="movement.cashId"
				item-text="name"
				item-value="id"
				:items="cashs"
				label="Caja"
				:disabled="validateEdit"
				model="cashId"
				:return-object="false"
				@input="$emit('set-data', $event, 'movement')"
			></app-select>
		</v-flex>
		<v-flex xs6 pl-2 v-if="originId.id === 1" mt-2>
			<v-layout column>
				<v-flex xs2 class="primary--text detail-title-row mb-1"> Caja: </v-flex>
				<v-flex class="detail-description-row">
					{{ movement.cashName }}
				</v-flex>
			</v-layout>
		</v-flex>
		<!-- <v-flex xs6 px-2 v-if="isPeru && originId.id !== 1">
			<app-select
				:item="currencyId"
				item-text="name"
				item-value="id"
				:items="currencies"
				:disabled="validateEdit"
				label="Moneda"
				model="currency"
				@input="$emit('set-data', $event, 'movement')"
			></app-select>
			<span class="form-group__message" v-if="$v.currencyId.$invalid">
				La moneda es requerida
			</span>
		</v-flex>
		<v-flex xs6 px-2 v-else-if="!movement.typePaymentId">
			<v-layout column>
				<v-flex xs2 class="primary--text detail-title-row mb-1">
					Moneda
				</v-flex>
				<v-flex class="detail-description-row">
					{{ movement.currencyName }}
				</v-flex>
			</v-layout>
		</v-flex> -->
		<v-flex xs12 px-2 mt-2 mb-2 v-if="typePayment && typePayment.code === 'cntc'">
			<v-btn
				class="btn-action btn-auto btn-width-auto px-2 py-1"
				color="success"
				small
				@click.stop="openListNtc()"
			>
				Seleccione documento
			</v-btn>

			<v-layout wrap px-2 align-end mt-2 v-if="documentNtc">
				<v-flex xs3 caption mb-2>Nro. Documento:</v-flex>
				<v-flex xs5 px-1 mb-2>
					<v-layout wrap align-end subheading>
						{{ documentNtc.documentNumber }}
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
		<!-- <v-flex px-2 :class="originId.id === 1 ? 'xs12' : 'xs6'">
			<app-input-text
				v-if="hideRepeatields"
				label="Referencia"
				model="reference"
				:text="movement.reference"
				@input="$emit('set-data', $event, 'movement')"
			></app-input-text>
		</v-flex> -->
		<v-flex xs12 px-2>
			<bank-deposit-form
				v-if="forms.Deposit"
				:show-concept="false"
				:show-date-deposit="false"
				:reference-deposit="movement.reference"
				:concept-deposit="movement.observation"
				:bank-account-id="bankAccountId"
				:bank-accounts="bankAccounts"
				:document-number="movement.documentReference"
				:date-reference="movement.additionalInformation.dateReference"
				:url-image="movement.urlImage"
				@get-data="$emit('set-data', $event, 'movement')"
			/>
		</v-flex>
		<v-flex xs12 py-1 px-2>
			<card-form
				v-if="forms.Card"
				:bank-account-id="bankAccountId"
				:bank-accounts="bankAccounts"
				:document-number="movement.documentReference"
				@get-data="$emit('set-data', $event, 'movement')"
			/>
		</v-flex>
		<v-flex xs12 py-1>
			<check-form
				v-if="forms.Check"
				:bank-account-id="bankAccountId"
				:bank-accounts="bankAccounts"
				:document-number="movement.documentReference"
				:date-reference="movement.additionalInformation.dateReference"
				:reference="movement.reference"
				@get-data="$emit('set-data', $event, 'movement')"
			/>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				:is-loading="disabledButton"
				success-text="Guardar"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="$emit('save')"
			></modal-sidebar-button>
		</section>
		<v-dialog persistent v-model="openNtc" max-width="750px">
			<modal-select-ntc
				v-if="openNtc"
				:id-supplier="supplierId"
				:id-customer="customerId"
				:is-purchase="$route.name === 'accounts-to-pay'"
				:type-document="typeDocuments"
				@add-document-ntc="addDocNtc"
				@close-modal="openListNtc"
			/>
		</v-dialog>
	</v-layout>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { format, addDays } from 'date-fns';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import dateComponent from '@/components/shared/date-component';
import helper from '@/shared/helper';
import modalSelectNtc from '@/components/modal-select-ntc';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import ModuleCode from '@/shared/module';
import VueSixFour from 'vue-six-four';
import TypePaymentForm from '@/shared/type-payment-form';
import lib from '@/shared/lib';

const { equality, find } = lib;

const { exactDate } = helper;

function created() {
	this.moduleCXC = ModuleCode.AccountsReceivable;
	this.loadResources();
}

function disabledButton() {
	const existNtc =
		this.typePayment && this.typePayment.code === 'cntc' ? this.documentNtc : true;
	return this.$v.$invalid || this.loading || this.amountRequired || Boolean(!existNtc);
}

function isActiveForm(typePayment) {
	if (typePayment) {
		this.typePayment = typePayment.value;
		this.hideRepeatields =
			typePayment.value.code !== 'yape' && typePayment.value.code !== 'plin';
		const paymentTypeSelected =
			this.paymentsType.find((pt) => pt.id === typePayment.value.id) || {};
		const typeForms = Object.keys(TypePaymentForm);
		const typeForm =
			typeForms.find((tf) => TypePaymentForm[tf] === paymentTypeSelected.flagForm) || {};
		this.forms = { [typeForm]: true };
		if (typeForm === 'Cash') {
			this.bankAccountId = null;
			this.$emit(
				'set-data',
				{ model: 'bankAccountId', value: this.bankAccountId },
				'movement'
			);
		}
		this.documentNtc = null;
		this.$emit('set-data', { value: null, model: 'ntcDocumentId' }, 'movement');
		this.$emit('set-data', typePayment, 'movement');
	}
}

function showDialog() {
	this.$refs.label.click();
}

async function getFileUpdate(fileInfo) {
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post('upload-files', newFile);
			this.movement.urlImage = file.Location;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	}
}

async function loadResources() {
	this.loadingResources = true;
	const moduleTypePayments =
		this.originCode === ModuleCode.AccountsReceivable ? 'sales' : 'purchases';
	const params = {
		flagType: 1,
	};
	const idsOriginOptions =
		this.originCode === ModuleCode.AccountsReceivable ? [1, 4] : [2, 3];
	const request = [
		this.getCurrencies(),
		this.$httpSales.get('module'),
		this.getTypePayments(moduleTypePayments),
		this.getBankAccount(),
		this.$httpSales.get('cash'),
		this.$httpSales.get('type-documents', { params }),
	];
	try {
		[
			{ data: this.currencies },
			{ data: this.modules },
			{ data: this.paymentsType },
			{ data: this.bankAccounts },
			{ data: this.cashs },
			{ data: this.documentsType },
		] = await Promise.all(request);
		const cashUser = this.$userInfo.cashId;
		this.documentsType = this.filterTypeDocuments(1, 'BOL', 'FAC', 'NTV');
		this.documentsType = this.documentsType.map((p) => {
			const newRow = { ...p };
			newRow.nameTypeDocument = p.documentType.name;
			return newRow;
		});
		this.paymentsType = this.paymentsType.map((pt) => pt.paymentType);
		this.originId = this.modules.find((m) => m.code === this.originCode);
		this.modules = this.modules.filter((m) => idsOriginOptions.includes(m.id));
		this.currencyId = this.movement.currency || this.$userInfo.company.currency;
		this.cashId = this.movement.cashId || cashUser;
		this.date = this.movement.id ? format(this.movement.paymentDate, 'YYYY-MM-DD') : null;
		this.paymentDate = this.movement.id
			? exactDate(this.movement.paymentDate, 'DD/MM/YYYY')
			: null;
		this.bankAccountId = this.movement.bankAccountId || this.bankAccounts[0].id;
		this.$emit('set-data', { model: 'currency', value: this.currencyId }, 'movement');
		this.$emit('set-data', { model: 'moduleId', value: this.originId }, 'movement');
		this.$emit('set-data', { model: 'cashId', value: this.cashId }, 'movement');
		this.$emit(
			'set-data',
			{ model: 'bankAccountId', value: this.bankAccountId },
			'movement'
		);
		this.validateEdit = Boolean(
			this.movement.typePaymentId || this.movement.typePayment.id
		);
		if (this.movement.typePaymentId) {
			const paymentTypeSelected =
				this.paymentsType.find((pt) => pt.id === this.movement.typePaymentId) || {};
			const typeForms = Object.keys(TypePaymentForm);
			const typeForm =
				typeForms.find((tf) => TypePaymentForm[tf] === paymentTypeSelected.flagForm) ||
				{};
			this.forms = { [typeForm]: true };
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingResources = false;
	}
}

function filterTypeDocuments(...args) {
	const [flag, ...rest] = args;
	return this.documentsType.reduce((list, item) => {
		const { documentType } = item;
		const { code, flagType } = documentType;
		const documentExist = find(equality(code), rest);
		if (flagType === flag && documentExist) {
			return list.concat(item);
		}
		return list;
	}, []);
}

function validations() {
	return {
		currencyId: { required },
		date: { required: requiredIf(() => this.originId.id !== 1) },
		movement: {
			typePaymentId: { required: requiredIf(() => this.originId.id !== 1) },
		},
	};
}

function setDate({ model, value }) {
	this.paymentDate = value.value;
	this.date = value.value;
	this.$emit('set-date', { model, valueDate: value.value }, 'movement');
}

function setModule({ model, value }) {
	this.originId = value;
	this.$emit('set-data', { model, value }, 'movement');
}

function data() {
	return {
		bankAccountId: null,
		bankAccounts: [],
		cashId: null,
		cashs: [],
		currencies: [],
		currencyId: null,
		date: null,
		documentsType: [],
		forms: {
			Deposit: false,
			Card: false,
			Check: false,
		},
		loadingResources: false,
		modules: [],
		originId: {},
		paymentDate: null,
		paymentsType: [],
		moduleCXC: null,
		readonly: false,
		validateEdit: null,
		openNtc: false,
		typePayment: {
			code: null,
		},
		hideRepeatields: false,
		documentNtc: null,
		allowedFiles: ['jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt'],
	};
}

export default {
	name: 'movement-form',
	components: {
		bankDepositForm,
		cardForm,
		checkForm,
		dateComponent,
		modalSidebarButton,
		VueSixFour,
		modalSelectNtc,
	},
	computed: {
		disabledButton,
		maxDate() {
			return format(addDays(this.$today(), 0), 'YYYY-MM-DD');
		},
	},
	created,
	data,
	methods: {
		getFileUpdate,
		isActiveForm,
		filterTypeDocuments,
		loadResources,
		setDate,
		setModule,
		showDialog,
		openListNtc() {
			this.openNtc = !this.openNtc;
		},
		addDocNtc(row) {
			const { id, amount, documentNumber } = row;
			this.documentNtc = row;
			this.$emit('set-data-amount', { model: 'amount', value: amount }, 'movement');
			this.$emit(
				'set-data',
				{ model: 'documentNumber', value: documentNumber },
				'movement'
			);
			this.$emit('set-data', { value: id, model: 'ntcDocumentId' }, 'movement');
			this.openListNtc();
		},
	},
	props: {
		amountRequired: {
			default: true,
			type: Boolean,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		movement: {
			default: () => ({ additionalInformation: {}, typePaymentId: null, typePayment: {} }),
			type: Object,
		},
		customerId: {
			type: [Number, String],
			default: null,
		},
		supplierId: {
			type: [Number, String],
		},
		document: {
			type: Object,
		},
		typeDocuments: {
			type: Array,
		},
		originCode: String,
	},
	validations,
};
</script>
