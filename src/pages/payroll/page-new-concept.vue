<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="new-concept"
		/>
		<v-flex xs6 pl-5 pr-5 mt-5>
			<h1 class="title-section">Datos Generales</h1>
		</v-flex>
		<v-layout row wrap pr-5 pl-5 mb-5>	
			<v-flex xs6 pr-4>
				<v-layout row wrap>
					<v-flex xs12 mb-3 mt-4>
						<v-text-field
							label="Código"
							v-model="model.code"
							class="filter-select"
							:readonly="!!id"
						></v-text-field>
						<span class="form-group__message" v-if="$v.model.code.$invalid">
							El código es requerido
						</span>
						<span
							class="form-group__message"
							v-if="checkBlankCode(model.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-text-field
							label="Descripción"
							class="filter-select"
							v-model="model.description"
							@input="setShortName"
							:rules="[model.description < maxNumber || errorMessage]"
						></v-text-field>
						<span class="form-group__message" v-if="$v.model.description.$invalid">
							La descripción es requerida.
						</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-text-field
							label="Nombre corto"
							v-model="model.name"
							class="filter-select"
						></v-text-field>
						<span class="form-group__message" v-if="$v.model.name.$invalid">
							El nombre es requerido.
						</span>
						<p class="form-group__message" v-if="$v.model.name.$invalid">Mínimo {{minCode}} dígitos.</p>
					</v-flex>
					<v-flex xs12 mb-3>
						<label class="caption">Tipo de rubro</label>
						<v-select
							label="Tipo de rubro"
							:items="type"
							single-line
							item-text="name"
							item-value="id"
							bottom
							hide-details
							class="filter-select"
							v-model="model.conceptTypeId"
						></v-select>
						<span class="form-group__message" v-if="$v.model.conceptTypeId.$invalid">
							El tipo de rubro es requerido
						</span>
					</v-flex>
					<v-flex xs6 pr-1 mb-3>
						<app-input-text
							append-icon="search"
							:append-icon-cb="() => search('methodCodeId')"
							class="product-search-custom"
							label="Cta.Contable Metodo 1"
							model="product"
							:text="model.methodCode.account"
						/>
					</v-flex>
					<v-flex xs6 pt-4 pl-1>
						<v-text-field
							v-model="model.methodCode.name"
							class="filter-select"
							disabled
						></v-text-field>
					</v-flex>
					<v-flex xs6 pr-1 mb-3>
						<app-input-text
							append-icon="search"
							:append-icon-cb="() => search('methodOtherId')"
							class="product-search-custom"
							label="Cta.Contable Metodo 2"
							model="product"
							:text="model.methodOther.account"
						/>
					</v-flex>
					<v-flex xs6 pt-4 pl-1>
						<v-text-field
							v-model="model.methodOther.name"
							class="filter-select"
							disabled
						></v-text-field>
					</v-flex>
					<v-flex xs4>
						<v-checkbox
							class="pt-4"
							label="Provisión"
							v-model="model.flagProvision"
						></v-checkbox>
					</v-flex>
					<v-flex xs4>
						<v-checkbox
							class="pt-4"
							label="Gravable"
							v-model="model.flagTaxable"
						></v-checkbox>
					</v-flex>
					<v-flex xs4>
						<v-checkbox
							class="pt-4"
							label="Visualizar"
							v-model="model.flagShow"
						></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
      <v-flex xs6 pl-4>
        <v-layout row wrap>
          <v-flex xs12 mb-3>
						<label class="caption">Tipo de fórmula</label>
						<v-select
							label="Tipo de fórmula"
							:items="typeOfFormula"
							single-line
							item-text="name"
							item-value="id"
							bottom
							return-object
							hide-details
							class="filter-select"
							@input="changeTypeFormula($event)"
							v-model="model.formulaTypeId"
						></v-select>
						<span class="form-group__message" v-if="$v.model.formulaTypeId.$invalid">
							El tipo de fórmula es requerido
						</span>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-text-field
							label="Valor defecto"
							class="filter-select"
							:disabled="disabledValue"
							type="number"
							v-model="model.value"
						></v-text-field>
					</v-flex>
          			<v-flex xs12 mb-3>
						<v-text-field
							label="Orden"
							v-model="model.order"
							class="filter-select"
							type="number"
						></v-text-field>
						<span class="form-group__message" v-if="$v.model.order.$invalid">
							El orden es requerido
						</span>
					</v-flex>
          			<v-flex xs12 mb-3 mt-4>
						<v-text-field
							label="Ext. contable"
							v-model="model.accountingExt"
							class="filter-select"
						></v-text-field>
					</v-flex>
					<v-flex xs12 mb-3 mt-4>
						<v-text-field
							label="Observación"
							v-model="model.observation"
							no-resize
							class="filter-select textarea-content"
						></v-text-field>
					</v-flex>
        </v-layout>
      </v-flex>
			<v-flex xs12>
				<v-text-field
					label="Fórmula"
					v-model="model.formula"
					no-resize
					type="text"
					class="filter-select textarea-content"
					:disabled="disabledFormula"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center align-center mb-5>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="pink"
					class="btn-action mr-1"
					@click="cancelCreate"
				>
					Cancelar
					<v-icon
						color="white"
						size="16">
						highlight_off
					</v-icon>
				</v-btn>
				<v-btn
					type="button"
					color="success"
					class="btn-action ml-1"
					@click="createConcept || checkBlankCode(model.code)"
					:disabled="$v.$invalid"
				>
					Aceptar
					<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal">
			<account-search 
				v-if="action.code === 'account-search'"
				:name="modelAccount"
				@add-account="addAccount"/>
		</action-sidebar>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import actionSidebar from '@/components/shared/action-sidebar';
import accountSearch from '@/components/payroll/account-search';
import groupTable from '@/shared/group-table';
import { required, minLength } from 'vuelidate/lib/validators';

function setShortName(name) {
	const len = name.length;
	if (len <= 14) {
		this.model.name = name;
	}
}

function data() {
	return {
		minCode: 3,
		maxNumber: 3,
		errorMessage: 'máximo 8 dígitos',
		model: {
			code: null,
			name: null,
			description: null,
			observation: null,
			order: null,
			conceptTypeId: null,
			formulaTypeId: 0,
			value: 0,
			formula: '',
			flagActive: true,
			flagProvision: false,
			flagTaxable: false,
			flagShow: false,
			accountingExt: null,
			methodCodeId: null,
			methodOtherId: null,
			methodCode: {
				id: null,
				name: null,
				account: null,
				code: null,
			},
			methodOther: {
				id: null,
				name: null,
				account: null,
				code: null,
			},
		},
		type: [],
		searchValue: '',
		typeOfFormula: [],
		action: {
			active: false,
			open: false,
			code: null,
			title: '',
			width: 530,
		},
		modelAccount: '',
		disabledFormula: false,
		disabledValue: false,
	};
}

function search(value) {
	this.action.open = true;
	this.action.code = 'account-search';
	this.action.title = 'Cuentas Contables';
	this.modelAccount = value;
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.modelAccount = '';
}

async function loadData() {
	const request = [
		this.urlLoadData('get', groupTable.TypeConcepts),
		this.urlLoadData('get', groupTable.TypeFormula),
	];
	[
		{ data: this.type },
		{ data: this.typeOfFormula },
	] = await Promise.all(request);
}

function created() {
	this.loadData();
	if (this.id) {
		this.loadConcept();
	}
}

function addAccount(row, value) {
	this.closeModal();
	this.model[value] = row.code;
	const modelAccount = value === 'methodCodeId' ? 'methodCode' : 'methodOther';
	this.model[modelAccount] = {
		id: row.id,
		name: row.name,
		account: row.account,
		code:	row.code,
	};
}

function changeTypeFormula(value) {
	this.model.formulaTypeId = value.id;
	this.disabledValue = value.name !== 'Digitada';
	this.disabledFormula = value.name === 'Digitada';
	if (value.name === 'Digitada') {
		this.model.formula = null;
	} else {
		this.model.value = 0;
	}
}

function validations() {
	this.minCode = this.isEcuador ? 3 : 3;
	return {
		model: {
			code: { required },
			conceptTypeId: { required },
			description: {
				required,
				minLength: minLength(this.minCode),
			},
			formulaTypeId: { required },
			name: {
				required,
				minLength: minLength(this.minCode),
			},
			order: { required },
		},
	};
}

async function createConcept() {
	const method = this.id ? 'patch' : 'post';
	const url = this.id ? `concepts/${this.id}` : 'concepts';
	const message = this.id ? 'actualizó' : 'creó';
	const body = { ...this.model };
	body.methodCode = body.methodCode.id ? body.methodCode : null;
	body.methodOther = body.methodOther.id ? body.methodOther : null;
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`Se ${message} correctamente`);
		this.goTo('concept');
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'CONCEPT_EXISTS') {
				this.showGenericError('El código ya existe');
			}
		} else {
			this.showGenericError();
		}
	}
}

function cancelCreate() {
	this.goTo('concept');
}

async function loadConcept() {
	const response = await this.$httpSales.get(`/concepts/${this.id}`);
	this.model.code = response.data.code;
	this.model.description = response.data.description;
	this.model.name = response.data.name;
	this.model.conceptTypeId = response.data.conceptType.id;
	this.model.flagProvision = response.data.flagProvision === 1;
	this.model.flagTaxable = response.data.flagTaxable === 1;
	this.model.flagShow = response.data.flagShow === 1;
	this.model.methodCodeId = response.data.methodCode ? response.data.methodCode.code : null;
	this.model.methodCode.id = response.data.methodCode ? response.data.methodCode.id : null;
	this.model.methodCode.name = response.data.methodCode ? response.data.methodCode.name : null;
	this.model.methodCode.account = response.data.methodCode ?
		response.data.methodCode.account : null;
	this.model.methodCode.code = response.data.methodCode ? response.data.methodOther.code : null;
	this.model.methodOtherId = response.data.methodOther ? response.data.methodOther.code : null;
	this.model.methodOther.id = response.data.methodOther ? response.data.methodCode.id : null;
	this.model.methodOther.name = response.data.methodOther ? response.data.methodCode.name : null;
	this.model.methodOther.account = response.data.methodOther ?
		response.data.methodCode.account : null;
	this.model.methodOther.code = response.data.methodOther ?
		response.data.methodCode.code : null;
	this.model.formulaTypeId = response.data.formulaType.id;
	this.model.value = response.data.value;
	this.model.order = response.data.order;
	this.model.accountingExt = response.data.accountingExt;
	this.model.observation = response.data.observation;
	this.model.formula = response.data.formula;
	this.changeTypeFormula(response.data.formulaType);
}

export default {
	name: 'new-concept',
	components: {
		headerPage,
		modalSidebarButton,
		actionSidebar,
		accountSearch,
	},
	created,
	data,
	methods: {
		search,
		closeModal,
		loadData,
		addAccount,
		changeTypeFormula,
		createConcept,
		cancelCreate,
		loadConcept,
		setShortName,
	},
	validations,
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
	.title {
		border-bottom: 1px solid map-get($colors, blue-grey);
		color: map-get($colors, paginationText);
		font-size: 13px;
		padding-bottom: 10px;
		width: 50%;
	}
</style>


