<template>
	<div class="white pb-2 bank-details">
		<v-layout wrap align-center px-4 primary lighten-1 white--text class="header-details">
			<v-flex xs6 text-xs-left>
				<p>{{ data.documentNumber }}</p>
			</v-flex>
			<v-flex xs5 text-xs-right class="amount-text">
				<p>{{ data.bankAccount.currencySymbol }} {{ data.amount }}</p>
			</v-flex>
			<v-flex xs1 text-xs-right>
				<app-tooltip-button
					color="white"
					height="25"
					icon="close"
					text="Cerrar"
					@click-icon="$emit('close')"
				/>
			</v-flex>
		</v-layout>
		<v-flex xs12 px-4 mt-2>
			<p class="primary--text mb-0 pl-1">
				Código de Asiento:
				<span class="border-bottom bold" v-if="true" @click="$emit('show-detail', data)">
					{{ data.accountingAccount ? data.accountingAccount.code : null }}
				</span>
				<span class="input--text" v-else> Aún no se contabiliza. </span>
			</p>
		</v-flex>
		<v-layout class="title-details" wrap align-center mx-4 px-2 pt-2>
			<v-flex xs6>
				<p class="primary--text">
					{{ data.employee ? data.employee.fullname : null }}
				</p>
			</v-flex>
		</v-layout>
		<v-layout wrap pa-3>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					:label="`Cta. ${data.bank ? data.bank.name : 'Banco Origen'}`"
					:text="data.bankAccount.accountNumber"
					readonly
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1 v-if="!flagOutbox">
				<app-date-select
					label="Fecha"
					:date-formatted="data.paymentDate"
					model="paymentDate"
					:readonly="!isBank"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1 v-if="!flagOutbox">
				<app-select
					:item="data.typePayment.id"
					:items="typePayments"
					item-text="name"
					item-value="id"
					label="Tipo de Pago"
					readonly
					model="typePaymentId"
					@input="getData"
					v-if="!isBank"
				/>
				<app-select
					v-else
					:item="data.typeTransactionBankId"
					:items="transactions"
					item-text="name"
					item-value="id"
					label="Tipo de Transacción"
					model="typeTransactionBankId"
					@input="getData"
					return-object
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1 v-if="!flagOutbox">
				<app-input-text
					label="Importe"
					:text="data.amount"
					:readonly="!isBank"
					model="amount"
					@input="getData"
					type="number"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Concepto"
					:text="data.concept"
					:readonly="!isBank || flagOutbox"
					model="concept"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1 v-if="$userInfo.company.settings.flagShowAccountingEngine">
				<autocomplete-component
					v-if="data.additionalInformation"
					append-icon="search"
					class="cost-center-account"
					select-column="4"
					disabled-column="8"
					disabled-class="accounting-input-disabled"
					http-code="$httpQuipu"
					:item="data.additionalInformation.account"
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
					:resource-url="`accounting-accounts/${labelsByCountry.code}/${$userInfo.company.ruc}/fb?status=1&subsidiaryId=${$userInfo.comSubsidiariesId}`"
					return-object
					select-create
					@return-data="getData({ model: 'account', value: $event })"
				></autocomplete-component>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					label="Beneficiario"
					v-if="data.additionalInformation"
					:text="data.additionalInformation.beneficiary"
					:readonly="!isBank"
					model="additionalInformation"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					v-if="!flagOutbox"
					label="Asiento"
					:text="data.accountingSeatCode"
					readonly
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-select
					:item="data.moduleOrigin.id"
					:items="modules"
					item-text="name"
					item-value="id"
					label="Origen"
					readonly
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-select
					:item="data.typeMovement"
					:items="typeMovement"
					item-text="name"
					item-value="id"
					label="Tipo de Movimiento"
					readonly
					model="typeMovement"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					:text="data.bankAccount.accountNumber"
					label="Documento de Origen"
					readonly
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-date-select
					label="Fecha de conciliación"
					:date-formatted="data.dateBankReconcilement"
					readonly
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text
					:text="data.reference"
					label="Referencia"
					:readonly="!isBank"
					model="reference"
					@input="getData"
				/>
			</v-flex>
			<v-flex xs6 px-2 mb-1>
				<app-input-text label="Cta. Banco Destino" readonly />
			</v-flex>
			<v-flex xs12 px-2 mb-1 v-if="data.documentNumber">
				<app-input-text
					label="Número de Documento"
					:text="data.documentNumber"
					readonly
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1 v-if="data.documents && data.documents.length">
				<span class="font-12">Número de Documentos</span><br />
				<div class="document-list">
					<span v-for="(d, index) in data.documents" :key="index" class="document-item">{{
						d
					}}</span>
				</div>
			</v-flex>
		</v-layout>
		<v-layout my-4 justify-center v-if="isBank">
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="error"
					class="btn-action mr-2"
					@click="$emit('close')"
				>
					Cancelar
				</v-btn>
				<v-btn type="button" color="success" class="btn-action ml-2" @click="save">
					Guardar
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout my-4 justify-center v-if="!flagOutbox">
			<v-flex xs10>
				<label :ref="`label-${data.id}`" :for="`upload-file-${data.id}}`">
					<vue-six-four :id="`upload-file-${data.id}}`" hidden @vue-six-four="getFile" />
					<v-layout wrap>
						<v-flex xs10>
							<app-input-text label="Actualizar imagen" readonly :text="data.urlImage" />
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
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import { format } from 'date-fns';
import appSelect from '@/components/shared/app-select';
import appDateSelect from '@/components/shared/app-date-select';

function created() {
	if (this.isEcuador) {
		const typeTransactionBankId = this.data.typeTransactionBankId;
		const typeTransactionBankIdValidationBank =
			typeTransactionBankId === 5 || typeTransactionBankId === 7;
		this.data.typeMovement = typeTransactionBankIdValidationBank ? 1 : 2;
	} else {
		const typeTransactionBankPeru = this.data.typeTransactionBankId;
		const typeTransactionBankIdValidationPeru =
			typeTransactionBankPeru === 1 || typeTransactionBankPeru === 3;
		this.data.typeMovement = typeTransactionBankIdValidationPeru ? 1 : 2;
	}
	if (this.$userInfo.company.settings.flagShowAccountingEngine) {
		this.loadAccounts();
	}
}

function isBank() {
	return (
		this.data.moduleOrigin.code === 'BANCO' || this.data.moduleOrigin.code === 'CAJA'
	);
}

function getData({ model, value }) {
	if (model === 'additionalInformation') {
		this.model.additionalInformation.beneficiary = value;
	} else if (model === 'account' && value) {
		this.model.additionalInformation.account = value.code;
		this.accountName = value.name;
	} else if (model === 'typePaymentId' || model === 'typeMovement') {
		this.model[model] = value.id;
	} else if (model === 'paymentDate') {
		this.data[model] = format(value, 'YYYY-MM-DD');
	} else if (model === 'typeTransactionBankId') {
		this.model[model] = value.id;
		this.data.typeMovement = value.code === 'CH' || value.code === 'ND' ? 2 : 1;
	} else {
		this.model[model] = value;
	}
}

async function save() {
	const amount = this.model.amount || this.data.amount;
	const typeMovement = this.model.typeMovement || this.data.typeMovement;
	let additionalInformation = null;
	let reference = null;
	if (
		((this.data.additionalInformation.beneficiary &&
			this.data.additionalInformation.beneficiary !== '') ||
			(this.model.additionalInformation.beneficiary &&
				this.model.additionalInformation.beneficiary !== '')) &&
		((this.data.additionalInformation.account &&
			this.data.additionalInformation.account !== '') ||
			(this.model.additionalInformation.account &&
				this.model.additionalInformation.account !== ''))
	) {
		additionalInformation = {
			beneficiary:
				this.model.additionalInformation.beneficiary ||
				this.data.additionalInformation.beneficiary,
			account:
				this.model.additionalInformation.account ||
				this.data.additionalInformation.account,
		};
	} else if (
		(this.data.additionalInformation.account &&
			this.data.additionalInformation.account !== '') ||
		(this.model.additionalInformation.account &&
			this.model.additionalInformation.account !== '')
	) {
		additionalInformation = {
			account:
				this.model.additionalInformation.account ||
				this.data.additionalInformation.account,
		};
	} else if (
		(this.data.additionalInformation.beneficiary &&
			this.data.additionalInformation.beneficiary !== '') ||
		(this.model.additionalInformation.beneficiary &&
			this.model.additionalInformation.beneficiary !== '')
	) {
		additionalInformation = {
			beneficiary:
				this.model.additionalInformation.beneficiary ||
				this.data.additionalInformation.beneficiary,
		};
	}
	if (this.model.reference !== '' && this.data.reference !== '') {
		reference = this.model.reference || this.data.reference;
	}

	const body = {
		additionalInformation: additionalInformation || undefined,
		reference,
		concept: this.model.concept || this.data.concept,
		outboxEnabled: this.flagOutbox || undefined,
		eventId: this.data?.accTransactionEventId || undefined,
	};
	if (!this.flagOutbox) {
		body.amount = Number(amount);
		body.paymentAmount = Number(amount);
		body.typePaymentId = this.model.typePaymentId || this.data.typePaymentId;
		body.typeTransactionBankId =
			this.model.typeTransactionBankId || this.data.typeTransactionBankId;
		body.paymentDate = this.data.paymentDate;
		body.typeMovement = typeMovement;
	}
	try {
		await this.$httpSales.patch(`transaction-bank/${this.data.id}`, body);
		this.$emit('update');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'TRANSACTION_NOT_FOUND') {
				this.showGenericError('No existe transacción');
			} else if (error.data.message === 'TRANSACTION_UPDATE_MODULE_INVALID') {
				this.showGenericError('Enviar importe valido.');
			}
		} else {
			this.showGenericError();
		}
	}
}

async function loadAccounts() {
	const params = {
		status: 1,
	};
	try {
		({ data: this.autocompleteItems } = await this.$httpQuipu.get(
			`accounting-accounts/${this.labelsByCountry.code}/${this.$userInfo.company.ruc}/fb`,
			{ params }
		));
		this.autocompleteItems = this.autocompleteItems.map((item) => {
			const newItem = { ...item };
			newItem.autocomplete = `${item.code} ${item.name}`;
			return newItem;
		});
		const accountSelected = this.autocompleteItems.find(
			(ai) => ai.code === this.data.additionalInformation.account
		);
		this.accountName = accountSelected ? accountSelected.name : null;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError('Error del servidor');
		}
	}
}

function data() {
	return {
		accountName: null,
		autocompleteItems: [],
		model: {
			additionalInformation: {
				account: null,
				beneficiary: null,
			},
			reference: null,
			concept: null,
			typeMovement: null,
			typePaymentId: null,
			amount: null,
		},
	};
}

export default {
	name: 'bank-details',
	created,
	components: {
		appSelect,
		appDateSelect,
		VueSixFour,
	},
	computed: {
		isBank,
	},
	data,
	methods: {
		getData,
		loadAccounts,
		save,
		showDialog() {
			this.$refs[`label-${this.data.id}`].click();
		},
		async getFile(fileInfo) {
			const allowedFiles = ['jpg', 'jpeg', 'png'];
			console.log('getFile');
			const newFile = {
				name: fileInfo.name.replace(/\s/g, '-'),
				base64data: fileInfo.sixFour,
			};
			try {
				const words = newFile.name.split('.');
				const lastItem = words.length;
				const extension = words[lastItem - 1];
				if (allowedFiles.indexOf(extension) > -1) {
					const { data: file } = await this.$httpProduction.post('upload-files', newFile);
					this.data.urlImage = file.Location;
					// this.$emit('update', { urlImage: file.Location });
					this.update({ urlImage: file.Location });
				} else {
					this.showNotification(
						`Archivo no válido, solo se permite ${allowedFiles.join(',')}`,
						'warning'
					);
				}
			} catch (error) {
				console.log(error);
				this.showGenericError();
			}
		},
		async update(body) {
			try {
				await this.$httpSales.patch(`transaction-bank/${this.data.id}/simple`, body);
				this.showNotification(
					'La imagen del documento ha sido actualizado correctamente.'
				);
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	props: {
		modules: {
			type: Array,
			default: () => [],
		},
		data: {
			type: Object,
			default: () => {},
		},
		typePayments: {
			type: Array,
			default: () => [],
		},
		typeMovement: {
			type: Array,
			default: () => [],
		},
		transactions: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
<style lang="scss" scoped>
.header-details {
	font-family: font(open-semibold);
	font-size: size(medium);
	height: 71px;
}

.title-details {
	border-bottom: 1px solid color(blue-grey);
	font-family: font(open-bold);
	font-size: size(medium);
}

.amount-text {
	font-family: font(open-bold);
	font-size: size(medium20);
	padding-right: 1rem;
}

.bank-details {
	height: 90vh;
	margin: 0px 20px;
}

.bold {
	font-weight: bold;
}

.border-bottom {
	border-bottom: 1px solid #3ab2b6;
	cursor: pointer;
}

.font-12 {
	font-size: 12px;
}

.document-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px; /* Espacio entre los documentos */
	margin-top: 8px;
}

.document-item {
	background-color: #f5f5f5; /* Fondo claro para cada documento */
	padding: 6px 12px;
	border-radius: 4px;
	font-size: 14px;
	color: #333; /* Color oscuro para texto */
	border: 1px solid #ddd; /* Borde suave */
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.font-12 {
	font-size: 12px;
	color: #555;
	font-weight: bold;
}
</style>
