<template>
	<div>
		<v-layout wrap mt-5 px-4 align-center>
			<v-flex xs12>
				<app-select
					autocomplete
					:item="model.codeRetention"
					item-text="fullName"
					item-value="code"
					:items="retentionCodes"
					label="Código de Retención"
					model="codeRetention"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12 mt-4
				v-for="(tax, taxIndex) in model.taxes"
				:key="taxIndex">
				<v-layout wrap>
					<v-flex xs2>
						<v-checkbox
							hide-details
							:disabled="taxIndex === 0"
							:label="tax.description"
							v-model="tax.isSelected"
						></v-checkbox>
					</v-flex>
					<v-flex xs10 pl-3>
						<app-select
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
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveData"
			/>
		</section>
	</div>
</template>

<script>
	import appSelect from '@/components/shared/app-select';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import tableCode from '@/shared/table-code';
	import h from '@/shared/helper';

	function created() {
		this.loadCodes();
		this.loadData();
		this.generalTaxes = h.getLocalData('general-taxes');
	}

	async function loadCodes() {
		try {
			const { data: retentionCodes } = await this.$httpSales.get(
				`catalog-sunat-details-list/${tableCode.Retentions}`);
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
				`catalog-sunat-details-list/${tableCode.Taxes}`));
			this.model.taxes = this.model.taxes.map((t, tIndex) => {
				const newT = { ...t };
				const taxSelected = this.taxes.find(tax => tax.code === t.code);
				newT.isSelected = this.taxes.length > 0 ? !!taxSelected : tIndex === 0;
				newT.codeTable = tableCode.Taxes;
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
			this.$httpSales.get(`catalog-sunat-details-list/${tableCode.IvaRate}`),
			this.$httpSales.get(`catalog-sunat-details-list/${tableCode.Ice}`),
		];
		if (this.isPeru) {
			request.push(this.$httpSales.get(`catalog-sunat-details-list/${tableCode.Icbper}`));
			request.push(this.$httpSales.get(`catalog-sunat-details-list/${tableCode.free}`));
		}
		try {
			const res = await Promise.all(request);
			const responses = Array(this.model.taxes.length);
			responses[0] = res[0];
			responses[1] = res[1];
			if (this.isPeru) {
				const index = this.model.taxes.findIndex(r => r.code === '07');
				responses[index] = res[2];
				const indexFree = res[3].data.findIndex(r => r.description === 'GRATUITO');
				if (indexFree > -1) {
					this.codeFree = { ...res[3].data[indexFree] };
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
					} else if (mtIndex === 0) {
						this.taxesSelected[mt.code] = { ...newMt.codesPercentage[0] };
					} else {
						this.taxesSelected[mt.code] = {};
					}
					if (this.$route.name === 'accounting-new-product') {
						if (newMt.code === '2') {
							newMt.isSelected = true;
						}
					} else {
						newMt.isSelected = !!taxSelected;
					}
				}
				if (mt.description === 'GRATUITO') {
					newMt = { ...this.codeFree };
					newMt.codePercentage = this.codeFree.value;
					newMt.codeTable = tableCode.free;
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
		this.$emit('send-data', body);
	}

	function setData({ model, value }) {
		this.model[model] = value ? value.code : '';
	}

	function setTax(key, { value }) {
		this.$set(this.taxesSelected, key, value);
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
			taxesSelected: {},
		};
	}

	export default {
		name: 'product-taxes-config',
		components: {
			appSelect,
			modalSidebarButton,
		},
		created,
		data,
		props: {
			codeRetention: {
				type: String,
			},
			productId: {
				type: [Number, String],
			},
			taxes: {
				default: () => [],
				type: Array,
			},
		},
		methods: {
			loadCodes,
			loadData,
			loadTaxesPercentage,
			saveData,
			setData,
			setTax,
		},
	};
</script>
