<template>
	<div>
		<v-layout wrap pa-4>
			<v-layout row wrap px-2 v-if="showAccountingData">
				<v-flex xs12 class="caption">
					Cuentas Contables
				</v-flex>
				<v-flex xs12 mb-3>
					<autocomplete-component
						append-icon="arrow_drop_down"
						class="autocomplete-cm"
						select-column="4"
						disabled-column="8"
						disabled-class="accounting-input-disabled"
						http-code="$httpQuipu"
						:item="accountingAccount"
						item-text="fullName"
						item-value="id"
						:items="accountingAccounts"
						model="accountingAccount"
						placeholder-value="Busca una cuenta"
						placeholder-input="Nombre de la cuenta"
						prop="account"
						prop-search="fullName"
						:readonly-prop="accountingAccount.name"
						readonly-prop-show
						:resource-url="`accounting-accounts/${$userInfo.company.country.countryCode}/${$userInfo.subsidiary.ruc}/fb`"
						return-object
						select-create
						@return-data="$emit('set-data', $event)"
					></autocomplete-component>
				</v-flex>
			</v-layout>
			<v-flex xs12 md6 px-2 mb-1>
				<autocomplete-component
					append-icon="search"
					class="custom-autocomplete"
					custom
					label-value="Cod. Contable Anti."
					item-text="autocomplete"
					item-value="code"
					:items="autocompleteAdvanceItems"
					:properties-to-show="accountingProperties"
					:resource-url="`/accounting-plan/${companyId}/quipu?status=1`"
					return-object
					:http-code="'$httpQuipu'"
					:item="model.accountAdvanceAccount"
					@return-data="setAccountingCodes({ model: 'accountAdvanceAccount', value: $event })"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-select
					:item="model.typeDestinationId"
					item-text="name"
					item-value="id"
					:items="destinationTypes"
					label="Tipo de Destino"
					model="typeDestinationId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1 v-if="isForeign">
				<app-select
					:item="model.countryId"
					item-text="name"
					item-value="id"
					:items="countries"
					label="País"
					model="countryId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 md6 px-2 mb-1>
				<app-select
					:item="model.originIncomeId"
					item-text="name"
					item-value="id"
					:items="incomeOrigins"
					label="Origen de ingreso"
					model="originIncomeId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 mt-5 px-2 mb-1>
				<v-checkbox
					hide-details
					color="success"
					label="Contabilidad Obligatoria"
					:true-value="1"
					:false-value="0"
					v-model="model.flagAccounting"
				></v-checkbox>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<v-checkbox
					hide-details
					color="success"
					label="Exento de IVA"
					:true-value="1"
					:false-value="0"
					v-model="model.flagExemptTaxes"
				></v-checkbox>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<v-checkbox
					hide-details
					color="success"
					label="Contribuyente Especial"
					:true-value="1"
					:false-value="0"
					v-model="model.flagSpecialContributor"
				></v-checkbox>
			</v-flex>
			<v-flex xs12 px-2 mb-1 v-if="isPeru">
				<v-radio-group row class="pt-1" v-model="flagAgent">
					<v-radio
						hide-details
						color="success"
						label="Agente de Retención"
						value="retention"
					></v-radio>
					<v-radio
						hide-details
						color="success"
						label="Agente de Detracción"
						value="detraction"
					></v-radio>
				</v-radio-group>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="cancel"
				@accept-button-clicked="$emit('save', model)"
			/>
		</section>
	</div>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.companyId = this.$userInfo.companyId;
		this.model.typeDestinationId = 1;
		this.loadResources();
	}

	function cancel() {
		this.model = {
			accountAdvanceAccount: '',
			accountingCode: '',
			countryId: null,
			flagAccounting: null,
			flagDetraction: null,
			flagExemptTaxes: null,
			flagItemsWithoutRetainer: null,
			flagRetentionAgent: null,
			flagSpecialContributor: null,
			originIncomeId: null,
			typeDestinationId: null,
		};
		this.$emit('cancel');
	}

	function flagAgent(val) {
		if (val === 'retention') {
			this.model.flagRetentionAgent = 1;
			this.model.flagDetraction = 0;
		} else {
			this.model.flagDetraction = 1;
			this.model.flagRetentionAgent = 0;
		}
	}

	function isForeign() {
		return this.model.typeDestinationId === 2;
	}

	async function loadAccounting({ array, model, search }) {
		const params = { search, status: 1 };
		this.model[model] = '';
		({ data: this[array] } = await this.$httpQuipu.get(
			`accounting-plan/${this.companyId}/quipu`, { params }));
		this[array] = this[array].map((item) => {
			const newItem = { ...item };
			newItem.autocomplete = `${item.code} ${item.name}`;
			return newItem;
		});
		this.setAccountingCodes({
			model,
			value: this[array].find(item => item.code === search),
		});
	}

	function loadData() {
		this.model = { ...this.modelData };
		if (this.model.flagDetraction === 1) {
			this.flagAgent = 'detraction';
		}
		if (this.model.flagRetentionAgent === 1) {
			this.flagAgent = 'retention';
		}
		if (this.model.accountingCode) {
			this.loadAccounting({
				array: 'autocompleteItems',
				model: 'accountingCode',
				search: this.model.accountingCode,
			});
		}
		if (this.model.accountAdvanceAccount) {
			this.loadAccounting({
				array: 'autocompleteAdvanceItems',
				model: 'accountAdvanceAccount',
				search: this.model.accountAdvanceAccount,
			});
		}
	}

	async function loadResources() {
		const request = [
			this.$httpSales.get('countries'),
			this.$httpSales.get('origin-income'),
		];
		[{ data: this.countries }, { data: this.incomeOrigins }] = await Promise.all(request);
		const modelValues = Object.keys(this.modelData);
		const modelValid = modelValues.some(mv => !!this.modelData[mv]);
		if (modelValid) {
			this.loadData();
		}
	}

	function setAccountingCodes({ model, value }) {
		if (value) {
			const { code } = value;
			this.model[model] = code;
		}
	}

	function setData({ model, value }) {
		this.model[model] = value;
	}

	function showAccountingData() {
		const { subsidiary: subsidiaryUser } = this.$userInfo;
		const { configIntegrations } = subsidiaryUser;
		const subsidiaryConfigIntegrations = configIntegrations &&
			((configIntegrations.accountingPlan && configIntegrations.accountingPlan.flagConfig) ||
			(configIntegrations.accountingConfiguration &&
			configIntegrations.accountingConfiguration.flagConfig));
		return subsidiaryConfigIntegrations;
	}

	function data() {
		return {
			accountingProperties: ['code', 'name'],
			autocompleteAdvanceItems: [],
			autocompleteItems: [],
			countries: [],
			destinationTypes: [
				{ id: 1, name: 'Local' },
				{ id: 2, name: 'Exterior' },
			],
			flagAgent: '',
			incomeOrigins: [],
			model: {
				accountAdvanceAccount: '',
				accountingCode: '',
				countryId: null,
				flagAccounting: null,
				flagDetraction: null,
				flagExemptTaxes: null,
				flagItemsWithoutRetainer: null,
				flagRetentionAgent: null,
				flagSpecialContributor: null,
				originIncomeId: null,
				typeDestinationId: null,
			},
		};
	}

	export default {
		name: 'customers-accountancy-form',
		components: {
			autocompleteComponent,
			modalSidebarButton,
		},
		computed: {
			isForeign,
			showAccountingData,
		},
		created,
		data,
		methods: {
			cancel,
			loadAccounting,
			loadData,
			loadResources,
			setAccountingCodes,
			setData,
		},
		props: {
			accountingAccount: {
				default: () => {},
				type: Object,
			},
			accountingAccounts: {
				default: () => [],
				type: Array,
			},
			cleanData: {
				default: false,
				type: Boolean,
			},
			modelData: {
				default: () => {},
				type: Object,
			},
		},
		watch: {
			flagAgent,
		},
	};
</script>
<style lang="scss" scoped>
	.title-section {
		border-bottom: 1px solid color(border-green-light);
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(small13);
		letter-spacing: normal;
		padding-bottom: 8px;
		text-transform: uppercase;
	}
</style>