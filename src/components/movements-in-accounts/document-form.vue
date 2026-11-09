<template>
	<v-layout wrap pa-2>
		<v-flex xs6 px-2>
			<app-select
				disabled
				:item="originId"
				item-text="name"
				item-value="id"
				:items="modules"
				label="Origen"
				readonly
				model="moduleId"
				@input="$emit('set-data', $event)"
			></app-select>
		</v-flex>
		<v-flex xs6 px-2>
			<div v-if="!document.saleDocumentId">
				<app-input-text
					label="Importe"
					model="amount"
					:text="document.amount"
					type="number"
					@input="$emit('set-data-amount', $event)"
				></app-input-text>
				<span class="form-group__message" v-if="amountRequired">
					El importe es requerido
				</span>
			</div>
			<v-flex v-else>
				<v-layout>
					<label class="caption">Importe</label>
				</v-layout>
				<v-layout mt-1>
					<label style="font-size: 14px">{{ document.amount }}</label>
				</v-layout>
			</v-flex>
		</v-flex>
		<v-flex xs6 px-2>
			<app-select
				:item="document.typeTransactionId"
				item-text="name"
				item-value="id"
				:items="transactionsType"
				label="Tipo"
				model="typeTransactionId"
				@input="$emit('set-data', $event)"
			></app-select>
			<span class="form-group__message" v-if="typeTransactionRequired">
				El tipo es requerido
			</span>
		</v-flex>
		<v-flex xs6 px-2>
			<label class="caption">Fecha de recepción</label>
			<date-component
				:date="receptionDate"
				icon="/static/img/calendar.svg"
				@on-input="setDateRecepction({ value: $event, model: 'receptionDate' })"
			/>
		</v-flex>
		<v-flex xs6 px-2>
			<label class="caption">Fecha de emisión</label>
			<date-component
				:date="emissionDate"
				icon="/static/img/calendar.svg"
				@on-input="setDateEmition({ value: $event, model: 'emissionDate' })"
			/>
		</v-flex>
		<v-flex xs6 px-2>
			<label class="caption">Fecha de vencimiento</label>
			<date-component
				:date="expirationDate"
				:disabled="!emissionDate"
				icon="/static/img/calendar.svg"
				@on-input="
					setDateExpiration({ value: $event, model: 'expirationDate' })
				"
			/>
		</v-flex>
		<v-flex xs6 px-2>
			<app-input-text
				label="Nro de documento"
				model="documentNumber"
				:text="document.documentNumber"
				@input="$emit('set-data', $event)"
			></app-input-text>
		</v-flex>
		<v-flex xs6 px-2>
			<app-input-text
				label="Referencia"
				model="reference"
				:text="document.reference"
				@input="$emit('set-data', $event)"
			></app-input-text>
		</v-flex>
		<v-flex xs12 px-2>
			<app-input-text
				label="Concepto"
				model="concept"
				:text="document.concept"
				@input="$emit('set-data', $event)"
			></app-input-text>
		</v-flex>
		<v-flex xs6 px-2 v-if="isPeru">
			<app-select
				:disabled="isEcuador"
				:item="currencyId"
				item-text="name"
				item-value="id"
				:items="currencies"
				label="Moneda"
				:readonly="isEcuador"
				model="currency"
				@input="$emit('set-data', $event)"
			></app-select>
			<span class="form-group__message" v-if="$v.currencyId.$invalid">
				La moneda es requerida
			</span>
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
	</v-layout>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import dateComponent from '@/components/shared/date-component';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import ModuleCode from '@/shared/module';

const { exactDate } = helper;

function created() {
	this.loadResources();
	if (this.document.id) {
		this.emissionDate = exactDate(this.document.emissionDate, 'DD/MM/YYYY');
		this.expirationDate = exactDate(this.document.expirationDate, 'DD/MM/YYYY');
		this.receptionDate = exactDate(this.document.receptionDate, 'DD/MM/YYYY');
		this.originId = this.document.moduleId;
		this.currencyId = this.document.currency;
	}
}

function disabledButton() {
	return (
		this.$v.$invalid ||
		this.loading ||
		this.amountRequired ||
		this.typeTransactionRequired ||
		this.loadingResources
	);
}

async function loadResources() {
	const type = this.originCode === ModuleCode.AccountsReceivable ? 1 : 2;
	this.loadingResources = true;
	const request = [
		this.$httpSales.get('type-transaction', { params: { type } }),
		this.getCurrencies(),
		this.$httpSales.get('module'),
	];
	try {
		[
			{ data: this.transactionsType },
			{ data: this.currencies },
			{ data: this.modules },
		] = await Promise.all(request);
		this.originId =
			this.document.moduleId ||
			this.modules.find((m) => m.code === this.originCode).id;
		this.currencyId = this.document.currency || this.$userInfo.company.currency;
		this.$emit('set-data', {
			model: 'currency',
			value: { id: this.currencyId },
		});
		this.$emit('set-data', { model: 'moduleId', value: this.originId });
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loadingResources = false;
	}
}

function validations() {
	return {
		currencyId: { required },
	};
}

function setDateRecepction({ model, value }) {
	this.receptionDate = value;
	this.$emit('set-date', { valueDate: value, model });
}

function setDateEmition({ model, value }) {
	this.emissionDate = value;
	this.$emit('set-date', { valueDate: value, model });
}

function setDateExpiration({ model, value }) {
	this.expirationDate = value;
	this.$emit('set-date', { valueDate: value, model });
}

function data() {
	return {
		currencies: [],
		currencyId: null,
		emissionDate: null,
		expirationDate: null,
		loadingResources: false,
		receptionDate: null,
		modules: [],
		originId: null,
		transactionsType: [],
	};
}

export default {
	name: 'document-form',
	components: {
		dateComponent,
		modalSidebarButton,
	},
	computed: {
		disabledButton,
	},
	created,
	data,
	methods: {
		loadResources,
		setDateEmition,
		setDateExpiration,
		setDateRecepction,
	},
	props: {
		amountRequired: {
			default: true,
			type: Boolean,
		},
		document: {
			default: () => {},
			type: Object,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		originCode: String,
		typeTransactionRequired: {
			default: true,
			type: Boolean,
		},
	},
	validations,
};
</script>
