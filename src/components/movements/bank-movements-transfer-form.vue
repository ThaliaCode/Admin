<template>
	<div class="bank-to-bank">
		<v-form method="post" @submit.prevent="$emit('save', model)">
			<v-layout wrap px-4 pt-4>
				<v-flex xs12 mb-2>
					<app-select
						:item="model.bankAccountId"
						item-text="name"
						item-value="id"
						:items="bankAccounts"
						label="Cta. Bancaria de Origen"
						model="bankAccountId"
						@input="getData"
					/>
					<span class="form-group__message" v-if="$v.model.bankAccountId.$invalid">
						La cuenta bancaria de origen es requerida
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<label class="caption">Fecha</label>
					<date-component
						:date="dateWithOutFormat"
						icon="/static/img/calendar.svg"
						@on-input="setDate({ model: 'dateWithOutFormat', value: $event })"
					></date-component>
					<span class="form-group__message" v-if="$v.model.paymentDate.$invalid">
						La fecha de transferencia es requerida
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pl-2>
					<app-select
						disabled
						:item="model.typeTransactionBankId"
						item-text="name"
						item-value="id"
						:items="transactions"
						label="Tipo de Pago"
						readonly
						@input="getData"
					/>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-input-text
						label="Nro de Documento"
						model="documentNumber"
						:text="model.documentNumber"
						@input="getValue"
					/>
					<span class="form-group__message" v-if="$v.model.documentNumber.$invalid">
						El número de documento es requerido
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pl-2>
					<app-input-text
						type="number"
						label="Importe"
						model="amount"
						:text="model.amount"
						@input="getValue"
					/>
					<span class="form-group__message" v-if="$v.model.amount.$invalid">
						El importe es requerido
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-input-text
						label="Concepto"
						model="concept"
						:text="model.concept"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pl-2>
					<app-input-text
						label="Beneficiario"
						model="beneficiary"
						:text="model.additionalInformation.beneficiary"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<app-input-text
						label="Referencia"
						model="reference"
						:text="model.reference"
						@input="getValue"
					/>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pl-2 class="pos-relative">
					<template v-if="externalBankAccountActive">
						<app-tooltip-button
							class="btn-return-select"
							color="secondary"
							icon="fact_check"
							text="Seleccionar una cta. bancaria"
							@click-icon="showInput"
						></app-tooltip-button>
						<app-input-text
							label="Cta. Bancaria Destino"
							model="bankAccountExternal"
							:text="model.bankAccountExternal"
							type="number"
							@input="getData"
						></app-input-text>
					</template>
					<template v-else>
						<autocomplete-component
							append-icon="expand_more"
							http-code="$httpSales"
							:item="model.bankDestinationId"
							item-text="name"
							item-value="id"
							:items="filteredBankAccounts"
							label-value="Cta. Bancaria Destino"
							model="bankDestinationId"
							new-register-text="Ingresar cta. bancaria externa"
							:on-clean="cleanData"
							placeholder="Seleccionar Cta. Bancaria Destino"
							prop="name"
							resource-url="bank-account"
							return-object
							select-create
							@new-register="showInput"
							@return-data="getData"
						></autocomplete-component>
					</template>
					<!-- <app-select
						:item="model.bankDestinationId"
						item-text="name"
						item-value="id"
						:items="filteredBankAccounts"
						label="Cta. Bancaria Destino"
						model="bankDestinationId"
						@input="getData"
					/> -->
					<span
						class="form-group__message"
						v-if="
							$v.model.bankDestinationId.$invalid || $v.model.bankAccountExternal.$invalid
						"
					>
						La cta. destino es requerida
					</span>
				</v-flex>
				<v-flex xs12 sm6 mb-2 pr-2>
					<label ref="label" for="upload-file">
						<vue-six-four id="upload-file" hidden @vue-six-four="getFile" />
						<v-layout wrap>
							<v-flex xs10>
								<app-input-text
									label="Adjuntar Voucher"
									readonly
									:disabled="loadImage"
									:text="model.urlImage"
								/>
							</v-flex>
							<v-flex xs2 mt-4 text-xs-left>
								<v-btn @click="showDialog" class="ma-0 pl-0 btn-auto" small color="pink">
									<v-icon color="white">attach_file</v-icon>
								</v-btn>
							</v-flex>
						</v-layout>
					</label>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.model.$invalid || loading || loadImage"
					:on-run-service="loading"
					@cancel-button-clicked="close"
					@accept-button-clicked="$emit('save', model)"
				/>
			</section>
		</v-form>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import { minValue, required, requiredIf } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typeTransaction from '@/shared/type-transaction';
import typeTransactionBank from '@/shared/type-transaction-bank';
import dateComponent from '@/components/shared/date-component';

function created() {
	this.loadResources();
}

function close() {
	this.setDate();
	this.$emit('close');
}

function getData(dataExist) {
	if (dataExist) {
		const { model, value } = dataExist;
		this.model[model] = model === 'bankAccountExternal' ? value : value.id;
		if (model === 'bankAccountId') {
			this.filteredBankAccounts = this.bankAccounts.filter((ba) => ba.id !== value.id);
			this.model.bankDestinationId =
				this.model.bankDestinationId === value.id ? null : this.model.bankDestinationId;
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
}

async function loadResources() {
	const request = [
		this.$httpSales.get('module'),
		this.$httpSales.get('bank-account'),
		this.$httpSales.get('type-transaction-bank'),
		this.$httpSales.get('type-movement'),
	];
	[
		{ data: this.modules },
		{ data: this.bankAccounts },
		{ data: this.transactions },
		{ data: this.typeMovements },
	] = await Promise.all(request);
	const typeTransactionBankItem =
		this.transactions.find((item) => item.code === typeTransactionBank.DebitNote) || {};
	const newBankAccount = {
		id: 0,
		btn: true,
		name: this.bankAccounts.reduce((a, ba) => a.concat(ba.name), ''),
	};
	this.bankAccounts.push({ ...newBankAccount });
	this.filteredBankAccounts = [...this.bankAccounts];
	this.moduleOriginId = this.modules.find((m) => m.code === 'BANCO').id;
	this.model.typeMovement = this.typeMovements.find((tp) => tp.code === 'expenses').id;
	this.model.typeTransaction = typeTransaction.ToBank;
	this.model.typeTransactionBankId = typeTransactionBankItem.id;
}

function onDate(value) {
	this.date = value;
	this.model.paymentDate = value;
}

function setDate({ value }) {
	console.log('input', value);
	this.dateWithOutFormat = value;
	this.onDate(value);
}

function showDialog() {
	this.$refs.label.click();
}

function showInput(model) {
	this.externalBankAccountActive = model === 'bankDestinationId';
}

function validations() {
	return {
		model: {
			amount: { required },
			bankAccountId: {
				minValue: minValue(1),
				required,
			},
			bankDestinationId: {
				minValue: minValue(1),
				required: requiredIf(() => !this.externalBankAccountActive),
			},
			bankAccountExternal: {
				required: requiredIf(() => this.externalBankAccountActive),
			},
			documentNumber: {
				required,
			},
			typeTransactionBankId: {
				minValue: minValue(1),
				required,
			},
			paymentDate: { required },
		},
	};
}

function data() {
	return {
		allowedFiles: ['jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt'],
		bankAccounts: [],
		cleanData: false,
		date: null,
		dateWithOutFormat: null,
		externalBankAccountActive: false,
		filteredBankAccounts: [],
		model: {
			additionalInformation: {
				beneficiary: '',
			},
			amount: null,
			bankAccountId: null,
			bankDestinationId: null,
			bankAccountExternal: null,
			documentReference: null,
			concept: '',
			documentNumber: '',
			paymentAmount: null,
			paymentDate: null,
			reference: '',
			typeMovement: null,
			typeTransaction: null,
			typeTransactionBankId: null,
			urlImage: null,
		},
		moduleOriginId: null,
		modules: [],
		transactions: [],
		typeMovements: [],
		loadImage: false,
	};
}

export default {
	name: 'bank-movements-transfer-form',
	components: {
		modalSidebarButton,
		VueSixFour,
		dateComponent,
	},
	created,
	data,
	methods: {
		close,
		getData,
		getFile,
		getValue,
		loadResources,
		onDate,
		setDate,
		showDialog,
		showInput,
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
<style lang="scss" scoped>
.pos-relative {
	position: relative !important;
}
</style>
