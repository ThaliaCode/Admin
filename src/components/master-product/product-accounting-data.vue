<template>
	<div>
		<v-layout row wrap px-4 pt-3>
			<v-flex xs12>
				<v-layout row wrap v-if="showAccountingData">
					<v-flex xs12 mb2 class="title-section">
						<span>CUENTAS CONTABLES</span>
					</v-flex>
					<v-flex xs8 pr-2>
						<button
							class="product-add-btn mt-1"
							:disabled="loadingAddAccount"
							type="button"
							@click="$emit('add-row', 'accounting-accounts')"
						>
							<span>Agregar cuentas contables</span>
							<v-icon
								class="product-add-btn-icon"
								color="primary" size="17"
							>
								add_circle
							</v-icon>
						</button>
					</v-flex>
					<v-layout
						row wrap align-center
						v-for="(accountingAccount, accIndex) in accountingAccountsAdded"
						:key="accountingAccount.id"
					>
						<v-flex xs11 mt-3 pr-2>
							<autocomplete-component
								append-icon="arrow_drop_down"
								select-column="4"
								disabled-column="8"
								disabled-class="accounting-input-disabled"
								http-code="$httpQuipu"
								:item="accountingAccount"
								item-text="fullName"
								item-value="id"
								:items="accountingAccounts"
								model="accountingAccount"
								:on-clean="cleanData"
								placeholder-value="Busca una cuenta"
								placeholder-input="Nombre de la cuenta"
								prop="account"
								prop-search="fullName"
								:readonly-prop="accountingAccount.name"
								readonly-prop-show
								:resource-url="`accounting-accounts/${$userInfo.company.country.countryCode}/${$userInfo.subsidiary.ruc}/fb`"
								return-object
								select-create
								@return-data="$emit('set-data', accIndex, $event)"
							></autocomplete-component>
						</v-flex>
						<v-flex xs1 mt-3>
							<app-tooltip-button
								color="error"
								icon="remove_circle"
								text="Eliminar Cuenta"
								@click-icon="$emit('delete-account', accountingAccount)"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</v-layout>
			</v-flex>
			<v-flex xs12 mt-3>
				<v-layout row wrap>
					<v-flex xs12 mb2 class="title-section">
						<span>OTROS IMPUESTOS</span>
					</v-flex>
					<v-flex xs12>
						<autocomplete-component
							append-icon="arrow_drop_down"
							http-code="$httpSales"
							:item="model.codeRetention"
							item-text="fullName"
							item-value="code"
							:items="retentionCodes"
							model="codeRetention"
							:on-clean="cleanData"
							placeholder-value="Código de Retención"
							prop="fullName"
							prop-search="fullName"
							:resource-url="`catalog-sunat-details-list/${tableCodeRetentions}`"
							return-object
							select-create
							@return-data="setData({ model: 'codeRetention', value: $event })"
						></autocomplete-component>
					</v-flex>
					<v-flex xs12 mt-4
						v-for="(tax, taxIndex) in model.taxes"
						:key="taxIndex">
						<v-layout wrap>
							<v-flex xs2>
								<v-checkbox
									:disabled="!tax.codesPercentage"
									hide-details
									:label="tax.description"
									v-model="tax.isSelected"
									@change="onTaxSelected(tax, $event)"
								></v-checkbox>
							</v-flex>
							<v-flex xs10 pl-3>
								<app-select
									:disabled="!tax.codesPercentage"
									:item="taxesSelected[tax.code]"
									item-text="description"
									item-value="codePercentage"
									:items="tax.codesPercentage"
									place-holder="Porcentaje"
									return-object
									@input="setTax(tax.code, $event)"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading"
				@cancel-button-clicked="$emit('cancel-button')"
				@accept-button-clicked="saveData"
			></modal-sidebar-button>
		</section>
	</div>
</template>

<script>
	import h from '@/shared/helper';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import TableCode from '@/shared/table-code';

	const { getLocalData } = h;

	function created() {
		this.loadCodes();
		this.loadData();
		this.generalTaxes = getLocalData('general-taxes');
	}

	async function loadCodes() {
		try {
			const { data: retentionCodes } = await this.$httpSales.get(
				`catalog-sunat-details-list/${TableCode.Retentions}`);
			retentionCodes.forEach((rc) => {
				const newRc = { ...rc };
				newRc.fullName = `${newRc.code} ${newRc.description}`;
				this.retentionCodes.push(newRc);
			});
			this.model.codeRetention = this.codeRetention;
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadData() {
		try {
			({ data: this.model.taxes } = await this.$httpSales.get(
				`catalog-sunat-details-list/${TableCode.Taxes}`));
			const taxGeneral = this.taxes.find(t =>
				t.percentage === this.labelsByCountry.percentage);
			const idxTax = this.model.taxes.findIndex(t =>
				t.description === taxGeneral.name);
			this.model.taxes.splice(idxTax, 1);
			this.model.taxes = this.model.taxes.map((t) => {
				const newT = { ...t };
				newT.isSelected = false;
				newT.codeTable = TableCode.Taxes;
				return newT;
			});
			this.loadTaxesPercentage();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	async function loadTaxesPercentage() {
		const request = [
			this.$httpSales.get(`catalog-sunat-details-list/${TableCode.Ice}`),
		];
		if (this.isPeru) {
			request.push(this.$httpSales.get(`catalog-sunat-details-list/${TableCode.Icbper}`));
			request.push(this.$httpSales.get(`catalog-sunat-details-list/${TableCode.free}`));
		}
		try {
			const res = await Promise.all(request);
			const responses = Array(this.model.taxes.length);
			responses[0] = res[0];
			if (this.isPeru) {
				const index = this.model.taxes.findIndex(r => r.code === '07');
				responses[index] = res[1];
				const indexFree = res[2].data.findIndex(r => r.description === 'GRATUITO');
				if (indexFree > -1) {
					this.codeFree = { ...res[2].data[indexFree] };
				}
			}
			this.model.taxes = this.model.taxes.map((mt, mtIndex) => {
				let newMt = { ...mt };
				if (responses[mtIndex]) {
					const taxSelected = this.taxes.find(tax => tax.code === mt.code);
					newMt.codesPercentage = responses[mtIndex].data.map((cp) => {
						const newCp = { ...cp };
						newCp.codePercentage = cp.code;
						return newCp;
					});
					if (this.taxes.length > 0 && !!taxSelected) {
						this.taxesSelected[mt.code] = taxSelected;
					} else {
						this.taxesSelected[mt.code] = {};
					}
					newMt.isSelected = !!taxSelected;
				} else {
					newMt.isSelected = false;
				}
				if (mt.description === 'GRATUITO') {
					newMt = { ...this.codeFree };
					newMt.codePercentage = this.codeFree.value;
					newMt.codesPercentage = [{ ...this.codeFree, codePercentage: this.codeFree.value }];
					newMt.codeTable = TableCode.free;
					newMt.isSelected = mt.isSelected;
				}
				return newMt;
			});
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function onTaxSelected(taxToSelected, checked) {
		if (taxToSelected.codesPercentage[0]) {
			this.taxesSelected[taxToSelected.code] = checked ?
				{ ...taxToSelected.codesPercentage[0] } : {};
		}
	}

	function saveData() {
		const keysTaxes = Object.keys(this.taxesSelected);
		const taxes = keysTaxes.reduce((a, k) => {
			const tax = this.model.taxes.find(t => t.code === k);
			const newTax = {
				code: k,
				codePercentage: this.taxesSelected[k].code,
				codeTable: tax.codeTable,
				flagSales: !!tax.flagTaxes,
				name: tax.description,
				percentage: this.taxesSelected[k].percentage,
			};
			if (this.id) {
				const currentTax = this.taxes.find(t => t.code === k);
				newTax.id = currentTax.id;
			}
			if (tax.isSelected && this.taxesSelected[k].code) {
				a.push(newTax);
			}
			return a;
		}, []);
		const body = { codeRetention: this.model.codeRetention, taxes };
		this.$emit('accept-button', body);
	}

	function setData({ model, value }) {
		this.model[model] = value ? value.code : '';
	}

	function setTax(key, { value }) {
		this.$set(this.taxesSelected, key, value);
		const modelTax = this.model.taxes.find(t => t.code === key);
		this.$set(modelTax, 'isSelected', true);
	}

	function data() {
		return {
			codeFree: null,
			generalTaxes: [],
			model: {
				codeRetention: null,
				taxes: [],
			},
			retentionCodes: [
				{
					code: null,
					fullName: 'Ninguno',
				},
			],
			tableCodeRetentions: TableCode.Retentions,
			taxesSelected: {},
		};
	}

	export default {
		name: 'product-accounting-data',
		components: {
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			loadCodes,
			loadData,
			loadTaxesPercentage,
			onTaxSelected,
			saveData,
			setData,
			setTax,
		},
		props: {
			accountingAccounts: {
				default: () => [],
				type: Array,
			},
			accountingAccountsAdded: {
				default: () => [],
				type: Array,
			},
			cleanData: {
				default: false,
				type: Boolean,
			},
			codeRetention: {
				type: String,
			},
			isLoading: {
				default: false,
				type: Boolean,
			},
			loadingAddAccount: {
				default: false,
				type: Boolean,
			},
			productId: {
				type: [Number, String],
			},
			showAccountingData: {
				default: false,
				type: Boolean,
			},
			taxes: {
				default: () => [],
				type: Array,
			},
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
	margin-bottom: 14px;
	margin-top: 20px;
	padding-bottom: 8px;
	text-transform: uppercase;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}
</style>