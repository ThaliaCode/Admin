<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 mb-3>
				<app-date-mask
					label="Fecha"
					v-model="paymentDate"
					@format-date="setData({ model: 'paymentDate', value: $event })"
				>
				</app-date-mask>
				<span class="form-group__message" v-if="!$v.model.paymentDate.required">
					La fecha es requerida.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Tipo de Moneda"
					:items="currencies"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					v-model="model.currency"
					class="filter-select"
				></v-select>
				<span class="form-group__message" v-if="!$v.model.currency.required">
					El tipo de moneda es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Origen"
					:items="modules"
					single-line
					item-text="name"
					item-value="id"
					bottom
					hide-details
					v-model="model.moduleOriginId"
					class="filter-select"
				></v-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Tipo de Pago"
					:items="typePayments"
					single-line
					item-text="paymentType.name"
					item-value="paymentType.id"
					bottom
					hide-details
					v-model="model.typePaymentId"
					class="filter-select"
				></v-select>
				<span class="form-group__message" v-if="!$v.model.typePaymentId.required">
					El tipo de pago es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="Importe"
					v-model="model.amount"
					type="number"
				>
				</v-text-field>
				<span class="form-group__message" v-if="!$v.model.amount.required">
					El importe es requerido.
				</span>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-select
					label="Cuenta Bancaria"
					:items="bankAccounts"
					single-line
					item-text="name"
					item-value="id"
					v-model="model.bankAccountId"
					bottom
					hide-details
					class="filter-select"
					disabled
				></v-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="filter-select"
					label="# OPERACIÓN"
					v-model="model.documentNumber"
				>
				</v-text-field>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-date-mask
					label="Fecha de Deposito"
					v-model="dateReference"
					@format-date="setData({ model: 'dateReference', value: $event })"
				>
				</app-date-mask>
			</v-flex>
			<v-flex xs12 mb-3>
				<label ref="label" for="upload-image" class="w-100">
					<vue-six-four id="upload-image" hidden @vue-six-four="getFileUpdate"/>
					<v-layout wrap>
						<v-flex xs9 mt-1 pr-2>
							<app-input-text
								label="Adjuntar Foto"
								readonly
								:text="model.urlImage"
							/>
						</v-flex>
						<v-flex xs3 mt-4 text-xs-center>
							<button 
								@click="showDialog"
								class="btn-upload mt-1">Adjuntar</button>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					class="textarea-content filter-select mt-3"
					label="Comentario"
					v-model="model.additionalInformation.comment"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="createEntry"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required } from 'vuelidate/lib/validators';
import { format } from 'date-fns';
import VueSixFour from 'vue-six-four';

function created() {
	this.model.bankAccountId = this.bankAccountId;
	this.loadTypePaymentsBank();
}

function setData({ model, value }) {
	if (model === 'paymentDate') {
		this.model[model] = value;
	} else {
		this.model.additionalInformation[model] = value;
	}
}
async function createEntry() {
	this.model.amount = this.type === 'new-entry-bank' ? Number(this.model.amount) : Number(this.model.amount) * -1;
	this.model.paymentDate = format(this.model.paymentDate, 'YYYY-MM-DD');
	this.model.paymentAmount = this.model.amount;
	this.model.typeMovement = this.type === 'new-entry-bank' ? 1 : 2;
	const index = this.typePayments.findIndex(t => t.comTypePaymentId === this.model.typePaymentId);
	if (index > -1) {
		this.model.typeTransactionBankId =
			this.typePayments[index].paymentType.typeTransactionBankId || 1;
	}
	try {
		await this.$httpSales.post('transaction-bank', this.model);
		this.$emit('update-bank');
	} catch (error) {
		this.showGenericError();
	}
}
function showDialog() {
	this.$refs.label.click();
}


async function loadTypePaymentsBank() {
	const { data: typePaymentsBank } = await this.$httpSales.get('type-payments?flagType=2');
	this.typePayments = typePaymentsBank;
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
			this.model.urlImage = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	}
}
function validations() {
	return {
		model: {
			amount: { required },
			paymentDate: { required },
			currency: { required },
			typePaymentId: { required },
		},
	};
}
function data() {
	return {
		model: {
			amount: null,
			bankAccountId: null,
			currency: null,
			moduleOriginId: null,
			typePaymentId: null,
			documentNumber: null,
			paymentDate: null,
			typeTransaction: 1,
			typeMovement: 1,
			additionalInformation: {
				dateReference: null,
				comment: null,
			},
			urlImage: null,
			typeTransactionBankId: null,
		},
		paymentDate: null,
		dateReference: null,
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		typePayments: [],
	};
}
export default {
	name: 'new-entry-bank',
	data,
	created,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	methods: {
		setData,
		createEntry,
		showDialog,
		getFileUpdate,
		loadTypePaymentsBank,
	},
	props: {
		currencies: {
			default: () => [],
			type: Array,
		},
		modules: {
			default: () => [],
			type: Array,
		},
		bankAccounts: {
			default: () => [],
			type: Array,
		},
		bankAccountId: [String, Number],
		type: String,
	},
	validations,
};
</script>
<style lang="scss" scoped>
	.btn-upload {
		background: map-get($colors, primary);
		border-radius: 5px;
		color: map-get($colors, white);
		font-size: 10px;
        height: 29px;
		width: 100%;
	}
</style>