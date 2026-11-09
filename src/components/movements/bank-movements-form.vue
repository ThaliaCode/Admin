<template>
	<div>
		<v-form method="post" @submit.prevent="$emit('save', model)">
			<v-layout wrap px-4 pt-4>
				<v-flex xs12 mb-2>
					<app-select
						ref="bankAccount"
						item-text="name"
						item-value="id"
						:item="model.bankAccountId"
						:items="bankAccounts"
						label="Cuenta Bancaria"
						model="bankAccountId"
						@input="getData"
						@keyup.enter.native="focusNext('paymentDate')"
					/>
					<span class="form-group__message" v-if="$v.model.bankAccountId.$invalid">
						La cuenta bancaria es requerida
					</span>
				</v-flex>
				<v-flex xs6 pr-3 mb-2>
					<app-select
						:item="moduleOriginId"
						item-text="name"
						item-value="id"
						:items="modules"
						label="Origen"
						model="moduleOriginId"
						disabled
						@input="getData"
					/>
				</v-flex>
				<v-flex xs6 mb-2>
					<app-date-select
						ref="paymentDate"
						label="Fecha"
						:date-formatted="dateFormattedVisual"
						model="paymentDate"
						@input="setDate"
						@enter="focusNext('amount')"
					/>
					<span class="form-group__message" v-if="$v.model.paymentDate.$invalid">
						La fecha de transacción es requerida
					</span>
				</v-flex>
				<!-- <v-flex xs6 mb-2 pr-2>
					<app-select
						:item="model.typeTransactionBankId"
						item-text="name"
						item-value="id"
						:items="transactions"
						label="Transacción"
						model="typeTransactionBankId"
						@input="getData"
					/>
					<span
						class="form-group__message"
						v-if="$v.model.typeTransactionBankId.$invalid"
					>
						El tipo de transacción es requerido
					</span>
				</v-flex> -->
				<v-flex xs6 pr-3 mb-2>
					<app-input-text
						ref="amount"
						type="number"
						label="Importe"
						model="amount"
						:text="model.amount"
						@input="getValue"
						@input-enter="focusNext('documentNumber')"
					/>
					<span class="form-group__message" v-if="$v.model.amount.$invalid">
						El importe es requerido
					</span>
				</v-flex>
				<v-flex xs6 mb-2>
					<app-input-text
						ref="documentNumber"
						label="Nro de Documento"
						model="documentNumber"
						:text="model.documentNumber"
						@input="getValue"
						@input-enter="focusNext('typeMovement')"
					/>
					<span class="form-group__message" v-if="$v.model.documentNumber.$invalid">
						El número de documento es requerido
					</span>
				</v-flex>
				<v-flex xs6 pr-3 mb-2>
					<app-select
						ref="typeMovement"
						:item="model.typeMovement"
						item-text="name"
						item-value="id"
						:items="typeMovements"
						label="Tipo de Movimiento"
						model="typeMovement"
						@input="getData"
						@keyup.enter.native="focusNext('typePayment')"
					/>
					<span class="form-group__message" v-if="$v.model.typeMovement.$invalid">
						El tipo es requerido
					</span>
				</v-flex>
				<v-flex xs6 mb-2>
					<app-select
						ref="typePayment"
						:item="model.typePaymentId"
						item-text="name"
						item-value="id"
						:items="typePayments"
						label="Tipo de Pago"
						model="typePaymentId"
						@input="getData"
						@keyup.enter.native="focusNext('concept')"
					/>
				</v-flex>
				<v-flex xs12 mb-2>
					<label ref="label" for="upload-file">
						<vue-six-four id="upload-file" hidden @vue-six-four="getFile" />
						<v-layout wrap>
							<v-flex xs10>
								<app-input-text
									label="Adjuntar Voucher"
									readonly
									:text="model.urlImage"
								/>
							</v-flex>
							<v-flex xs2 mt-4 text-xs-left>
								<v-btn
									ref="attachFileBtn"
									@click="showDialog"
									:disabled="loadImage"
									class="ma-0 pl-0 btn-auto"
									small
									color="pink"
								>
									<v-icon color="white">attach_file</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</label>
				</v-flex>
				<v-flex xs12 mb-2 v-if="showIntegrations">
					<autocomplete-component
						append-icon="search"
						class="cost-center-account"
						select-column="4"
						disabled-column="8"
						disabled-class="accounting-input-disabled"
						http-code="$httpQuipu"
						:item="model.additionalInformation.account"
						item-text="fullName"
						item-value="code"
						:items="autocompleteItems"
						label-value="Cta. Contable"
						model="account"
						placeholder-value="Busca una cuenta"
						placeholder-input="Nombre de la cuenta"
						prop="account"
						prop-search="fullName"
						:readonly-prop="accountName"
						readonly-prop-show
						:resource-url="
							`accounting-accounts/${labelsByCountry.code}/${$userInfo.company.ruc}/fb?status=1&subsidiaryId=${$userInfo.comSubsidiariesId}`
						"
						return-object
						select-create
						@return-data="setAccount({ model: 'account', value: $event })"
					></autocomplete-component>
				</v-flex>
				<v-flex xs12 mb-2>
					<app-input-text
						ref="concept"
						label="Concepto"
						model="concept"
						:text="model.concept"
						@input="getValue"
						@input-enter="focusNext('beneficiary')"
					/>
				</v-flex>
				<v-flex xs12 mb-2>
					<app-input-text
						ref="beneficiary"
						label="Beneficiario"
						model="beneficiary"
						:text="model.additionalInformation.beneficiary"
						@input="getValue"
						@input-enter="focusNext('reference')"
					/>
				</v-flex>
				<v-flex xs12 mb-2>
					<app-input-text
						ref="reference"
						label="Referencia"
						model="reference"
						:text="model.reference"
						@input="getValue"
					/>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || loading || loadImage"
					:on-run-service="loading"
					@cancel-button-clicked="close"
					@accept-button-clicked="$emit('save', model, codeTransaction)"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import VueSixFour from 'vue-six-four';
import { format } from 'date-fns';
import { minValue, required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typeTransaction from '@/shared/type-transaction';

function created() {
	this.loadResources();
	if (this.$route.params) {
		this.model.bankAccountId = this.$route.params.bankAccountId;
	}
}

function mounted() {
	this.$nextTick(() => {
		const paymentDateRef = this.$refs.paymentDate;
		if (paymentDateRef) {
			if (paymentDateRef.$el) {
				const input = paymentDateRef.$el.querySelector('input');
				if (input) {
					input.focus();
				}
			}
		}
	});
}

function close() {
	this.onDate();
	this.setDate();
	this.$emit('close');
}

function getData({ model, value }) {
	if (value) {
		this.model[model] = value.id;
		// if (model === 'typeTransactionBankId') {
		// 	this.codeTransaction = value.code;
		// 	if (this.model.documentNumber !== '' && this.codeTransaction === 'CH') {
		// 		this.searchingDocument(this.model.documentNumber);
		// 	}
		// }
		if (model === 'typeMovement') {
			this.model.typeTransactionBankId = this.transactions.find(
				(t) => t.typeMovement === value.id
			).id;
		}
	}
}

async function getFile(fileInfo) {
	this.loadImage = true;
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
			this.model.urlImage = file.Location;
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadImage = false;
	}
}

function getValue({ model, value }) {
	if (model === 'beneficiary') {
		this.model.additionalInformation[model] = value;
	} else {
		this.model[model] = value;
	}
	if (
		model === 'documentNumber' &&
		this.codeTransaction === 'CH' &&
		value.trim() !== ''
	) {
		this.searchingDocument(value);
	}
}

async function loadResources() {
	const { configIntegrations } = this.$userInfo.subsidiary;
	const { accountingPlan, accountingConfiguration } = configIntegrations || {};
	const valueValid = accountingPlan || accountingConfiguration;
	this.showIntegrations = valueValid ? !!valueValid.flagConfig : false;
	const params = {
		moduleCode: 'BANCO',
		flagType: 1,
	};
	const request = [
		this.$httpSales.get('module'),
		this.$httpSales.get('bank-account'),
		this.$httpSales.get('type-transaction-bank'),
		this.$httpSales.get('type-movement'),
		this.$httpSales.get('type-payments', { params }),
	];
	[
		{ data: this.modules },
		{ data: this.bankAccounts },
		{ data: this.transactions },
		{ data: this.typeMovements },
		{ data: this.typePayments },
	] = await Promise.all(request);
	this.typePayments = this.typePayments.map((tp) => tp.paymentType);
	if (this.showIntegrations) {
		this.loadAccounts();
	}
	this.moduleOriginId = this.modules.find((m) => m.code === 'BANCO').id;
	this.model.typeTransaction = typeTransaction.Normal;
	this.model.typeMovement = this.typeMovements.find((tm) => tm.code === 'income').id;
	this.model.typeTransactionBankId = this.transactions.find(
		(t) => t.typeMovement === this.model.typeMovement
	).id;
	this.model.typePaymentId = this.typePayments.find(
		(tp) => tp.code === 'deposito-bancario'
	).id;
	this.model.bankAccountId = this.bankAccounts[0].id;
}

async function loadAccounts() {
	const params = {
		status: 1,
	};
	try {
		({
			data: this.autocompleteItems,
		} = await this.$httpQuipu.get(
			`accounting-accounts/${this.labelsByCountry.code}/${this.$userInfo.company.ruc}/fb`,
			{ params }
		));
		this.autocompleteItems = this.autocompleteItems.map((item) => {
			const newItem = { ...item };
			newItem.autocomplete = `${item.code} ${item.name}`;
			return newItem;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function onDate(value) {
	this.model.paymentDate = value;
}

function setDate({ model, value }) {
	if (model === 'paymentDate') {
		this.model.paymentDate = format(value, 'YYYY-MM-DD');
	} else {
		this.model.paymentDate = format(value, 'YYYY-MM-DD');
	}
}

function focusNext(refName) {
	const element = this.$refs[refName];
	if (element) {
		if (typeof element.focus === 'function') {
			element.focus();
		} else if (element.$el) {
			const input = element.$el.querySelector('input');
			if (input) {
				input.focus();
			} else if (typeof element.$el.focus === 'function') {
				element.$el.focus();
			}
		}
	}
}

function showDialog() {
	this.$refs.label.click();
}

async function searchingDocument(value) {
	try {
		const { data: response } = await this.$httpSales.get(`/check/${value}/number`);
		if (typeof response === 'object') {
			if (response.status.code === 'COB' || response.status.code === 'ANU') {
				const message =
					response.status.code === 'COB'
						? 'El cheque está cobrado'
						: 'El cheque se encuentra anulado';
				this.showNotification(message, 'info');
				this.clearForm();
			} else {
				this.model.bankAccountId = response.bankAccountId;
				this.model.amount = response.amount;
				this.model.additionalInformation.beneficiary = response.personName;
				this.model.reference = response.description;
				this.model.urlImage = response.urlImage;
				const date = response.checkDate
					? helper.exactDate(response.checkDate, 'YYYY-MM-DD')
					: null;
				if (date && date !== 'Invalid Date') {
					this.model.paymentDate = response.checkDate
						? helper.exactDate(response.checkDate, 'YYYY-MM-DD')
						: null;
				}
			}
		} else {
			this.clearForm();
		}
	} catch (err) {
		if (err.data.statusCode === 400) {
			if (err.data.message === 'CHECK_NOT_EXIST') {
				this.showGenericError('No existe cheque');
			}
		} else {
			this.showGenericError('Ocurrió un error al intentar ingresar la productos');
		}
	}
}

function clearForm() {
	this.model.bankAccountId = null;
	this.model.amount = null;
	this.model.paymentDate = null;
	this.model.additionalInformation.beneficiary = '';
	this.model.reference = '';
	this.model.urlImage = null;
}

function validations() {
	return {
		model: {
			amount: { required },
			bankAccountId: {
				minValue: minValue(1),
				required,
			},
			documentNumber: {
				required,
			},
			typeTransactionBankId: {
				minValue: minValue(1),
				required,
			},
			paymentDate: { required },
			typeMovement: {
				minValue: minValue(1),
				required,
			},
		},
	};
}

function setAccount({ model, value }) {
	if (value) {
		this.model.additionalInformation[model] = value.code;
		this.accountName = value.name;
	} else {
		this.accountName = null;
	}
}

function data() {
	return {
		accountName: '',
		allowedFiles: ['jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt'],
		autocompleteItems: [],
		bankAccounts: [],
		model: {
			additionalInformation: {
				account: '',
				beneficiary: '',
			},
			amount: null,
			bankAccountId: null,
			concept: '',
			documentNumber: '',
			paymentAmount: null,
			paymentDate: null,
			reference: '',
			typeTransaction: null,
			typeTransactionBankId: null,
			urlImage: null,
			typeMovement: null,
		},
		moduleOriginId: null,
		modules: [],
		transactions: [],
		codeTransaction: null,
		loadImage: false,
		showIntegrations: false,
		typeMovements: [],
		typePayments: [],
	};
}

function dateFormattedVisual() {
	return this.model.paymentDate ? format(this.model.paymentDate, 'DD-MM-YYYY') : null;
}

export default {
	name: 'bank-movements-form',
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	created,
	mounted,
	data,
	methods: {
		clearForm,
		close,
		getData,
		getFile,
		getValue,
		focusNext,
		loadAccounts,
		loadResources,
		onDate,
		searchingDocument: helper.debounce(searchingDocument),
		setAccount,
		setDate,
		showDialog,
	},
	computed: {
		dateFormattedVisual,
	},
	props: {
		loading: {
			default: false,
			type: Boolean,
		},
	},
	validations,
};
</script>
