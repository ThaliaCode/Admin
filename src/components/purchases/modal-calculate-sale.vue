<template>
	<v-card class="modal-items">
		<v-card-title class="modal-items-title">
			VISUALIZAR TU PRECIO DE VENTA
		</v-card-title>
		<v-divider></v-divider>
		<v-layout
			v-if="!showListPrice"
			align-center
			row
			class="bg-header py-2 px-5 mt-1"
		>
			<v-flex>
				<img src="/static/icon/exclamacion.svg" />
			</v-flex>
			<v-flex class="ml-2 primary--text text-alert">
				Para editar el precio de venta, elimine el producto del listado de
				compra y modifique el precio al agregar el producto
			</v-flex>
		</v-layout>
		<v-card-text>
			<v-flex class="title-header pb-1">Información del Producto</v-flex>
			<v-layout mt-2>
				<v-layout row wrap align-center>
					<v-flex d-flex align-center pl-2 class="column-label">
						Nombre:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ objPricesale.nameProduct }}
					</v-flex>
				</v-layout>
				<v-layout row wrap align-center ml-1>
					<v-flex d-flex align-center pl-2 class="column-label width-stock">
						Código:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ objPricesale.codeProduct }}
					</v-flex>
				</v-layout>
			</v-layout>
			<v-layout mt-1>
				<v-layout row wrap align-center>
					<v-flex d-flex align-center pl-2 class="column-label width-stock">
						Stock Total:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ objPricesale.stockProduct }}
					</v-flex>
				</v-layout>
				<v-layout row wrap align-center ml-1>
					<v-flex d-flex align-center pl-2 class="column-label width-cprom">
						Costo Promedio:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ objPricesale.costPromProducto | round }}
					</v-flex>
				</v-layout>
			</v-layout>
			<v-flex class="title-header mt-3 pb-1">
				<v-layout row justify-space-between wrap>
					<v-flex>Última Compra</v-flex>
					<v-flex text-xs-right class="ft-11"
						>Fecha:
						<span class="gray-color">{{
							ultProductInfo.createdAt
						}}</span></v-flex
					>
				</v-layout>
			</v-flex>
			<v-flex v-if="showNotPurchase">
				<table class="table-sale mt-2">
					<tr>
						<th
							v-for="(item, index) in columnsSale"
							:key="index"
							class="item-column"
						>
							{{ item.name }}
						</th>
					</tr>
					<tr>
						<td class="row-table">{{ ultProductInfo.name }}</td>
						<td class="row-table">{{ ultProductInfo.price }}</td>
						<td class="row-table">{{ ultProductInfo.quantity }}</td>
						<td class="row-table">{{ ultProductInfo.tax }}</td>
						<td class="row-table">{{ ultProductInfo.total | round }}</td>
						<td class="row-table">{{ ultProductInfo.number }}</td>
						<td class="row-table">
							<button
								@click="goToDetailPurchase(ultProductInfo)"
								class="link-purchase"
							>
								{{ ultProductInfo.serie }}
							</button>
						</td>
						<td class="row-table">{{ ultProductInfo.percentageUtil }}</td>
						<td class="row-table">{{ ultProductInfo.utilImp }}</td>
					</tr>
				</table>
			</v-flex>
			<v-flex v-else mt-2>
				El producto seleccionado no tiene registros de compra.
			</v-flex>
			<v-flex class="title-header" mt-4>
				<v-layout row wrap justify-space-between>
					<v-flex xs7 pb-1>Detalle de Compra</v-flex>
					<v-flex xs4 ml-1>
						<v-layout row align-center>
							<v-flex class="label-util">Total</v-flex>
							<v-flex ml-2>
								<v-switch
									hide-details
									color="success"
									:false-value="0"
									:true-value="1"
									v-model="changeTotal"
									@change="changeSwitchTotal"
								></v-switch>
							</v-flex>
							<v-flex class="label-util"> SubTotal </v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex mt-3>
				<v-layout row wrap>
					<v-flex xs2>
						<v-layout column>
							<v-flex class="label-input" text-xs-center> Cant </v-flex>
							<v-flex xs1>
								<app-input-text
									:disabled="disabledEdit"
									type="number"
									model="quantity"
									:text="objPricesale.quantity"
									@input="setDetailPurchase"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 ml-2>
						<v-layout column>
							<v-flex class="label-input" text-xs-center> C.Unit </v-flex>
							<v-flex xs1>
								<app-input-text
									:disabled="disabledEdit"
									model="costUnit"
									:text="objPricesale.costUnit | formatNumber"
									@input="setDetailCostUnit"
									type="number"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 ml-2>
						<v-layout column>
							<v-flex class="label-input" text-xs-center> Sub Total </v-flex>
							<v-flex
								xs1
								v-if="showTotal"
								pt-1
								text-xs-center
								class="text-information-list"
							>
								<app-input-text
									:disabled="disabledEdit"
									model="total"
									:text="objPricesale.subtotal | formatNumber"
									type="number"
									@input="setDetailSubtotal"
								/>
							</v-flex>
							<v-flex
								v-else
								xs1
								pt-2
								text-xs-center
								class="text-information-list"
							>
								{{ objPricesale.subtotal | formatNumber }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 ml-2>
						<v-layout column>
							<v-flex class="label-input" text-xs-center>
								{{ labelsByCountry.taxName }}
							</v-flex>
							<v-flex xs1 pt-2 text-xs-center class="text-information-list">
								{{ objPricesale.tax | formatNumber }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 ml-2>
						<v-layout column>
							<v-flex class="label-input" text-xs-center> Total </v-flex>
							<v-flex xs1>
								<app-input-text
									v-if="!showTotal"
									:disabled="disabledEdit"
									model="total"
									:text="objPricesale.total"
									type="number"
									@input="setDetailTotal"
								/>
								<v-flex
									text-xs-center
									pt-2
									class="text-information-list"
									v-else
									>{{ objPricesale.total | formatNumber }}</v-flex
								>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<div v-if="showListPrice">
				<v-flex mt-4 class="title-header">
					<v-layout row align-center>
						<v-flex xs6>Precio</v-flex>
						<v-flex xs6>
							<v-layout row align-center justify-end>
								<v-flex xs1 class="primary--text ft-8" v-if="!utilPrevious"
									>Editar:</v-flex
								>
								<v-flex xs6 ml-1 v-if="!utilPrevious">
									<v-layout row align-center>
										<v-flex class="label-util ml-2">%Util</v-flex>
										<v-flex ml-2>
											<v-switch
												hide-details
												color="success"
												:false-value="0"
												:true-value="1"
												v-model="changeUtility"
												@change="changeSwitchUtility"
											></v-switch>
										</v-flex>
										<v-flex class="label-util"> Util </v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs4 text-xs-right>
									<v-layout row align-center>
										<v-flex ml-2>
											<v-checkbox
												hide-details
												color="primary"
												v-model="includeTax"
												:true-value="1"
												:false-value="0"
											></v-checkbox>
										</v-flex>
										<v-flex class="label-checkbox ml-1">
											{{ labelTax }}
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex mt-2>
					<app-select
						item-text="name"
						item-value="id"
						label="Lista de Precios"
						model="priceListId"
						:item="priceListObj.priceListId"
						:items="priceListsFilter"
						@input="setPriceList"
					/>
				</v-flex>
				<v-flex mt-3>
					<v-layout row>
						<v-flex xs2>
							<v-layout column v-if="includeTax">
								<v-flex class="label-input" text-xs-center> P. Compra </v-flex>
								<v-flex pt-2 text-xs-center class="text-information-list">
									{{ priceListObj.pricePurchase | formatNumber }}
								</v-flex>
							</v-layout>
							<v-layout column v-else>
								<v-flex class="label-input" text-xs-center>
									Costo. Unit
								</v-flex>
								<v-flex pt-2 text-xs-center class="text-information-list">
									{{ priceListObj.unitCost | formatNumber }}
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs2 ml-2>
							<v-layout column v-if="includeTax">
								<v-flex class="label-input" text-xs-center> P. Vent </v-flex>
								<v-flex mt-1 text-xs-center>
									<v-text-field
										class="filter-select shadow-inset input-max-width"
										v-if="!utilPrevious"
										hide-details
										:disabled="disabledEdit"
										:value="priceListObj.priceSale | formatNumber"
										type="number"
										@input="setPriceSale"
									/>
									<span v-else class="text-information-list">
										{{ priceListObj.priceSale | formatNumber }}
									</span>
								</v-flex>
							</v-layout>
							<v-layout column v-else>
								<v-flex class="label-input" text-xs-center> P. Unit </v-flex>
								<v-flex mt-1 text-xs-center>
									<v-text-field
										class="filter-select shadow-inset input-max-width"
										hide-details
										v-if="!utilPrevious"
										type="number"
										model="priceUnit"
										:value="priceListObj.priceUnit"
										:disabled="disabledEdit"
										@click.stop="stopClick"
										@input="setPriceUnit"
									/>
									<span v-else class="text-information-list">{{
										priceListObj.priceUnit | formatNumber
									}}</span>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs2 ml-2>
							<v-layout column v-if="includeTax">
								<v-flex class="label-input" text-xs-center> % Utilidad </v-flex>
								<v-flex mt-1 text-xs-center>
									<v-text-field
										:disabled="disabledEdit"
										class="filter-select shadow-inset input-max-width"
										hide-details
										v-if="!showUtility && !utilPrevious"
										type="number"
										:value="priceListObj.percentageUtil | formatNumber"
										@click.stop="stopClick"
										@input="setPercentageUtil"
									/>
									<span v-else pt-2 class="text-information-list">{{
										priceListObj.percentageUtil | formatNumber
									}}</span>
								</v-flex>
							</v-layout>
							<v-layout column v-else>
								<v-flex class="label-input" text-xs-center> % Utilidad </v-flex>
								<v-flex mt-1 text-xs-center>
									<v-text-field
										:disabled="disabledEdit"
										class="filter-select shadow-inset input-max-width"
										hide-details
										v-if="!showUtility && !utilPrevious"
										type="number"
										:value="priceListObj.percentageUtilUlt | formatNumber"
										@click.stop="stopClick"
										@input="setPercentageUtilUlt"
									/>
									<span v-else pt-2 class="text-information-list">{{
										priceListObj.percentageUtilUlt | formatNumber
									}}</span>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs2 ml-2>
							<v-layout column v-if="includeTax">
								<v-flex class="label-input" text-xs-center> Utilidad </v-flex>
								<v-flex pt-2 text-xs-center>
									<v-text-field
										:disabled="disabledEdit"
										class="filter-select shadow-inset input-max-width"
										hide-details
										v-if="showUtility && !utilPrevious"
										type="number"
										:value="priceListObj.utility"
										@click.stop="stopClick"
										@input="setUtilityImp"
									/>
									<v-flex v-else text-xs-center class="text-information-list">{{
										priceListObj.utility
									}}</v-flex>
								</v-flex>
							</v-layout>
							<v-layout column v-else>
								<v-flex class="label-input" text-xs-center> Utilidad </v-flex>
								<v-flex mt-1>
									<app-input-text
										:disabled="disabledEdit"
										v-if="showUtility && !utilPrevious"
										type="number"
										model="utilityUlt"
										:text="priceListObj.utilityUlt"
										@input="setUtilityImpUlt"
									/>
									<v-flex v-else text-xs-center class="text-information-list">{{
										priceListObj.utilityUlt
									}}</v-flex>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-layout row class="title-header mt-3" pb-2>
					<v-flex>Actualizar precio de venta en:</v-flex>
					<v-flex text-xs-right>
						<app-tooltip-button
							:img="'/static/img/new-icons/icon-help-fill.svg'"
							text="Si en caso no selecciona una tienda, se actualizara en todas sus tiendas con el nuevo precio
								de venta"
						></app-tooltip-button>
					</v-flex>
				</v-layout>
				<v-flex mt-2>
					<app-select
						:disabled="disabledEdit"
						deletable-chips
						label="Tiendas"
						model="warehouseId"
						:item="priceListObj.warehouseId"
						chips
						multiple
						item-text="name"
						item-value="id"
						:items="warehousesSales"
						@input="setParamsWarehouse"
						:return-object="false"
					/>
					<span
						class="error--text caption"
						v-if="!$v.priceListObj.warehouseId.required"
					>
						El campo tienda es requerido
					</span>
				</v-flex>
			</div>
		</v-card-text>
		<v-card-actions class="modal-items-action">
			<v-layout row wrap justify-center>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="error"
						class="btn-action white--text"
						@click="closeDialogChangeSale"
					>
						Cancelar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-card-actions>
	</v-card>
</template>

<script>
import lib from '@/shared/lib';

const { round } = lib;

const twoDecimals = round(2);

export default {
	name: 'modal-calculate-sale',
	props: {
		rowProduct: {
			type: Object,
		},
		priceListsFilter: {
			type: Array,
			default: () => [],
		},
	},
	created() {
		this.disabledEdit = true;
		this.showAddModal = false;
		this.dialogCalculateSale = true;
		const priceListId = Object.keys(this.rowProduct.product.priceList)[0];
		this.priceSaleId = Number(priceListId);
		this.productEdit = this.rowProduct.productId;
		const {
			subtotal,
			nameProduct,
			stockProduct,
			quantity,
			total,
			costUnit,
			tax,
			warehouseId,
			costPromProducto,
			codeProduct,
		} = this.rowProduct.additionalForm || {};
		const { flagEdit } = this.rowProduct.additionInformationPriceList || {};
		this.objPricesale = {
			subtotal: subtotal || this.rowProduct.subtotal,
			nameProduct: nameProduct || this.rowProduct.productName,
			codeProduct: codeProduct || this.rowProduct.productCode,
			costPromProducto: costPromProducto || null,
			stockProduct: stockProduct || this.rowProduct.product.stock,
			quantity: quantity || this.rowProduct.quantity,
			total: total || Number(this.rowProduct.total.toFixed(2)),
			costUnit: costUnit || this.rowProduct.price,
			tax: tax || this.rowProduct.taxAmount,
			warehouseId: warehouseId || this.rowProduct.warehouseProductId,
		};
		const { additionInformationPriceList } = this.rowProduct;
		this.priceListObj = {
			priceListId: additionInformationPriceList
				? additionInformationPriceList.priceListId
				: this.rowProduct.priceListI,
			percentageUtil: additionInformationPriceList
				? additionInformationPriceList.percentageUtil
				: this.rowProduct.utilityPercentage,
			percentageUtilUlt: additionInformationPriceList
				? additionInformationPriceList.percentageUtilUlt
				: null,
			pricePurchase: additionInformationPriceList
				? additionInformationPriceList.pricePurchase
				: null,
			priceSale: additionInformationPriceList
				? additionInformationPriceList.priceSale
				: null,
			priceUnit: additionInformationPriceList
				? additionInformationPriceList.priceUnit
				: null,
			utility: additionInformationPriceList
				? additionInformationPriceList.utility
				: null || this.rowProduct.utilityRow,
			utilityUlt: additionInformationPriceList
				? additionInformationPriceList.utilityUlt
				: null,
		};
		this.priceListObj.priceOrigin = this.priceListObj.priceSale;
		this.showListPrice = flagEdit || false;
		this.loadProductUlt();
	},
	data() {
		return {
			quantity: 0,
			costUnit: 0,
			changeTotal: false,
			changeUtility: false,
			includeTax: 0,
			priceListId: null,
			disabledEdit: false,
			utilPrevious: false,
			labelTax: 'IVA',
			showAddModal: true,
			columnsSale: [
				{
					id: 1,
					name: 'Proovedor',
				},
				{
					id: 2,
					name: 'C.Unit',
				},
				{
					id: 3,
					name: 'Cant',
				},
				{
					id: 4,
					name: '',
				},
				{
					id: 5,
					name: 'Total',
				},
				{
					id: 6,
					name: '#Doc',
				},
				{
					id: 7,
					name: 'Serie',
				},
				{
					id: 8,
					name: '% Util. Ant',
				},
				{
					id: 9,
					name: 'Util. Ant',
				},
			],
			showListPrice: true,
			objPricesale: {
				subtotal: 0,
				costUnit: 0,
				tax: null,
				quantity: null,
				total: null,
				warehouseId: null,
			},
			ultProductInfo: {},
			showNotPurchase: true,
			showTotal: false,
			priceListObj: {
				flagEdit: false,
				percentageUtil: null,
				percentageUtilUlt: null,
				priceSaleOrigin: null,
				priceListId: null,
				pricePurchase: null,
				priceSale: null,
				priceUnit: null,
				unitCost: null,
				utility: null,
				utilityUlt: null,
				warehouseId: [],
			},
		};
	},
	computed: {
		priceListObjFiltered() {
			return (
				this.priceListsFilter.find((item) => item.id === this.priceListId) || {}
			);
		},
	},
	methods: {
		closeDialogChangeSale() {
			this.$emit('close-modal', null);
		},
		setDetailPurchase({ model, value }) {
			const { taxes } = this.selectedProduct && this.selectedProduct.product;
			const validTax = taxes.find(
				(p) => p.codePercentage === '02' || p.codePercentage === '03'
			);
			const percentage = validTax ? 0 : this.labelsByCountry.percentage;
			this.objPricesale[model] = value;
			this.objPricesale.subtotal =
				Number(value) * Number(this.objPricesale.costUnit);
			this.objPricesale.total =
				this.objPricesale.subtotal * Number(`1.${percentage}`);
			this.objPricesale.tax =
				this.objPricesale.total - this.objPricesale.subtotal;
			this.total = this.objPricesale.total;
			this.priceListObj.pricePurchase =
				this.objPricesale.total / Number(this.objPricesale.quantity);
			this.priceListObj.unitCost =
				this.priceListObj.pricePurchase / Number(`1.${percentage}`);
			this.priceListObj.utility = Number(
				this.priceListObj.priceSale - this.priceListObj.pricePurchase
			).toFixed(2);
			this.priceListObj.percentageUtil =
				(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
		},
		setDetailCostUnit({ model, value }) {
			const { taxes } = this.selectedProduct && this.selectedProduct.product;
			const validTax = taxes.find(
				(p) => p.codePercentage === '02' || p.codePercentage === '03'
			);
			const percentage = validTax ? 0 : this.labelsByCountry.percentage;
			this.objPricesale[model] = Number(value);
			this.objPricesale.subtotal =
				Number(value) * Number(this.objPricesale.quantity);
			this.objPricesale.tax = twoDecimals(
				this.objPricesale.subtotal * Number(`0.${percentage}`)
			);
			this.objPricesale.total = twoDecimals(
				Number(this.objPricesale.tax) + Number(this.objPricesale.subtotal)
			);
			this.total = this.objPricesale.total;
			this.priceListObj.pricePurchase =
				Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
			this.priceListObj.unitCost =
				this.priceListObj.pricePurchase / Number(`1.${percentage}`);
			this.priceListObj.utility = Number(
				this.priceListObj.priceSale - this.priceListObj.pricePurchase
			).toFixed(2);
			this.priceListObj.percentageUtil =
				(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
		},
		setPriceList({ model, value }) {
			const percentage = this.labelsByCountry.percentage;
			this.priceListObj[model] = value.id;
			const objPrice = this.priceListsFilter.find((p) => p.id === value.id);
			const { cProm } = this.selectedProduct.product;
			this.priceListObj = {
				pricePurchase: twoDecimals(Number(cProm)),
				unitCost: twoDecimals(Number(cProm) / Number(`1.${percentage}`)),
				priceSale: Number(objPrice.price),
				priceUnit: objPrice.unitPrice,
				priceListId: value.id,
				warehouseId: [],
			};
			this.priceListObj.utility = twoDecimals(
				Number(this.priceListObj.priceSale - this.priceListObj.pricePurchase)
			);
			this.priceListObj.utilityUlt = twoDecimals(
				Number(this.priceListObj.priceUnit - this.priceListObj.unitCost)
			);
			this.priceListObj.percentageUtil =
				this.priceListObj.pricePurchase !== 0
					? twoDecimals(
							(this.priceListObj.utility / this.priceListObj.pricePurchase) *
								100
					  )
					: 0;
			this.priceListObj.percentageUtilUlt = this.priceListObj.unitCost
				? twoDecimals(
						(this.priceListObj.utilityUlt / this.priceListObj.unitCost) * 100
				  )
				: 0;
		},
		goToDetailPurchase({ documentId }) {
			const routeData = this.$router.resolve({
				name: 'purchase-detail',
				params: { id: documentId },
			});
			window.open(routeData.href, '_blank');
		},
		setDetailSubtotal({ model, value }) {
			const { taxes } = this.selectedProduct && this.selectedProduct.product;
			const validTax = taxes.find(
				(p) => p.codePercentage === '02' || p.codePercentage === '03'
			);
			const percentage = validTax ? 0 : this.labelsByCountry.percentage;
			this.objPricesale[model] = Number(value);
			this.objPricesale.tax = twoDecimals(
				this.objPricesale.subtotal * Number(`0.${percentage}`)
			);
			this.objPriesale.costUnit =
				this.objPricesale.total / (this.quantity * Number(`1.${percentage}`));
			this.objPricesale.total = twoDecimals(
				Number(this.objPricesale.tax) + Number(this.objPricesale.subtotal)
			);
			this.total = this.objPricesale.total;
			this.priceListObj.pricePurchase =
				Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
			this.priceListObj.unitCost =
				this.priceListObj.pricePurchase / Number(`1.${percentage}`);
			this.priceListObj.utility = Number(
				this.priceListObj.priceSale - this.priceListObj.pricePurchase
			).toFixed(2);
			this.priceListObj.percentageUtil =
				(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
		},
		changeSwitchTotal(value) {
			this.showTotal = value === 1;
			if (value === 1) {
				this.objPricesale.subtotal = this.objPricesale.total;
				this.objPricesale.total =
					this.objPricesale.subtotal * `1.${this.objPricesale.percentage}`;
				this.total = this.objPricesale.total;
				this.objPricesale.tax =
					this.objPricesale.total - this.objPricesale.subtotal;
				this.objPricesale.costUnit =
					this.objPricesale.total /
					(this.quantity * Number(`1.${this.objPricesale.percentage}`));
				this.priceListObj.pricePurchase =
					Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
				this.priceListObj.unitCost =
					this.priceListObj.pricePurchase /
					Number(`1.${this.objPricesale.percentag}`);
				this.priceListObj.utility = Number(
					this.priceListObj.priceSale - this.priceListObj.pricePurchase
				).toFixed(2);
				this.priceListObj.percentageUtil =
					(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
			} else {
				this.objPricesale.total = this.objPricesale.subtotal;
				this.total = this.objPricesale.total;
				this.objPricesale.subtotal =
					Number(this.objPricesale.total) /
					Number(`1.${this.objPricesale.percentage}`);
				this.objPricesale.tax =
					Number(this.objPricesale.subtotal) *
					Number(`0.${this.objPricesale.percentage}`);
				this.objPricesale.costUnit =
					this.objPricesale.total /
					(this.quantity * Number(`1.${this.objPricesale.percentage}`));
				this.priceListObj.pricePurchase =
					Number(this.objPricesale.total) / Number(this.objPricesale.quantity);
				this.priceListObj.unitCost =
					this.priceListObj.pricePurchase /
					Number(`1.${this.objPricesale.percentag}`);
				this.priceListObj.utility = Number(
					this.priceListObj.priceSale - this.priceListObj.pricePurchase
				).toFixed(2);
				this.priceListObj.percentageUtil =
					(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
			}
		},
		changeSwitchUtility(value) {
			this.showUtility = value === 1;
		},
		async loadProductUlt() {
			const params = {
				productId: this.rowProduct.productId,
			};
			try {
				const { data: ultProductInfo } = await this.$httpSales.get(
					'purchase-article-price',
					{
						params,
					}
				);
				this.ultProductInfo = ultProductInfo;
				this.ultProductInfo.price =
					Math.floor(ultProductInfo.price * 100) / 100;
				const { price } = this.ultProductInfo;
				this.ultProductInfo.utilImp =
					Number(twoDecimals(this.priceListObj.priceUnit - price)) || 0;
				this.ultProductInfo.percentageUtil =
					twoDecimals(
						(Number(this.ultProductInfo.utilImp) / this.ultProductInfo.price) *
							100
					) || 0;
			} catch (error) {
				if (error.status === 400) {
					if (error.data.message === 'PRODUCT_WITHOUT_PURCHASE') {
						this.showNotPurchase = false;
						this.showNotification(error.data.messageError, 'warning');
						this.ultProductInfo = {};
					}
				} else {
					this.showGenericError();
				}
			}
		},

		setDetailTotal({ model, value }) {
			this.total = Number(value);
			const { taxes } = this.selectedProduct && this.selectedProduct.product;
			const validTax = taxes.find(
				(p) => p.codePercentage === '02' || p.codePercentage === '03'
			);
			const percentage = validTax ? 0 : this.labelsByCountry.percentage;
			this.objPricesale[model] = Number(value);
			this.objPricesale.costUnit =
				Number(value) /
				Number(this.objPricesale.quantity) /
				Number(`1.${percentage}`);
			this.objPricesale.subtotal = Number(value) / Number(`1.${percentage}`);
			this.objPricesale.tax =
				Number(this.objPricesale.subtotal) * Number(`0.${percentage}`);
			this.priceListObj.pricePurchase =
				Number(value) / Number(this.objPricesale.quantity);
			this.priceListObj.unitCost =
				this.priceListObj.pricePurchase / Number(`1.${percentage}`);
			this.priceListObj.utility = Number(
				this.priceListObj.priceSale - this.priceListObj.pricePurchase
			).toFixed(2);
			this.priceListObj.percentageUtil =
				(this.priceListObj.utility / this.priceListObj.pricePurchase) * 100;
		},
	},
};
</script>

<style lang="scss" scoped>
.modal-items {
	background: color(white);
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
	color: color(paginationText);
	font-size: 14px;

	&-title {
		background-color: rgba(195, 231, 232, 0.21);
		color: color(primary);
		font-weight: 600;
		padding: 13px 29px;
		text-transform: uppercase;
	}

	&-all {
		background-color: rgba(195, 231, 232, 0.5);
		padding: 9px 0;
	}

	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
		}
	}

	&-action {
		background-color: rgba(195, 231, 232, 0.21);
		padding: 15px 0;
	}
}

.item-column {
	background-color: white;
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
	padding: 6px 5px;
}

.table-sale {
	border-collapse: collapse;
	width: 100%;
}
.bg-header {
	background-color: rgba(2, 151, 155, 0.06);
}
.text-alert {
	font-size: 12px;
	font-weight: 500;
}
.title-header {
	border-bottom: solid 0.5px rgba(8, 95, 101, 0.25);
	color: color(sidebar);
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
}
.label-input {
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 10px;
}
.table-sale {
	border-collapse: collapse;
	width: 100%;
}
.row-table {
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	padding: 4px 6px;
	text-align: center;
}
.width-stock {
	max-width: 185px !important;
}

.width-cprom {
	max-width: 138px !important;
}
.link-purchase {
	color: #237bf5;
	font-family: font(open-regular);
	font-size: 12px;
}
</style>
