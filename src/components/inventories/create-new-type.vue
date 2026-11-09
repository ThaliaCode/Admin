<template>
	<div>
		<v-layout wrap pa-3>
			<v-flex xs12 mb-2>
				<app-select
					:items="types"
					:disabled="lockedBaseFields"
					item-text="name"
					item-value="id"
					label="Tipo de Movimiento"
					model="typeOperation"
					:return-object="false"
					:item="model.typeOperation"
					@input="setData"
				></app-select>
				<span class="form-group__message" v-if="!$v.model.typeOperation.required">
					El Tipo de Movimiento es requerido
				</span>
			</v-flex>
			<v-flex xs12 mb-2>
				<app-input-text
					:disabled="lockedBaseFields"
					label="Nombre"
					model="name"
					:text="model.name"
					@input="setData"
				></app-input-text>
				<span class="form-group__message" v-if="!$v.model.name.required">
					El Nombre es requerido
				</span>
			</v-flex>
			<v-flex xs12 mb-2>
				<v-layout>
					<v-flex xs6 pr-1>
						<app-input-text
							label="Orden"
							type="number"
							model="orderAvgCost"
							:text="model.orderAvgCost"
							@input="setData"
						></app-input-text>
						<span class="form-group__message" v-if="!$v.model.orderAvgCost.required">
							El Orden es requerido
						</span>
					</v-flex>
					<v-flex xs6 pl-1>
						<app-input-text
							:disabled="lockedBaseFields"
							label="Código"
							model="code"
							:text="model.code"
							@input="setData"
						></app-input-text>
						<span class="form-group__message" v-if="!$v.model.code.required">
							El Código es requerido
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-input-text
					:disabled="lockedBaseFields"
					label="Descripción"
					model="description"
					@input="setData"
					:text="model.description"
				></app-input-text>
			</v-flex>
			<v-flex xs12 mb-3 v-if="$userInfo.company.settings.flagShowAccountingEngine">
				<autocomplete-component
					append-icon="arrow_drop_down"
					select-column="4"
					disabled-column="8"
					disabled-class="accounting-input-disabled"
					http-code="$httpQuipu"
					:item="account"
					item-text="fullName"
					item-value="id"
					:items="accounts"
					model="accountingAccount"
					placeholder-value="Busca una cuenta"
					placeholder-input="Nombre de la cuenta"
					prop="account"
					prop-search="fullName"
					:readonly-prop="accountName"
					readonly-prop-show
					:resource-url="`accounting-accounts/${$userInfo.company.country.countryCode}/${$userInfo.subsidiary.ruc}/fb`"
					return-object
					select-create
					@return-data="setDataAcc"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12>
				<v-layout>
					<v-flex xs6>
						<v-checkbox
							label="Recalcular"
							color="success"
							hide-details
							v-model="model.flagAvgCost"
						></v-checkbox>
					</v-flex>
					<v-flex xs6>
						<v-checkbox
							label="Activo"
							color="success"
							hide-details
							v-model="model.flagApplyCostAvg"
						></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveType"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import { required } from 'vuelidate/lib/validators';

function lockedBaseFields() {
	return !!this.typeDocumentId;
}

function setData({ value, model }) {
	this.model[model] = value;
}

function setDataAcc(value) {
	this.accountName = value.name;
	this.model.accountingAccount.id = value.id;
	this.model.accountingAccount.code = value.code;
}

async function saveType() {
	const body = { ...this.model };
	body.flagApplyCostAvg = Number(body.flagApplyCostAvg);
	body.flagAvgCost = Number(body.flagAvgCost);
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `type-documents/${this.id}` : 'type-documents';
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification('La acción se realizó correctamente');
		this.$emit('update-list');
	} catch (error) {
		this.showGenericError();
	}
}

function validations() {
	return {
		model: {
			name: { required },
			code: { required },
			typeOperation: { required },
			orderAvgCost: { required },
		},
	};
}

async function loadData() {
	try {
		const { data: response } = await this.$httpProducts.get(`type-documents/${this.id}`);
		this.model.name = response.name || null;
		this.model.code = response.code || null;
		this.model.description = response.description || null;
		this.model.typeOperation = response.typeOperation;
		this.model.orderAvgCost = response.orderAvgCost || null;
		this.model.flagAvgCost = Boolean(response.flagAvgCost);
		this.model.flagApplyCostAvg = Boolean(response.flagApplyCostAvg);
		if (response.accountingAccount) {
			this.model.accountingAccount = {
				id: response.accountingAccount.id,
				code: response.accountingAccount.code,
			};
			this.account = this.accounts.find(a => a.id === response.accountingAccount.id) || {};
			this.accountName = this.account.name || null;
		}
	} catch (error) {
		this.showGenericError();
	}
}

function created() {
	if (this.id) {
		this.loadData();
	}
}

function data() {
	return {
		account: null,
		accountName: null,
		model: {
			name: null,
			code: null,
			description: null,
			typeOperation: null,
			orderAvgCost: null,
			flagApplyCostAvg: false,
			flagAvgCost: false,
			accountingAccount: {
				id: null,
				code: null,
			},
		},
	};
}
export default {
	name: 'create-new-type',
	computed: {
		lockedBaseFields,
	},
	data,
	created,
	components: {
		modalSidebarButton,
		autocompleteComponent,
	},
	methods: {
		setData,
		setDataAcc,
		saveType,
		loadData,
	},
	props: {
		types: {
			type: Array,
			default: () => [],
		},
		accounts: {
			type: Array,
			default: () => [],
		},
		showAccounting: {
			type: Boolean,
			default: false,
		},
		id: Number,
		typeDocumentId: {
			type: [Number, String],
			default: null,
		},
	},
	validations,
};
</script>