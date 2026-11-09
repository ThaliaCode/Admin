<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 px-2 mb-1>
				<app-select
					:item="model.costCenterId"
					item-text="name"
					item-value="id"
					:items="costCenters"
					label="Centro de Costos Padre"
					model="costCenterId"
					:return-object="false"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-input-text
					label="Código"
					model="code"
					:text="model.code"
					@input="setData"
				/>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<app-input-text
					label="Nombre"
					model="name"
					:text="model.name"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 px-2 mb-1>
				<autocomplete-component
					append-icon="search"
					class="cost-center-account"
					select-column="4"
					disabled-column="8"
					disabled-class="accounting-input-disabled"
					http-code="$httpQuipu"
					:item="model.account"
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
					:resource-url="`/accounting-plan/${companyId}/quipu?status=1&subsidiaryId=${subsidiaryId}`"
					return-object
					select-create
					@return-data="setAccount({ model: 'account', value: $event })"
				></autocomplete-component>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled || checkBlankCode(model.code)"
				@cancel-button-clicked="$emit('on-close')"
				@accept-button-clicked="$emit('on-save', model)"
			/>
		</section>
	</div>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function mounted() {
		this.companyId = this.$userInfo.companyId;
		if (this.id) {
			this.loadData();
		}
	}

	function disabled() {
		return this.loading || !this.model.code || !this.model.name;
	}

	async function loadAccounting(search) {
		const params = { search, status: 1, subsidiaryId: this.subsidiaryId };
		this.model.account = '';
		({ data: this.autocompleteItems } = await this.$httpQuipu.get(
			`accounting-plan/${this.companyId}/quipu`, { params }));
		this.autocompleteItems = this.autocompleteItems.map((item) => {
			const newItem = { ...item };
			newItem.autocomplete = `${item.code} ${item.name}`;
			return newItem;
		});
		this.setAccount({
			model: 'account',
			value: this.autocompleteItems.find(item => item.code === search),
		});
	}

	async function loadData() {
		try {
			({ data: this.model } = await this.$httpSales.get(`cost-center/${this.id}`));
			if (this.model.account) {
				this.loadAccounting(this.model.account);
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function setAccount({ model, value }) {
		if (value) {
			const { code, name } = value;
			this.model[model] = code;
			this.accountName = name;
		} else {
			this.accountName = null;
		}
	}

	function setData({ model, value }) {
		this.model[model] = value;
	}

	function data() {
		return {
			accountName: null,
			accountingProperties: ['code', 'name'],
			accounts: [],
			autocompleteItems: [],
			companyId: null,
			model: {
				account: null,
				code: null,
				costCenterId: null,
				name: null,
			},
			search: null,
		};
	}

	export default {
		name: 'cost-centers-form',
		components: {
			autocompleteComponent,
			modalSidebarButton,
		},
		computed: {
			disabled,
		},
		data,
		methods: {
			loadAccounting,
			loadData,
			setAccount,
			setData,
		},
		mounted,
		props: {
			costCenters: {
				default: () => [],
				type: Array,
			},
			id: [Number, String],
			loading: {
				default: false,
				type: Boolean,
			},
			subsidiaryId: [Number, String],
		},
	};
</script>
