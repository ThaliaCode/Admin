<template>
	<div>
		<v-layout wrap mt-3>
			<v-flex
				xs6
				pr-2
				mb-2
				v-if="showBankAccount && $route.name !== 'cash-desk-closing-transactions'"
			>
				<v-flex v-if="showHidden">
					<v-layout column>
						<v-flex xs2 class="primary--text detail-title-row mb-1"> Cuenta: </v-flex>
						<v-flex class="detail-description-row">
							{{ model.bankAccountId }}
						</v-flex>
					</v-layout>
				</v-flex>
				<app-select
					v-else
					ref="bankAccount"
					:item="model.bankAccountId"
					item-text="name"
					item-value="id"
					:items="bankAccounts"
					label="Cuenta"
					model="bankAccountId"
					:readonly="readonly"
					@input="setData"
					@keyup.enter.native="focusNext('operationNumber')"
				/>
			</v-flex>
			<v-flex
				xs6
				mb-2
				:class="{ 'pl-2': !isDetailImportMode }"
				v-if="showOperationNumber"
				:style="
					$route.name === 'cash-desk-closing-transactions'
						? 'padding-right: 15px; margin-bottom: 0;'
						: 'pr-0'
				"
			>
				<v-flex v-if="showHidden">
					<v-layout column>
						<v-flex xs2 class="primary--text detail-title-row mb-1">
							Nro de Operación:
						</v-flex>
						<v-flex class="detail-description-row">
							{{ model.documentNumber }}
						</v-flex>
					</v-layout>
				</v-flex>
				<app-input-text
					v-else
					ref="operationNumber"
					label="Nro de Operación"
					model="documentNumber"
					:readonly="readonly"
					:text="model.documentNumber"
					@input="setData"
					@input-enter="focusNext('depositDate')"
				/>
			</v-flex>
			<v-flex
				xs6
				mb-2
				:class="{
					'pr-2': !isDetailImportMode,
					'pl-2': isDetailImportMode,
				}"
				v-if="showDateDeposit"
			>
				<v-flex xs12 v-if="showHidden">
					<v-layout column>
						<v-flex xs2 class="primary--text detail-title-row mb-1">
							Fecha de depósito:
						</v-flex>
						<v-flex class="detail-description-row">
							{{ this.dateReference | exactDate }}
						</v-flex>
					</v-layout>
				</v-flex>
				<app-date-select
					v-else
					ref="depositDate"
					:date-formatted="dateFormattedVisual"
					label="Fecha de depósito"
					model="dateReference"
					:readonly="readonly"
					@input="setDate"
					@enter="focusNext('attachFileBtn')"
				/>
			</v-flex>
			<v-flex xs12>
				<v-flex xs12 v-if="showHidden">
					<v-layout column>
						<v-flex xs2 class="primary--text detail-title-row mb-1"> Voucher: </v-flex>
						<v-flex class="detail-description-row" v-if="showHidden && model.urlImage">
							<a :href="model.urlImage || urlImage" target="_blank">
								Imagen de Referencia (Click Aquí)
							</a>
						</v-flex>
					</v-layout>
				</v-flex>
				<label :ref="`label-${code}-${key}`" :for="`upload-file-${code}-${key}}`" v-else>
					<vue-six-four
						:id="`upload-file-${code}-${key}}`"
						hidden
						@vue-six-four="getFile"
					/>
					<v-layout wrap>
						<v-flex xs9>
							<app-input-text label="Adjuntar Voucher" readonly :text="model.urlImage" />
						</v-flex>
						<v-flex xs2 ml-2 mt-4 text-xs-left>
							<v-btn
								ref="attachFileBtn"
								@click="showDialog"
								class="ma-0 pl-0 btn-auto btn-attach-voucher"
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
			<v-flex xs12 mt-2 v-if="showConcept">
				<v-flex v-if="showHidden" mt-1>
					<v-layout column>
						<v-flex xs2 class="primary--text detail-title-row mb-1">
							Concepto:
							<span class="detail-description-row">{{ model.concept || '-' }}</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<app-input-text
					v-else
					ref="concept"
					textarea
					no-resize
					label="Concepto"
					model="concept"
					:text="model.concept"
					@input="setData"
					@input-enter="focusNext('reference')"
				/>
			</v-flex>
			<v-flex xs12 mt-2>
				<v-flex v-if="showHidden" mt-1>
					<v-layout column>
						<v-flex class="primary--text detail-title-row mb-1">
							Referencia:
							<span class="detail-description-row">{{ model.reference || '-' }}</span>
						</v-flex>
					</v-layout>
				</v-flex>
				<app-input-text
					v-else
					ref="reference"
					textarea
					no-resize
					label="Referencia"
					model="reference"
					:text="model.reference"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import { format } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';
import appSelect from '@/components/shared/app-select';
import lib from '@/shared/lib';

function created() {
	this.loadResources();
}

async function getFile(fileInfo) {
	this.$emit('update-loading', true);
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
			const body = {
				code: this.code,
				model: 'urlImage',
				newValue: this.model.urlImage,
			};
			this.$emit('get-data', body);
			this.focusNext('concept');
		} else {
			this.showNotification(
				`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`,
				'warning'
			);
		}
	} catch (error) {
		this.showGenericError();
	} finally {
		this.$emit('update-loading', false);
	}
}

async function loadResources() {
	this.model.additionalInformation.dateReference =
		this.dateReference || this.model.additionalInformation.dateReference;
	const findRow = this.bankAccounts.find((p) => p.primaryBankAccount === 1);
	if (findRow) {
		this.model.bankAccountId = findRow.id;
	} else {
		this.model.bankAccountId =
			this.bankAccountId ||
			this.model.bankAccountId ||
			(this.bankAccounts && this.bankAccounts.lenght > 0
				? this.bankAccounts[0].id
				: null);
	}
	const body = {
		code: this.code,
		model: 'bankAccountId',
		newValue: this.model.bankAccountId,
	};
	this.$emit('get-data', body);
	this.model.concept = this.conceptDeposit;
	this.model.reference = this.referenceDeposit;
	this.model.documentNumber = this.documentNumber || this.model.documentNumber;
	this.model.urlImage = this.urlImage || this.model.urlImage;
	if (!this.readonly) {
		if (!this.model.additionalInformation.dateReference) {
			this.setDate({ model: 'dateReference', value: new Date() });
		}
		if (!this.model.bankAccountId) {
			this.setData({ model: 'bankAccountId', value: this.model.bankAccountId });
		}
	}
}

function setData({ model, value }) {
	if (value) {
		if (model === 'bankAccountId') {
			this.model[model] = value.id || value;
		} else if (model === 'concept' || model === 'reference') {
			this.model[model] = value;
		} else {
			this.model[model] = value && model !== 'documentNumber' ? value.id : value;
		}
		const body = { code: this.code, model, newValue: this.model[model] };
		this.$emit('get-data', body);
	}
}

function setDate({ model, value }) {
	this.model.additionalInformation[model] = format(value, 'YYYY-MM-DD');
	const body = {
		code: this.code,
		model,
		newValue: this.model.additionalInformation[model],
	};
	this.$emit('get-data', body);
}

function showDialog() {
	this.$refs[`label-${this.code}-${this.key}`].click();
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

function dateFormattedVisual() {
	return this.model.additionalInformation.dateReference
		? format(this.model.additionalInformation.dateReference, 'DD-MM-YYYY')
		: null;
}

function data() {
	return {
		allowedFiles: ['jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt'],
		model: {
			additionalInformation: {
				dateReference: null,
			},
			bankAccountId: null,
			documentNumber: null,
			urlImage: '',
			concept: null,
			reference: null,
		},
		references: [],
		key: lib.randomKey(),
	};
}

export default {
	name: 'bank-deposit-form',
	components: {
		appDateSelect,
		appSelect,
		VueSixFour,
	},
	created,
	data,
	methods: {
		getFile,
		loadResources,
		showDialog,
		setData,
		setDate,
		focusNext,
	},
	computed: {
		dateFormattedVisual,
	},
	props: {
		bankAccountId: [Number, String],
		conceptDeposit: [Number, String],
		referenceDeposit: [Number, String],
		bankAccounts: {
			default: () => [],
			type: Array,
		},
		code: [String, Number],
		documentNumber: [Number, String],
		dateReference: [Date, String, Number],
		readonly: {
			default: false,
			type: Boolean,
		},
		showHidden: {
			default: false,
			type: Boolean,
		},
		showConcept: {
			default: true,
			type: Boolean,
		},
		showOperationNumber: {
			default: true,
			type: Boolean,
		},
		urlImage: String,
		loadingImg: {
			default: false,
			type: Boolean,
		},
		showDateDeposit: {
			default: true,
			type: Boolean,
		},
		showBankAccount: {
			default: true,
			type: Boolean,
		},
		isDetailImportMode: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style scoped>
.btn-attach-voucher:focus {
	border: 2px solid #ad1457 !important; /* Pink 800 */
	box-shadow: 0 0 8px rgba(173, 20, 87, 0.6);
	outline: none;
}
</style>
