<template>
	<div class="credit-payment">
		<v-tabs v-model="activeTab">
			<v-tab href="#check" :disabled="activeTab !== 'check'"> Cheque </v-tab>
			<v-tab href="#card" :disabled="activeTab !== 'card'"> Tarjeta </v-tab>
			<v-tab-item id="check">
				<v-layout wrap class="wrapper-tabs">
					<v-flex px-3 py-2 xs12 mb-2 class="credit-payment__wrapper-text">
						<v-layout>
							<v-flex xs6>
								<p class="mb-0">Total: {{ currencySymbol }} {{ totalCredited }}</p>
							</v-flex>
							<v-flex xs6>
								<p class="mb-0 bold">
									Total Acreditado: {{ currencySymbol }} {{ newTotal }}
								</p>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 px-3 mb-2>
						<v-layout>
							<v-flex xs6 pr-2 pt-1>
								<app-select
									:item="modelCheck.bankAccountId"
									item-text="name"
									item-value="id"
									:items="bankAccounts"
									label="Cuenta Bancaria"
									model="bankAccountId"
									:return-object="false"
									@input="getData($event, 'modelCheck')"
								/>
							</v-flex>
							<v-flex xs6 pl-2>
								<app-date-select
									:date-formatted="modelCheck.dateDocument"
									label="Fecha"
									model="dateDocument"
									@input="getData($event, 'modelCheck')"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 px-3 mb-3>
						<v-layout>
							<v-flex xs6 pr-1>
								<app-input-text
									label="Nro de documento"
									model="documentNumber"
									type="number"
									:text="modelCheck.documentNumber"
									@input="getData($event, 'modelCheck')"
								/>
							</v-flex>
							<v-flex xs6 pl-1>
								<label ref="label-image-check" for="upload-url-image-check">
									<v-layout>
										<v-flex xs10>
											<vue-six-four
												id="upload-url-image-check"
												hidden
												@vue-six-four="getFile('modelCheck', $event)"
											/>
											<app-input-text
												label="Imagen del documento"
												readonly
												:text="modelCheck.urlImage"
											/>
										</v-flex>
										<v-flex flex text-xs-left xs2>
											<button
												@click="showDialogFavicon('label-image-check')"
												class="btn-upload"
											>
												<v-icon color="white" size="14">image</v-icon>
											</button>
										</v-flex>
									</v-layout>
								</label>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<retentions-form-credit-check
							from-sale
							:model="modelCheck"
							:total-credited="totalCredited"
							:is-loading="isLoading"
							@save-check="saveRetentionsCheck"
							@set-data="getData"
							@change-total="changeTotal"
							@cancel-modal="$emit('cancel-modal')"
						/>
					</v-flex>
				</v-layout>
			</v-tab-item>
			<v-tab-item id="card">
				<v-layout wrap class="wrapper-tabs">
					<v-flex px-3 py-2 xs12 mb-2 class="credit-payment__wrapper-text">
						<v-layout>
							<v-flex xs6>
								<p class="mb-0">Total: {{ currencySymbol }} {{ totalCredited }}</p>
							</v-flex>
							<v-flex xs6>
								<p class="mb-0 bold">
									Total Acreditado: {{ currencySymbol }} {{ newTotal }}
								</p>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 px-3 mb-2>
						<v-layout>
							<v-flex xs6 pr-2 pt-1>
								<app-select
									:item="model.bankAccountId"
									item-text="name"
									item-value="id"
									:items="bankAccounts"
									label="Cuenta Bancaria"
									model="bankAccountId"
									:return-object="false"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs6 pl-2>
								<app-date-select
									:date-formatted="model.dateDocument"
									label="Fecha"
									model="dateDocument"
									@input="getData"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 px-3 mb-3>
						<v-layout>
							<v-flex xs6 pr-1>
								<app-input-text
									label="Nro de documento"
									model="documentNumber"
									type="number"
									:text="model.documentNumber"
									@input="getData"
								/>
							</v-flex>
							<v-flex xs6 pl-1>
								<label ref="label-image" for="upload-url-image">
									<v-layout>
										<v-flex xs10>
											<vue-six-four
												id="upload-url-image"
												hidden
												@vue-six-four="getFile('model', $event)"
											/>
											<app-input-text
												label="Imagen del documento"
												readonly
												:text="model.urlImage"
											/>
										</v-flex>
										<v-flex flex text-xs-left xs2>
											<button
												@click="showDialogFavicon('label-image')"
												class="btn-upload"
											>
												<v-icon color="white" size="14">image</v-icon>
											</button>
										</v-flex>
									</v-layout>
								</label>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12>
						<retentions-form-credit
							from-sale
							:model="model"
							:total-credited="totalCredited"
							:is-loading="isLoading || !modelCheck.bankAccountId"
							@save="saveRetentions"
							@set-data="getData"
							@change-total="changeTotal"
							@cancel-modal="$emit('cancel-modal')"
						/>
					</v-flex>
				</v-layout>
			</v-tab-item>
		</v-tabs>
	</div>
</template>
<script>
import { format } from 'date-fns';
import retentionsFormCredit from '@/components/purchases/retentions-form-credit';
import retentionsFormCreditCheck from '@/components/purchases/retentions-form-credit-check';
import typePaymentForm from '@/shared/type-payment-form';
import VueSixFour from 'vue-six-four';

function getData({ model, value }, type) {
	if (type) {
		this[type][model] = value;
	} else if (model === 'dateDocument') {
		this.model[model] = format(value, 'YYYY-MM-DD');
	} else {
		this.$set(this.model, model, value);
		this.$set(this.modelCheck, model, value);
	}
}

async function saveRetentions(body, totalCommission, netWorth) {
	this.isLoading = true;
	const newBodyA = { ...body };
	newBodyA.details = newBodyA.details.reduce((acum, n) => {
		const newAcum = [...acum];
		const newItem = { ...n };
		if (n.baseTax || n.baseIva) {
			newItem.numberOrder = newAcum.length + 1;
			newAcum.push(newItem);
		}
		return newAcum;
	}, []);
	const amountTax = newBodyA.details.reduce((a, d) => Number(a) + Number(d.amountTax), 0);
	const newBody = {
		typeAccreditation: typePaymentForm.Card,
		cashId: this.dataSelected[0].cashId || 0,
		amount: Number(netWorth),
		moduleCode: 'CAJA',
		bankAccountId: this.model.bankAccountId,
		currency: this.currency,
		urlImage: this.model.urlImage,
		additionalInformation: {
			documentNumber: this.model.documentNumber,
			paymentDate: this.isPeru
				? this.model.dateDocument
				: format(new Date(), 'YYYY-MM-DD'),
		},
		transactions: this.dataSelected.map((d) => {
			const newT = {
				id: d.id,
				amount: d.amount,
			};
			return newT;
		}),
		withholdingTax: {
			serie: this.model.serie,
			number: this.model.number,
			dateAccouting: this.model.dateDocument,
			dateDocument: this.model.dateDocument,
			dateExpiration: this.model.dateDocument,
			details: [...newBodyA.details],
		},
		withholdingsAmount: Number(amountTax),
	};
	newBody.withholdingTax = this.isEcuador ? newBody.withholdingTax : null;
	if (Number(totalCommission)) {
		newBody.comissionsAmount = Number(totalCommission);
	}
	try {
		await this.$httpSales.post('collection-transaction/accreditations', newBody);
		this.showNotification('La acción se realizó correctamente');
		this.$emit('update');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'BANK_ACCOUNT_NOT_FOUND') {
				this.showGenericError('Seleccionar cuenta.');
			} else if (err.data.message === 'HEADER_AMOUNT_EXCEEDED') {
				this.showGenericError(
					'La sumatoria de montos de los movimientos excede al monto total del documento relacionado.'
				);
			} else if (err.data.message === 'TRANSACTION_NOT_FOUND') {
				this.showGenericError('La transacción no fue encontrada.');
			} else {
				this.showGenericError();
			}
		}
	} finally {
		this.isLoading = false;
	}
}

async function loadData() {
	try {
		({ data: this.bankAccounts } = await this.$httpSales.get('bank-account'));
	} catch (error) {
		this.showGenericErro();
	}
}

function changeTotal(value) {
	this.newTotal = value;
}

function created() {
	if (this.isPeru) {
		this.model.dateDocument = format(this.$today(), 'YYYY-MM-DD');
	}
	const typeForm = this.dataSelected[0].typePayment.flagForm;
	this.activeTab = typeForm === typePaymentForm.Check ? 'check' : 'card';
	this.newTotal = this.totalCredited;
	this.loadData();
}

function showDialogFavicon(name) {
	this.$refs[name].click();
}

async function getFile(model, fileInfo) {
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
			this[model].urlImage = file.Location;
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

async function saveRetentionsCheck(netWorth) {
	this.isLoading = true;
	const newBody = {
		typeAccreditation: typePaymentForm.Check,
		amount: Number(netWorth),
		moduleCode: 'CAJA',
		bankAccountId: this.modelCheck.bankAccountId,
		currency: this.currency,
		urlImage: this.modelCheck.urlImage,
		additionalInformation: {
			documentNumber: this.modelCheck.documentNumber,
			paymentDate: this.modelCheck.dateDocument,
		},
		transactions: this.dataSelected.map((d) => {
			const newT = {
				id: d.id,
				amount: d.amount,
			};
			return newT;
		}),
		cashId: this.dataSelected[0].cashId || 0,
		withholdingsAmount: 0,
	};
	try {
		await this.$httpSales.post('collection-transaction/accreditations', newBody);
		this.showNotification('La acción se realizó correctamente');
		this.$emit('update');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'BANK_ACCOUNT_NOT_FOUND') {
				this.showGenericError('Seleccionar cuenta.');
			} else if (err.data.message === 'HEADER_AMOUNT_EXCEEDED') {
				this.showGenericError(
					'La sumatoria de montos de los movimientos excede al monto total del documento relacionado.'
				);
			} else if (err.data.message === 'TRANSACTION_NOT_FOUND') {
				this.showGenericError('La transacción no fue encontrada.');
			} else {
				this.showGenericError();
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		bankAccounts: [],
		model: {
			bankAccountId: null,
			documentNumber: null,
			dateDocument: null,
			serie: null,
			number: null,
			urlImage: null,
			totalCommission: null,
		},
		newTotal: null,
		isLoading: false,
		allowedFiles: ['jpg', 'jpeg', 'png', 'svg'],
		activeTab: 'check',
		modelCheck: {
			bankAccountId: null,
			documentNumber: null,
			dateDocument: null,
			serie: null,
			number: null,
			urlImage: null,
		},
	};
}

export default {
	name: 'credit-payment',
	data,
	created,
	components: {
		retentionsFormCredit,
		VueSixFour,
		retentionsFormCreditCheck,
	},
	methods: {
		getData,
		loadData,
		saveRetentions,
		changeTotal,
		showDialogFavicon,
		getFile,
		saveRetentionsCheck,
	},
	props: {
		totalCredited: [String, Number],
		currencySymbol: String,
		dataSelected: {
			type: Array,
			default: () => [],
		},
		currency: String,
	},
};
</script>
<style lang="scss" scoped>
.credit-payment {
	&__wrapper-text {
		background-color: #ededed;
		border-bottom: 3px solid map-get($colors, selector-color);
		color: map-get($colors, selector-color);
	}

	.bold {
		font-weight: bold;
	}

	.btn-upload {
		align-items: center;
		background: color(primary);
		border-radius: 0 5px 5px 0;
		display: flex;
		justify-content: center;
		height: 27px;
		margin-top: 21px;
		width: 100%;
	}
}
</style>
