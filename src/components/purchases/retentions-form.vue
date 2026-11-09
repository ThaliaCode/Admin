<template>
	<div class="pt-3">
		<v-layout wrap align-center px-4 v-if="supplier">
			<v-flex xs4 pl-2 pr-4 pb-2 body-1>
				<span class="body-2" v-if="supplier.msTypePerson">
					{{ supplier.msTypePerson.name }}:
				</span> {{ supplier.documentNumber }}
			</v-flex>
			<v-flex xs4 pr-4 pb-2 body-1>
				<v-tooltip top>
					<span class="body-2" slot="activator">
						Nro. Aut. SRI Prov.:
					</span>
					<span>Número de Autorización SRI del proveedor de la compra</span>
				</v-tooltip>
				<span v-if="supplier.additionalInformation">
					{{ supplier.additionalInformation.sriAuthNumber }}
				</span>
			</v-flex>
			<v-flex xs4 pr-4 pb-2 body-1>
				<v-tooltip top>
					<span class="body-2" slot="activator">
						Nro. Aut. SRI Ret.:
					</span>
					<span>Número de autorización de la retención</span>
				</v-tooltip>
				<span>
					{{ purchase.authorizationNumber }}
				</span>
			</v-flex>
			<v-flex xs4 pl-2 pb-2 body-1>
				<span class="body-2">
					Clave:
				</span>
				<span>
					{{ purchase.password }}
				</span>
			</v-flex>
			<v-flex xs5 pb-2 body-1>
				<span class="body-2">
					Fecha Emisión {{ purchase.typeDocumentCode }}:
				</span>
				<span v-if="dateFormatted">
					{{ purchase.dateDocument | exactDate('DD/MM/YYYY HH:mm:ss', true) }}
				</span>
				<span v-else>
					{{ purchase.dateDocument }}
				</span>
			</v-flex>
		</v-layout>
		<v-layout wrap align-end px-4 v-else-if="fromSale && customer">
			<v-flex xs4 pl-2 pr-4 pb-3 class="label-customer">
				<span class="label-document" v-if="customer.typePerson">
					{{ customer.typePerson.documentName }}:
				</span> {{ customer.typePerson.documentNumber }}
			</v-flex>
			<v-flex xs2 pr-2 pb-2 body-1>
				<label class="caption">Fecha</label>
				<date-component
					:date="model.dateDocument"
					icon="/static/img/calendar.svg"
					@on-input="setRetentionData({ value: $event, model: 'dateDocument' })"
				></date-component>
				<span class="form-group__message" v-if="!model.dateDocument">
					La fecha es requerida
				</span>
			</v-flex>
			<v-flex xs6 pr-4 pb-2 body-1>
				<v-layout row wrap>
					<v-flex xs8>
						<label class="caption">Retención Serie - Número</label>
					</v-flex>
					<v-flex xs4>
						<label class="caption"># Autorización</label>
					</v-flex>
					<v-flex xs8>
						<v-layout row wrap>
							<v-flex xs6 pr-2>
								<app-input-text
									model="serie"
									:text="model.serie"
									:max-length="maxLengthSerie"
									@input="setRetentionData"
								></app-input-text>
								<span class="form-group__message" v-if="!model.serie">
									La serie es requerida
								</span>
							</v-flex>
							<v-flex xs6 pr-2>
								<app-input-text
									model="number"
									:text="model.number"
									type="number"
									@input="setRetentionData"
								></app-input-text>
								<span class="form-group__message" v-if="!model.number">
									El número es requerido
								</span>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs4>
						<app-input-text
							model="authorizationNumber"
							:text="model.authorizationNumber"
							type="number"
							@input="setRetentionData"
						></app-input-text>
						<span class="form-group__message" v-if="!model.authorizationNumber">
							El # de autoriz. es requerido
						</span>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap align-center py-3>
			<v-flex xs12 px-4 class="subheader-container">
				<v-subheader class="black--text body-2 px-2">
					IVA
				</v-subheader>
			</v-flex>
			<v-flex xs12 px-4>
				<v-layout wrap align-end px-2 py-3 v-show="showGoods">
					<v-flex xs1 pb-2>
						<span class="body-2">BIENES:</span>
					</v-flex>
					<v-flex xs2 px-3 class="pos-relative">
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							:error="errors.goods.show"
							label="Base"
							model="base"
							:readonly="readonly"
							:text="purchaseTaxes"
							type="number"
							@input="getGoodsValue"
						/>
						<span class="form-group__message" v-if="errors.goods.show">
							{{ errors.goods.message }}
						</span>
					</v-flex>
					<v-flex xs3 pr-2>
						<app-select
							clearable
							solo
							:item="goods.retentionCode"
							item-text="autocomplete"
							item-value="code"
							:items="ivaRetentionCodes"
							label="Código Retención SRI"
							model="retentionCode"
							:return-object="false"
							@input="getGoodsValue"
						/>
					</v-flex>
					<v-flex xs1 px-2>
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							label="% Ret"
							model="retentionPercentage"
							readonly
							:text="goods.retentionPercentage"
							type="number"
							@input="getGoodsValue"
						/>
					</v-flex>
					<v-flex xs1 pl-2>
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							label="Valor Ret."
							tooltip="Valor Retenido"
							model="retentionAmount"
							readonly
							:text="goods.retentionAmount | round"
							type="number"
							@input="getGoodsValue"
						/>
					</v-flex>
					<v-flex xs2 pl-3>
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							label="Código Contable"
							model="accountingCode"
							readonly
							:text="goods.accountingCode"
							type="number"
							@input="getGoodsValue"
						/>
						<span
							class="text-not-code-blank"
							v-if="checkBlankCode(goods.accountingCode)">
							No se permite espacios en blanco
						</span>
					</v-flex>
				</v-layout>
				<v-layout wrap align-end px-2 py-3 v-show="showServices">
					<v-flex xs1 pb-2>
						<span class="body-2">SERVICIOS:</span>
					</v-flex>
					<v-flex xs2 px-3 class="pos-relative">
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							:error="errors.services.show"
							label="Base"
							model="base"
							:readonly="readonly"
							:text="services.base | round"
							type="number"
							@input="getServicesValue"
						/>
						<span class="form-group__message" v-if="errors.services.show">
							{{ errors.services.message }}
						</span>
					</v-flex>
					<v-flex xs3 pr-2>
						<app-select
							:item="services.retentionCode"
							item-text="autocomplete"
							item-value="code"
							:items="ivaRetentionCodes"
							label="Código Retención SRI"
							model="retentionCode"
							:return-object="false"
							@input="getGoodsValue"
						/>
					</v-flex>
					<v-flex xs1 px-2>
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							label="% Ret"
							model="retentionPercentage"
							readonly
							:text="services.retentionPercentage"
							type="number"
							@input="getServicesValue"
						/>
					</v-flex>
					<v-flex xs1 pl-2>
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							label="Valor Ret."
							tooltip="Valor Retenido"
							model="retentionAmount"
							readonly
							:text="services.retentionAmount | round"
							type="number"
							@input="getServicesValue"
						/>
					</v-flex>
					<v-flex xs2 pl-3>
						<app-input-text
							class="label-input-retention"
							:disabled="readonly"
							label="Código Contable"
							model="accountingCode"
							readonly
							:text="services.accountingCode"
							type="number"
							@input="getServicesValue"
						/>
						<span
							class="text-not-code-blank"
							v-if="checkBlankCode(services.accountingCode)">
							No se permite espacios en blanco
						</span>
					</v-flex>
				</v-layout>
				<v-layout row wrap align-center px-2 pb-3 v-if="showGoods || showServices">
					<v-flex xs1 pb-2>
						<span class="body-2">Totales:</span>
					</v-flex>
					<v-flex xs2 px-3 class="pos-relative">
						<app-input-text
							class="input-total-retention"
							disabled
							readonly
							:text="totalIva | round"
							type="number"
						/>
					</v-flex>
					<v-flex xs3 pr-2></v-flex>
					<v-flex xs1 px-2></v-flex>
					<v-flex xs1 pl-2>
						<app-input-text
							class="input-total-retention"
							disabled
							readonly
							:text="totalValueRetIva | round"
							type="number"
						/>
					</v-flex>
					<v-flex xs2 pl-3></v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap align-center py-3>
			<v-flex xs12 px-4 class="subheader-container">
				<v-subheader class="black--text body-2 px-2">
					RENTA
					<span class="form-group__message pos-relative pl-2 font16" v-if="errors.rent.show">
						{{ errors.rent.message }}
					</span>
					<div class="margin-left-auto">
						<app-tooltip-button
							:disabled="disabledBtnAdd"
							color="primary"
							icon="add_box"
							:readonly="disabledBtnAdd"
							text="Agregar fila"
							@click-icon="addRow"
						></app-tooltip-button>
					</div>
				</v-subheader>
			</v-flex>
			<v-flex xs12 px-4>
				<v-layout wrap px-2 pt-3 align-center
					v-for="(rent, rentIndex) in groupCodes"
					:key="rentIndex"
				>
					<v-flex
						xs1 :class="rentIndex === 0 ? 'pt-4' : 'pt-1'"
						v-if="groupCodes.length > 1 && !readonly"
					>
						<app-tooltip-button
							color="error"
							icon="indeterminate_check_box"
							text="Eliminar fila"
							@click-icon="removeRow(rentIndex)"
						></app-tooltip-button>		
					</v-flex>
					<v-flex :class="groupCodes.length > 1 ? 'xs11' : 'xs12'">
						<v-layout row wrap align-end>
							<v-flex :class="fromSale ? 'xs1' : 'xs4'">
								<v-layout row wrap align-end>
									<v-flex
										:class="fromSale ? 'xs12 pr-1' : 'xs3 pr-1'"
										v-for="(base, baseIndex) in rent.bases"
										:key="baseIndex"
									>
										<app-input-text
											class="label-input-retention"
											:disabled="readonly"
											:label="rentIndex === 0 ? limitText(base.description, 13) : ''"
											:tooltip="base.description"
											model="value"
											:limit-to-filter="7"
											:readonly="readonly"
											:text="base.value"
											type="number"
											@input="getRentValue($event, rent.bases[baseIndex], rent)"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs4 pr-3 pl-2 class="pos-relative">
								<app-select
									:item="rent.retentionCode"
									item-text="autocomplete"
									item-value="code"
									:items="retentionCodes"
									:label="rentIndex === 0 ? 'Código Retención SRI' : ''"
									model="retentionCode"
									:return-object="false"
									@input="getRentValue($event, rent)"
								/>
								<span class="error--text error-caption" v-if="!rent.retentionCode">
									El código de retención es requerido
								</span>
							</v-flex>
							<v-flex xs4>
								<v-layout wrap align-center>
									<v-flex xs3 pr-3>
										<app-input-text
											class="label-input-retention"
											:disabled="readonly"
											:label="rentIndex === 0 ? '% Ret' : ''"
											model="retentionPercentage"
											readonly
											:text="rent.retentionPercentage"
											type="number"
											@input="getRentValue"
										/>
									</v-flex>
									<v-flex xs4 pr-3>
										<app-input-text
											class="label-input-retention"
											:disabled="readonly"
											:label="rentIndex === 0 ? 'Valor Ret.' : ''"
											tooltip="Valor Retenido"
											model="retentionAmount"
											readonly
											:text="rent.retentionAmount | round"
											type="number"
											@input="getRentValue"
										/>
									</v-flex>
									<v-flex xs5 pr-3>
										<app-input-text
											class="label-input-retention"
											:disabled="readonly"
											:label="rentIndex === 0 ? 'Código Contable' : ''"
											model="accountingCode"
											readonly
											:text="rent.accountingCode"
											type="number"
											@input="getRentValue"
										/>
										<span
											class="text-not-code-blank"
											v-if="checkBlankCode(rent.accountingCode)">
											No se permite espacios en blanco
										</span>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout row wrap align-center px-2 pb-3 pt-2>
					<v-flex xs1 v-if="groupCodes.length > 1 && !readonly"></v-flex>
					<v-flex :class="groupCodes.length > 1 ? 'xs11' : 'xs12'">
						<v-layout row wrap align-end>
							<v-flex :class="fromSale ? 'xs1' : 'xs4'">
								<v-layout row wrap align-end>
									<v-flex
										:class="fromSale ? 'xs12 pr-1' : 'xs3 pr-1'"
										v-for="total in totalsRent"
										:key="total.baseCode"
									>
										<app-input-text
											class="input-total-retention"
											disabled
											readonly
											:text="total.baseValue | round"
											type="number"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs4 pr-3 pl-2 class="pos-relative"></v-flex>
							<v-flex xs4>
								<v-layout wrap align-center>
									<v-flex xs3 pr-3></v-flex>
									<v-flex xs4 pr-3>
										<app-input-text
											class="input-total-retention"
											disabled
											readonly
											:text="totalValueRetRent | round"
											type="number"
										/>
									</v-flex>
									<v-flex xs5 pr-3></v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading || disabled || checkBlankCode(services.accountingCode)"
				:hidden-save-btn="readonly"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
	import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
	import dateComponent from '@/components/shared/date-component';
	import helper from '@/shared/helper';
	import lib from '@/shared/lib';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import tableCode from '@/shared/table-code';

	const { getLocalData, debounce } = helper;
	const { map, round, setNewPropertyByFunction } = lib;
	const decimals2 = round(2);

	function created() {
		this.generalTaxes = getLocalData('general-taxes') || [];
		const baseSale = {
			code: null,
			description: 'Base',
			id: null,
			percentage: 0,
			value: 0,
		};
		this.basesByModule = this.fromSale ? [{ ...baseSale }] : this.bases;
		this.loadRetentionCodes();
	}

	function addRow() {
		this.groupCodes.push({
			accountingCode: 0,
			bases: this.basesByModule.map((base) => {
				const newBase = { ...base };
				newBase.value = 0;
				return newBase;
			}),
			retentionAmount: 0,
			retentionCode: null,
			retentionPercentage: 0,
			subtotal: 0,
			basesTotal: 0,
		});
	}

	function disabledBtnAdd() {
		const groupCodesTotal = this.groupCodes.reduce((a, g) =>
			Number(a) + Number(g.basesTotal), 0);
		const basePrices = Math.round((groupCodesTotal + Number.EPSILON) * 100) / 100;
		const productPrices = Math.round((this.productsAmount + Number.EPSILON) * 100) / 100;
		return this.readonly || (this.errors.rent.show && (basePrices > productPrices));
	}

	function getGoodsValue({ model, value }) {
		if (value) {
			const goodsTaxAmount = this.goodsProducts.reduce((a, gp) =>
				a + Number(gp.taxAmount), 0);
			this.$set(this.goods, model, model === 'retentionCode' ? value : Number(value));
			if (model === 'retentionCode') {
				this.setRetentionValues('goods', value);
			} else if (goodsTaxAmount >= Number(value)) {
				if (this.goods.retentionCode) {
					const retentionValue = (this.goods.retentionPercentage / 100);
					const goodsRetentionAmount = Number(value) * retentionValue;
					this.$set(this.goods, 'retentionAmount', goodsRetentionAmount);
					const amount = this.goods.retentionAmount + this.services.retentionAmount;
					this.purchaseTaxes = Number(this.goods.base).toFixed(2);
					this.$emit('retention-iva-amount', amount);
				}
				this.errors.goods.message = '';
				this.errors.goods.show = false;
			} else {
				this.purchaseTaxes = Number(this.goods.base).toFixed(2);
				this.errors.goods.message = `Debe ser <= ${goodsTaxAmount}`;
				this.errors.goods.show = true;
			}
		} else {
			this.goods.retentionPercentage = null;
			this.goods.retentionAmount = null;
			this.goods.retentionCode = null;
		}
	}

	function getRentValue({ model, value }, item, itemParent) {
		if (value) {
			if (model === 'retentionCode') {
				this.$set(item, model, value);
			} else {
				this.$set(item, model, Number.parseFloat(value).toFixed(2));
			}
			const newValue = itemParent ? itemParent.retentionCode : value;
			const newItem = itemParent || item;
			this.setGroupsCodes(newItem, newValue);
		}
	}

	function getServicesValue({ model, value }) {
		if (value) {
			const servicesTaxAmount = this.servicesProducts.reduce((a, sp) =>
				a + decimals2(sp.taxAmount), 0);
			if (servicesTaxAmount >= Number(value)) {
				this.services[model] = model === 'retentionCode' ? value : Number(value);
				if (model === 'retentionCode') {
					this.setRetentionValues('services', value);
				} else {
					const { base, retentionCode, retentionPercentage } = this.services;
					if (retentionCode) {
						this.services.retentionAmount = base * (retentionPercentage / 100);
						const amount = this.goods.retentionAmount + this.services.retentionAmount;
						this.$emit('retention-iva-amount', amount);
					}
				}
			}
			if (model !== 'retentionCode') {
				this.errors.services.message = servicesTaxAmount >= this.roundInNumber(value) ? '' :
					`Debe ser <= ${servicesTaxAmount}`;
				this.errors.services.show = servicesTaxAmount < this.roundInNumber(value);
			}
		}
	}

	function loadData(rent) {
		const flagIncludesTaxes = this.flagIncludesTaxes;
		this.editRetention = this.retentionData.details && this.retentionData.details.length > 0
			&& rent;
		this.products = this.purchase.details.map((det) => {
			const detailPurchase = this.purchaseDetails.find(pd =>
				pd.productCode === det.product.code);
			const newDet = {
				codePercentage: det.codePercentage,
				codeRetention: det.product.codeRetention,
				flagTypeUnit: det.product.flagTypeUnit || det.product.type ||
					det.product.productType,
				id: det.productId || det.warehouseProductId,
				price: det.price,
				quantity: det.quantity,
				taxes: det.product.taxes,
				tax: det.tax,
				taxAmount: detailPurchase.taxAmount,
			};
			return newDet;
		});
		this.productsAmount = this.products.reduce((a, p) => a + Number(p.price * p.quantity), 0);
		this.goodsProducts = this.products.reduce((acum, prod) => {
			const newProd = { ...prod };
			const tax = prod.taxes.find(t => t.flagSales === 1);
			if (prod.flagTypeUnit === 1) {
				newProd.taxId = tax.id;
				acum.push({ ...newProd });
			}
			return acum;
		}, []);
		this.servicesProducts = this.products.reduce((acum, prod) => {
			const newProd = { ...prod };
			const tax = prod.taxes.find(t => t.flagSales === 1);
			if (prod.flagTypeUnit === 2) {
				newProd.taxId = tax.id;
				acum.push({ ...newProd });
			}
			return acum;
		}, []);
		if (this.supplier || this.customer) {
			const entityItem = this.supplier || this.customer;
			const retentionGoods = this.ivaRetentionCodes.find(rc =>
				rc.code === entityItem.codeTaxesGoods) || {};
			const retentionServices = this.ivaRetentionCodes.find(rc =>
				rc.code === entityItem.codeTaxes) || {};
			const retentionPercentageGoods = retentionGoods.percentage || 0;
			const retentionPercentageServices = retentionServices.percentage || 0;
			const baseGoods = this.goodsProducts.reduce((acum, gProd) => {
				const { price, quantity, tax } = gProd;
				const total = price * quantity;
				const subtotal = flagIncludesTaxes ? total / (1 + (tax / 100)) : total;
				return acum + decimals2(subtotal);
			}, 0) || 0;
			const baseServices = this.servicesProducts.reduce((a, sProd) => {
				const { price, quantity, tax } = sProd;
				const newA = a + (((price * quantity) * (1 + (tax / 100))) - (price * quantity));
				return newA;
			}, 0) || 0;
			const realBaseServices = this.services.base || baseServices;
			const retentionAmountServices = realBaseServices * (retentionPercentageServices / 100)
				|| 0;
			if (this.editRetention && (!this.purchaseDisabled || this.readonly)) {
				this.goods = this.setDataIva('BIENES');
				this.services = this.setDataIva('SERVICIOS');
			} else {
				const purTaxes = Number.parseFloat(this.goodsProducts.reduce((acum, gProd) =>
					acum + decimals2(gProd.taxAmount), 0) || 0).toFixed(2);
				const taxEcuador = this.isEcuador ? purTaxes : this.purchaseTaxes;
				this.purchaseTaxes = !this.purchaseTaxes ? purTaxes : taxEcuador;
				this.goods.base = baseGoods;
				this.goods.retentionAmount = this.purchaseTaxes * (retentionPercentageGoods / 100);
				this.goods.retentionCode = entityItem.codeTaxesGoods;
				this.goods.retentionPercentage = retentionPercentageGoods;
				this.services.base = realBaseServices;
				this.services.retentionAmount = retentionAmountServices;
				this.services.retentionCode = entityItem.codeTaxes;
				this.services.retentionPercentage = retentionPercentageServices;
				const amount = this.goods.retentionAmount + retentionAmountServices;
				this.$emit('retention-iva-amount', amount);
			}
			if (rent) {
				this.groupCodes = this.purchaseDisabled && !this.readonly ? this.setGroups() :
					this.setDataGroups();
				this.summaryData();
			}
		}
	}

	async function loadRetentionCodes() {
		const request = [
			this.$httpSales.get(`catalog-sunat-details-list/${tableCode.IvaRetention}`),
			this.$httpSales.get(`catalog-sunat-details-list/${tableCode.Retentions}`),
		];
		[{ data: this.ivaRetentionCodes }, { data: this.retentionCodes }] =
			await Promise.all(request);
		this.setAutoCompleteFieldOn('ivaRetentionCodes', this.ivaRetentionCodes);
		this.setAutoCompleteFieldOn('retentionCodes', this.retentionCodes);
		this.loadData(true);
	}

	function setAutoCompleteFieldOn(flag, retentionCodes) {
		this[flag] = map(
			setNewPropertyByFunction('autocomplete', this.addProperties, false),
			retentionCodes,
		);
	}

	function addProperties({ catalogSunatId, code, description, percentage }) {
		if (catalogSunatId === 9) {
			return `${code} - ${description} ${percentage}%`;
		}
		return `${code} - ${description}`;
	}

	function save() {
		const entityItem = this.supplier || this.customer;
		const body = {
			code: '',
			dateExpiration: entityItem.additionalInformation ?
				entityItem.additionalInformation.endDate : '',
			dateAccouting: '',
			dateDocument: this.purchase.dateDocument,
			details: [],
		};
		const newBody = this.fromSale ? this.model : body;
		newBody.details = this.groupCodes.map((gc, gcIndex) => {
			const zero = this.fromSale ? { value: 0 } : gc.bases.find(b => b.code === '0');
			const recorded = this.fromSale ? { value: 0 } : gc.bases.find(b => b.code === '2');
			const tax = this.fromSale ? gc.bases[0] : gc.bases.find(b => b.code === '6');
			const exempt = this.fromSale ? { value: 0 } : gc.bases.find(b => b.code === '7');
			const newGc = {
				baseZero: zero.value,
				baseRecorded: recorded.value,
				baseTax: tax.value,
				baseExempt: exempt.value,
				namePercentageTax: null,
				codePercentageTax: gc.retentionCode,
				percentageTax: gc.retentionPercentage,
				amountTax: gc.retentionAmount,
				codeAccounting: null,
				codeTax: '1',
				nameTax: 'RENTA',
				description: null,
				numberOrder: 3 + gcIndex,
			};
			return newGc;
		});
		if (this.goodsProducts.length > 0) {
			const detailIvaGoods = {
				baseIva: this.isEcuador ? this.totalIva : this.goods.base,
				namePercentageTax: null,
				codePercentageTax: this.goods.retentionCode,
				percentageTax: this.goods.retentionPercentage,
				amountTax: this.goods.retentionAmount,
				codeAccounting: null,
				codeTax: '2',
				nameTax: 'IVA',
				description: 'BIENES',
				numberOrder: 1,
			};
			if (this.goods.retentionCode) {
				newBody.details.push({ ...detailIvaGoods });
			}
		}
		if (this.servicesProducts.length > 0) {
			const detailIvaServices = {
				baseIva: this.services.base,
				namePercentageTax: null,
				codePercentageTax: this.services.retentionCode,
				percentageTax: this.services.retentionPercentage,
				amountTax: this.services.retentionAmount,
				codeAccounting: null,
				codeTax: '2',
				nameTax: 'IVA',
				description: 'SERVICIOS',
				numberOrder: 2,
			};
			newBody.details.push({ ...detailIvaServices });
		}
		this.$emit('save', newBody);
	}

	function setDataGroups() {
		const groups = this.retentionData.details.filter(d => d.nameTax === 'RENTA');
		return groups.map((group) => {
			const newGroup = {
				accountingCode: group.codeAccounting || 0,
				bases: this.basesByModule.map((base) => {
					const newBase = { ...base };
					if (base.code === '0') {
						newBase.value = group.baseZero;
					} else if (base.code === '2') {
						newBase.value = group.baseRecorded;
					} else if (base.code === '6') {
						newBase.value = group.baseTax;
					} else {
						newBase.value = base.code === '7' ? group.baseExempt : 0;
					}
					return newBase;
				}),
				retentionAmount: group.amountTax || 0,
				retentionCode: group.codePercentageTax || null,
				retentionPercentage: group.percentageTax || 0,
				subtotal: group.baseExempt + group.baseRecorded + group.baseTax + group.baseZero,
			};
			return newGroup;
		});
	}

	function setDataIva(type) {
		const group = this.retentionData.details.find(d => d.description === type);
		if (group) {
			const groupAmountRet = group.percentageTax / 100;
			if (type === 'BIENES') {
				this.purchaseTaxes = this.readonly ? (group.amountTax / groupAmountRet) || 0 :
					group.baseIva || 0;
			}
			return {
				accountingCode: group.codeAccounting || 0,
				base: this.readonly ? (group.amountTax / groupAmountRet) || 0 :
					group.baseIva || 0,
				retentionAmount: group.amountTax || 0,
				retentionCode: group.codePercentageTax || null,
				retentionPercentage: group.percentageTax || 0,
			};
		}
		return {
			accountingCode: 0,
			base: 0,
			retentionAmount: 0,
			retentionCode: null,
			retentionPercentage: 0,
		};
	}

	function setGroups() {
		return this.products.reduce((acum, product) => {
			const newAcum = acum.find(ac => ac.retentionCode === product.codeRetention);
			const indexAcum = acum.findIndex(ac => ac.retentionCode === product.codeRetention);
			const retention = product.codeRetention ?
				this.retentionCodes.find(rc => rc.code === product.codeRetention) || {} : {};
			const tax = product.taxes.find(pt => pt.flagSales === 1);
			if (indexAcum > -1) {
				acum.splice(indexAcum, 1);
				newAcum.subtotal += this.getSubTotal(product, this.flagIncludesTaxes);
				newAcum.bases = newAcum.bases.map((base) => {
					const newBase = { ...base };
					if (base.code === tax.codePercentage || this.fromSale) {
						const subtotalProduct = this.getSubTotal(product, this.flagIncludesTaxes);
						newBase.value = (Number(newBase.value) + subtotalProduct).toFixed(2);
					}
					return newBase;
				});
				newAcum.retentionAmount = retention.percentage ?
					newAcum.retentionAmount + ((product.price * product.quantity) *
					(retention.percentage / 100)) : 0;
				newAcum.basesTotal = newAcum.bases.reduce((a, b) => a + Number(b.value), 0);
				acum.push({ ...newAcum });
			} else {
				acum.push({
					accountingCode: 0,
					bases: this.basesByModule.map((base) => {
						const newBase = { ...base };
						if (base.code === tax.codePercentage || this.fromSale) {
							newBase.value =
								Number.parseFloat(this.getSubTotal(product, this.flagIncludesTaxes)).toFixed(2);
						}
						return newBase;
					}),
					retentionAmount: retention.percentage ?
						(product.price * product.quantity) * (retention.percentage / 100) : 0,
					retentionCode: product.codeRetention,
					retentionPercentage: retention.percentage || 0,
					subtotal: product.price * product.quantity,
					basesTotal: this.basesByModule.reduce((a, b) => a + Number(b.value), 0),
				});
			}
			return acum;
		}, []);
	}

	function getSubTotal(product, flagIncludesTaxes) {
		const { price, quantity, tax } = product;
		const total = price * quantity;
		const subtotal = flagIncludesTaxes ? total / (1 + (tax / 100)) : total;
		return decimals2(subtotal);
	}

	function setGroupsCodes(group, val) {
		const basesSubtotal = group.bases.reduce((acum, base) => acum + Number(base.value), 0);
		const retention = this.retentionCodes.find(ret => ret.code === val) || {};
		const percentage = retention.percentage || 0;
		const amount = percentage ? basesSubtotal * (percentage / 100) : 0;
		this.$set(group, 'basesTotal', basesSubtotal);
		this.$set(group, 'retentionPercentage', percentage);
		this.$set(group, 'retentionAmount', amount);
		const groupBasesTotal = this.groupCodes.reduce((a, g) => {
			const gBasesTotal = g.bases.reduce((ac, b) => ac + Number(b.value), 0);
			return a + gBasesTotal;
		}, 0);
		const basePrices = Math.round((groupBasesTotal + Number.EPSILON) * 100) / 100;
		const productPrices = Math.round((this.productsAmount + Number.EPSILON) * 100) / 100;
		if (basePrices > productPrices) {
			this.errors.rent.message = `La sumatoria de montos de la renta no debe superar al monto base: ${this.productsAmount}`;
		} else if (basePrices < productPrices) {
			this.errors.rent.message = `La sumatoria de montos de la renta no debe ser menor al monto base: ${this.productsAmount}`;
		} else {
			this.errors.rent.message = '';
		}
		this.errors.rent.show = basePrices > productPrices ||
			basePrices < productPrices;
		const newAmount = this.groupCodes.reduce((ag, gcr) => ag + Number(gcr.retentionAmount), 0);
		this.$emit('retention-amount', newAmount);
	}

	function setRetentionValues(type, val) {
		const entityItem = this.supplier || this.customer;
		if (type === 'goods') {
			this.$set(entityItem, 'codeTaxesGoods', val);
		} else {
			this.$set(entityItem, 'codeTaxes', val);
		}
		this.loadData();
	}

	function showGoods() {
		return this.goodsProducts.length > 0;
	}

	function showServices() {
		return this.servicesProducts.length > 0;
	}

	function summaryData() {
		const goodsBases = this.goodsProducts.reduce((acum, prod) => {
			const tax = prod.taxes.find(pt => pt.flagSales === 1);
			const newAcum = acum.find(ac => ac.code === tax.codePercentage);
			if (newAcum) {
				const index = acum.findIndex(ac => ac.code === tax.codePercentage);
				acum.splice(index, 1);
				newAcum.value += this.getSubTotal(prod, this.flagIncludesTaxes);
				acum.push({ ...newAcum });
			} else {
				const newBase = this.fromSale ? this.basesByModule[0] :
					this.basesByModule.find(base => base.code === tax.codePercentage);
				newBase.value = this.getSubTotal(prod, this.flagIncludesTaxes);
				acum.push({ ...newBase });
			}
			return acum;
		}, []);
		const servicesBases = this.servicesProducts.reduce((acum, prod) => {
			const tax = prod.taxes.find(pt => pt.flagSales === 1);
			const newAcum = acum.find(ac => ac.code === tax.codePercentage);
			if (newAcum) {
				const index = acum.findIndex(ac => ac.code === tax.codePercentage);
				acum.splice(index, 1);
				newAcum.value += (prod.price * prod.quantity);
				acum.push({ ...newAcum });
			} else {
				const newBase = this.fromSale ? this.basesByModule[0] :
					this.basesByModule.find(base => base.code === tax.codePercentage);
				newBase.value = prod.price * prod.quantity;
				acum.push({ ...newBase });
			}
			return acum;
		}, []);
		this.summary = this.basesByModule.map((base) => {
			const newBase = { ...base };
			const goodsBase = goodsBases.find(gb => gb.code === base.code);
			const servicesBase = servicesBases.find(gs => gs.code === base.code);
			delete newBase.value;
			newBase.goods = goodsBase ? goodsBase.value : 0;
			newBase.services = servicesBase ? servicesBase.value : 0;
			return newBase;
		});
	}

	function disabled() {
		return this.groupCodes.some(rent => !rent.retentionCode) ||
			(this.errors.goods.show || this.errors.services.show || this.errors.rent.show) ||
			(this.fromSale && (!this.model.dateDocument || !this.model.number ||
			!this.model.serie || !this.model.authorizationNumber));
	}

	function removeRow(indexGroup) {
		this.groupCodes.splice(indexGroup, 1);
	}

	function totalIva() {
		return Number(this.purchaseTaxes) + Number(this.services.base);
	}
	
	function totalValueRetIva() {
		return Number(this.goods.retentionAmount) + Number(this.services.retentionAmount);
	}
	
	function totalsRent() {
		const valuesByBases = this.groupCodes.reduce((a, gc) => a.concat(gc.bases), []);
		return valuesByBases.reduce((a, gc, gcIdx) => {
			const newBase = { baseCode: null, baseValue: 0 };
			const newA = [...a];
			const baseFinded = newA.findIndex(d => d.baseCode === gc.code);
			if (baseFinded > -1 || (this.fromSale && gcIdx > 0)) {
				const newBaseFinded = { ...newA[baseFinded] };
				// if (gc.code !== '2') {
				// 	newBaseFinded.baseValue += gc.value;
				// }
				newBaseFinded.baseValue = Number(newBaseFinded.baseValue) + Number(gc.value);
				newA[baseFinded] = { ...newBaseFinded };
			} else {
				newBase.baseCode = gc.code;
				newBase.baseValue = Number(gc.value);
				// if (gc.code === '2') {
				// 	newBase.baseValue = this.productsAmount;
				// }
				newA.push({ ...newBase });
			}
			return newA;
		}, []);
	}

	function limitText(text, size) {
		if (text) {
			if (text.length > size) {
				const cutText = text.substring(0, size);
				return `${cutText}...`;
			}
			return text;
		}
		return text;
	}
	
	function totalValueRetRent() {
		return this.groupCodes.reduce((a, tr) => Number(a) + Number(tr.retentionAmount), 0);
	}

	function setRetentionData({ model, value }) {
		this.model[model] = value;
		if (model === 'dateDocument') {
			this.model.dateAccouting = value;
			this.model.dateExpiration = value;
		}
	}

	function maxLengthSerie() {
		return this.isEcuador ? 6 : null;
	}


	function data() {
		return {
			basesByModule: [],
			editRetention: false,
			errors: {
				goods: {
					message: '',
					show: false,
				},
				rent: {
					message: '',
					show: false,
				},
				services: {
					message: '',
					show: false,
				},
			},
			generalTaxes: [],
			goods: {
				accountingCode: 0,
				base: 0,
				retentionAmount: 0,
				retentionCode: null,
				retentionPercentage: 0,
			},
			goodsProducts: [],
			groupCodes: [],
			ivaRetentionCodes: [],
			model: {
				authorizationNumber: null,
				code: '',
				dateAccouting: null,
				dateDocument: null,
				dateExpiration: null,
				description: '',
				details: [],
				number: null,
				serie: null,
			},
			products: [],
			productsAmount: 0,
			purchaseTaxes: 0,
			retentionCodes: [],
			services: {
				accountingCode: 0,
				base: 0,
				retentionAmount: 0,
				retentionCode: null,
				retentionPercentage: 0,
			},
			servicesProducts: [],
			summary: [],
			tableCodeRetentions: tableCode.IvaRetention,
		};
	}

	export default {
		name: 'retentions-form',
		components: {
			autocompleteComponent,
			dateComponent,
			modalSidebarButton,
		},
		computed: {
			disabled,
			disabledBtnAdd,
			maxLengthSerie,
			showGoods,
			showServices,
			totalIva,
			totalValueRetIva,
			totalsRent,
			totalValueRetRent,
		},
		created,
		data,
		methods: {
			addProperties,
			addRow,
			getGoodsValue: debounce(getGoodsValue),
			getRentValue: debounce(getRentValue),
			getServicesValue: debounce(getServicesValue),
			getSubTotal,
			limitText,
			loadData,
			loadRetentionCodes,
			removeRow,
			save,
			setAutoCompleteFieldOn,
			setDataGroups,
			setDataIva,
			setGroups,
			setGroupsCodes,
			setRetentionData,
			setRetentionValues,
			summaryData,
		},
		props: {
			bases: {
				default: () => [],
				type: Array,
			},
			dateFormatted: {
				default: true,
				type: Boolean,
			},
			isLoading: {
				default: false,
				type: Boolean,
			},
			purchase: {
				default: () => {},
				type: Object,
			},
			purchaseDetails: {
				default: () => [],
				type: Array,
			},
			purchaseDisabled: {
				default: true,
				type: Boolean,
			},
			retentionData: {
				default: () => {},
				type: Object,
			},
			supplier: {
				default: () => {},
				type: Object,
			},
			customer: {
				default: () => {},
				type: Object,
			},
			flagIncludesTaxes: {
				deafult: false,
				type: Boolean,
			},
			readonly: {
				deafult: false,
				type: Boolean,
			},
			fromSale: {
				deafult: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.subheader-container {
		background-color: map-get($colors, subheader);
	}

	.subheader {
		height: 34px;
	}

	.summary {
		background-color: map-get($colors, summary);
		border-bottom: 1px solid map-get($colors, blue-grey);
		border-right: 1px solid map-get($colors, blue-grey);

		.caption {
			font-weight: bold;
		}

		&-header {
			background-color: map-get($colors, summaryHeader);
			border-bottom: 1px solid map-get($colors, blue-grey);
		}

		&:last-of-type {
			border-right: 0px;
		}
	}

	.form-group__message {
		position: absolute;
	}

	.font16 {
		font-size: 16px;
	}

	.pos-relative {
		position: relative;
	}

	.margin-left-auto {
		margin-left: auto;
	}

	.error-caption {
		font-size: size(small10);
		position: absolute;
	}

	.label-customer {
		color: color(paginationText);
		font-family: font(open-regular);
		font-size: size(small13);
	}

	.label-document {
		font-family: font(open-semibold);
		padding-right: 15px;
	}

	.mx-datepicker {
		display: block !important;
	}
</style>
