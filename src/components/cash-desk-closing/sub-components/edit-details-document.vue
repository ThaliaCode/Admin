<template>
	<div>
		<v-layout wrap mt-3>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Código</v-flex>
					<v-flex class="c-text-green">{{ detail.code || '---' }}</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Doc. Origen</v-flex>
					<v-flex class="c-text-green">{{ detail.documentNumberOrigin }}</v-flex>
					<span class="text-not-code-blank" v-if="checkBlankCode(detail.code)">
						No se permite espacios en blanco
					</span>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Fecha</v-flex>
					<v-flex class="c-text-green">
						<span v-if="!isCashOrBank">{{ detail.paymentDate }}</span>
						<app-date-select
							v-else
							:date-formatted="detail.paymentDate"
							model="paymentDate"
							:readonly="!isCashOrBank"
							@input="getData"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Referencia</v-flex>
					<v-flex class="c-text-green">
						<span v-if="isNotCashOrigin">{{ detail.reference }}</span>
						<app-input-text
							v-else
							model="reference"
							:readonly="isNotCashOrigin"
							:text="detail.reference"
							@input="getData"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Comentario</v-flex>
					<v-flex class="c-text-green">
						<span>
							{{ detail.additionalInformation && detail.additionalInformation.comment }}
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Asiento</v-flex>
					<v-flex class="c-text-green">
						<span
							@click="$emit('show-detail', detail.accountingSeat)"
							v-if="detail.accountingSeatCode"
							class="link"
						>
							{{ detail.accountingSeatCode }}
						</span>
						<span v-else>---</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Concepto</v-flex>
					<v-flex class="c-text-green">
						<span v-if="isNotCashOrigin">{{ detail.concept }}</span>
						<app-input-text
							v-else
							model="concept"
							:readonly="isNotCashOrigin"
							:text="detail.concept"
							@input="getData"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Origen</v-flex>
					<v-flex class="c-text-green">
						{{ detail.module ? detail.module.name : null }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">{{ entityName }}</v-flex>
					<v-flex class="c-text-green">
						<span v-if="isNotCashOrigin || entityName !== 'Beneficiario'">{{
							detail.entityExternalData.fullName ||
							detail.entityExternalData.beneficiary ||
							(detail.additionalInformatio && detail.additionalInformation.beneficiary) ||
							'-'
						}}</span>
						<app-input-text
							v-else
							:text="
								(detail.entityExternalData &&
									(detail.entityExternalData.fullName ||
										detail.entityExternalData.beneficiary)) ||
								(detail.additionalInformation && detail.additionalInformation.beneficiary)
							"
							:readonly="isNotCashOrigin || entityName !== 'Beneficiario'"
							v-model="beneficiary"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Importe</v-flex>
					<v-flex class="c-text-green">
						<span v-if="isNotCashOrigin">{{ detail.paymentAmount }}</span>
						<app-input-text
							v-else
							:text="detail.paymentAmount"
							:readonly="isNotCashOrigin"
							model="amount"
							@input="getData"
							type="number"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1 v-if="isADeposit">
				<v-layout>
					<v-flex class="content-green">Depósito</v-flex>
					<v-flex class="c-text-green">{{ detail.documentNumber }}</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Tipo</v-flex>
					<v-flex class="c-text-green">
						<span v-if="detail.paymentMethodId">
							<span v-if="isNotCashOrigin">
								{{ detail.paymentMethod ? detail.paymentMethod.name : null }}
							</span>
							<app-select
								v-else
								:item="detail.paymentMethodId"
								item-text="name"
								item-value="id"
								:items="paymentsMethods"
								:readonly="isNotCashOrigin"
							/>
						</span>
						<span v-else>
							<span v-if="isNotCashOrigin">{{ detail.typeMovementName }}</span>
							<app-select
								v-else
								:item="detail.typeMovement"
								item-text="name"
								item-value="id"
								:items="typeMovements"
								label="Tipo de Movimiento"
								:readonly="isNotCashOrigin"
								@input="changeMovement"
							/>
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1 v-if="isADeposit">
				<v-layout>
					<v-flex class="content-green">Fecha de Depósito</v-flex>
					<v-flex class="c-text-green">
						<app-date-select
							:date-formatted="additionalInformation.dateReference"
							label="Fecha de Depósito"
							model="dateReference"
							:readonly="isNotCashOrigin"
							@input="getDate"
						/>
					</v-flex>
				</v-layout>
			</v-flex>

			<v-flex xs12 mb-2 body-1>
				<v-layout>
					<v-flex class="content-green">Tipo de Pago</v-flex>
					<v-flex class="c-text-green">
						<span v-if="isNotCashOrigin">
							{{ detail.typeMovement ? detail.typeMovement.name : null }}
						</span>
						<app-select
							v-else
							:item="typePayment.code"
							item-text="name"
							item-value="code"
							:items="typePayments"
							:readonly="isNotCashOrigin"
							@input="changePayment"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2 body-1 v-if="isADeposit">
				<v-layout>
					<v-flex class="content-green">Cuenta Bancaria</v-flex>
					<v-flex class="c-text-green">
						<app-input-text
							label="Cuenta Bancaria"
							model="accountingBank"
							:readonly="isNotCashOrigin"
							:text="detail.bankAccountId"
							@input="getData"
						/>
					</v-flex>
				</v-layout>
			</v-flex>

			<template v-if="detail.originCash">
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Caja de origen</v-flex>
						<v-flex class="c-text-green">
							{{ detail.originCash.name }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Cliente</v-flex>
						<v-flex class="c-text-green">
							{{ detail.entityExternalData.fullName }}
						</v-flex>
					</v-layout>
				</v-flex>
			</template>
			<v-flex xs10>
				<label :ref="`label-${id}`" :for="`upload-file-${id}}`">
					<vue-six-four :id="`upload-file-${id}}`" hidden @vue-six-four="getFile" />
					<v-layout wrap>
						<v-flex xs10>
							<app-input-text
								label="Actualizar imagen"
								readonly
								:text="detail.urlImage"
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
			<!-- <v-flex xs2 mt-4 text-xs-right>
				<v-btn @click="updateImage"
					class="ma-0 pl-0 btn-auto white--text info" small>
					<v-icon color="white">save</v-icon>
				</v-btn>
			</v-flex> -->
		</v-layout>
		<v-layout wrap my-4 justify-center v-if="!hideButtons">
			<v-flex xs9 text-xs-center>
				<v-btn type="button" color="error" class="btn-action mr-2" @click="close">
					Cancelar
				</v-btn>
				<v-btn
					type="button"
					color="success"
					class="btn-action ml-2"
					:disabled="isNotCashOrigin || checkBlankCode(detail.code)"
					@click="save"
				>
					Guardar
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import { format } from 'date-fns';
import appSelect from './../../shared/app-select';
import appDateSelect from './../../shared/app-date-select';

function created() {
	this.loadResources();
}

function close() {
	this.$emit('close');
}

function entityName() {
	return this.detail.typeEntityName || 'Beneficiario';
}

function getAdditionalData({ model, value }) {
	this.additionalInformation[model] = value;
}

function getData({ model, value }) {
	this.detail[model] = model === 'paymentDate' ? format(value, 'YYYY-MM-DD') : value;
}

function getDate({ model, value }) {
	this.additionalInformation[model] = format(value, 'YYYY-MM-DD');
}

function isADeposit() {
	return this.typePayment.code === 'deposito-bancario';
}

function isNotCashOrigin() {
	return this.detail.module && this.detail.module.code !== 'CAJA';
}

async function loadResources() {
	const request = [
		this.getPaymentsMethods(),
		this.getTypePayments('sales'),
		this.$httpSales.get('module'),
		this.$httpSales.get('type-movement'),
	];
	[
		{ data: this.paymentsMethods },
		{ data: this.typePayments },
		{ data: this.modules },
		{ data: this.typeMovements },
	] = await Promise.all(request);
	this.typePayments = this.typePayments.map((tp) => tp.paymentType);
}

function save() {
	const body = {
		code: this.detail.code,
		additionalInformation: {
			dateReference: this.additionalInformation.dateReference,
			accountingBank: this.additionalInformation.accountingBank,
			beneficiary:
				this.beneficiary.value ||
				(this.detail.entityExternalData && this.detail.entityExternalData.beneficiary),
		},
		concept: this.detail.concept,
		reference: this.detail.reference,
		documentNumber: this.detail.documentNumber,
		typeMovement: this.detail.typeMovement,
		typePaymentId: this.typePayment.id,
		amount:
			this.detail.typeMovement !== 1 && this.flagOutbox
				? -this.detail.amount
				: this.detail.amount,
		paymentAmount:
			this.detail.typeMovement !== 1 && this.flagOutbox
				? -this.detail.amount
				: this.detail.amount,
		paymentDate: this.detail.paymentDate,
	};
	const id = this.id || this.detail.id;
	this.$emit('save', { body, id });
}

function changePayment(item) {
	this.typePayment = item.value;
}

function changeMovement(item) {
	this.detail.typeMovement = item.value.id;
}

function isCashOrBank() {
	return (
		this.detail.module &&
		(this.detail.module.code === 'CAJA' || this.detail.module.code === 'BANCO')
	);
}

function data() {
	return {
		additionalInformation: {},
		entityExternalData: {},
		modules: [],
		paymentsMethods: [],
		typePayment: {},
		typePayments: [],
		typeMovements: [],
		beneficiary: '',
	};
}

export default {
	name: 'edit-details-document',
	components: {
		appDateSelect,
		appSelect,
		VueSixFour,
	},
	computed: {
		entityName,
		isADeposit,
		isNotCashOrigin,
		isCashOrBank,
	},
	created,
	data,
	methods: {
		close,
		getAdditionalData,
		getData,
		getDate,
		loadResources,
		save,
		changePayment,
		changeMovement,
		showDialog() {
			this.$refs[`label-${this.id}`].click();
		},
		async getFile(fileInfo) {
			const allowedFiles = ['jpg', 'jpeg', 'png'];
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
					this.detail.urlImage = file.Location;
					this.$emit('update', { urlImage: file.Location });
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
	},
	props: {
		id: {
			type: [Number, String],
		},
		mounted: {
			default: false,
			type: [Boolean, Number],
		},
		hideButtons: {
			default: false,
			type: Boolean,
		},
		detail: {
			type: Object,
			default: () => {},
		},
	},
};
</script>

<style lang="scss" scoped>
.item-title {
	font-family: font(open-semibold);
	font-size: size(small);
}

.content-green {
	background: color(title-green);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(small11);
	min-width: 125px;
	padding: 4px 12px;
}

.c-text-green {
	background: color(text-green);
	color: color(paginationText);
	font-family: font(open-regular);
	font-size: size(small11);
	padding: 4px 12px;
	width: calc(100% - 125px);
}

.link {
	color: map-get($colors, selector-color);
	cursor: pointer;
	text-decoration: underline;
}
</style>
