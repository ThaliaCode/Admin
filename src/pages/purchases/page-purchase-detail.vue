<template>
	<div>
		<app-loading :show-icon-loading="loadingGeneral" />
		<header-page caption-navigation="Compras" :title="$route.meta.title"></header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<purchase-detail-data
			class="px-4 mt-3"
			:summary="summary"
			@go-detail-purchases="goToDetail"
		>
		</purchase-detail-data>

		<v-flex xs1 mx-1 text-xs-center v-if="addDetraction">
			<v-btn
				color="primary"
				class="btn-action white--text btn-width"
				@click="showDetraction = true"
			>
				Agregar detracción
			</v-btn>
		</v-flex>

		<v-layout ml-4 mt-3 v-if="isDetraction">
			<v-flex xs3 class="product-list"
				>Información de la Detracción
				<app-tooltip-button
					class="ml-4"
					color="success"
					icon="edit"
					text="Editar Detracción"
					@click-icon="showDetraction = true"
				></app-tooltip-button
			></v-flex>
		</v-layout>

		<purchase-detail-data class="px-4 mt-3" :summary="detraction" v-if="isDetraction" />

		<purchase-detail-data
			class="px-4 mt-1"
			:summary="detractionV2"
			v-if="isDetraction && purchase.additionalInformation.detraction.paymentDate"
		/>

		<v-layout justify-end v-show="detailDynamicForm.length" class="px-4">
			<label class="baseText--text px-2">Ver formularios adicionales</label>
			<app-tooltip-button
				v-show="detailDynamicForm.length"
				color="success"
				icon="library_books"
				text="Formularios adicionales"
				@click-icon="openModalDetailDynamicForm = true"
			/>
		</v-layout>

		<v-layout row wrap mt-4>
			<v-flex xs12 px-4 mx-4 pb-2 class="title-detail"> LISTA DE PRODUCTOS </v-flex>
			<v-flex xs12>
				<purchases-details
					:id-purchases="id"
					:column-actions="false"
					:columns="columns"
					:currency="currencySymbol"
					:flag-includes-taxes="flagIntegrationCtCost"
					:rows="purchase.details"
					detail
					:footer="false"
					readonly
					:retention-amount="retentionAmount"
					:retention-tax-amount="retentionTaxAmount"
					:costs-center="centersCosts"
					:columnActions="true"
					show-cost-center
					@column-input="columnInput"
					@commentaries="makeCommentary"
					@delete-product="deleteProduct"
					@open-series="openSeries"
					@summary-data="summaryData"
					@update-amounts="updateAmounts"
					@update-brand="updateBrand"
					@update-center-cost="updateCenterCost"
					@history-products="openHistoryProducts"
					@update-price-sale="updatePriceSale"
				></purchases-details>
				<v-layout row wrap px-4>
					<v-flex xs12 py-1 class="totals-section d-flex text-xs-center">
						<v-flex class="subtotal">
							<span>Desc.: </span>
							<span
								>{{ purchase.currencySymbol
								}}{{
									purchase.discountAmount || purchase.discountPercentage | round
								}}</span
							>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>Total Cant: </span>
								<span v-if="purchase.details">{{
									purchase.details.reduce(
										(a, p) =>
											a +
											(Number.isInteger(p.quantity) ? p.quantity : p.quantity.toFixed(2)),
										0
									)
								}}</span>
							</div>
						</v-flex>
						<v-flex class="subtotal-container" v-if="isPeru">
							<div class="subtotal">
								<span>IMP.: </span>
								<span
									>{{ purchase.currencySymbol }}{{ priceAmounts.icbper | round }}</span
								>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('imp')"
								>
									<v-icon v-if="selectsTotal[2].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="container-other-taxes" v-if="selectsTotal[2].select">
									<div class="subtotal-menu-content">
										<p>
											<span class="taxes-title">Imp. Bolsa plástica: </span>
											<span
												>{{ purchase.currencySymbol
												}}{{ priceAmounts.icbper | round }}</span
											>
										</p>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>SubT.: </span>
								<span>{{ purchase.currencySymbol }}{{ purchase.subTotal | round }}</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('sub')"
								>
									<v-icon v-if="selectsTotal[3].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="subtotal-menu" v-if="selectsTotal[3].select">
									<div class="subtotal-menu-content">
										<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
											<span class="taxes-title">{{ tax.description }}</span>
											<template v-if="purchase.details.length > 0">
												<span v-if="tax.percentage === 0"
													>{{ purchase.currencySymbol }} 0.00</span
												>
												<span v-else>
													{{ purchase.currencySymbol
													}}{{
														purchase.details.reduce((a, p) => a + p.price * p.quantity, 0)
															| round
													}}
												</span>
											</template>
										</p>
										<small>Nota: Montos incluyen descuentos</small>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>{{ labelsByCountry.taxName }}: </span>
								<span>{{ purchase.currencySymbol }}{{ purchase.taxes | round }}</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('igv')"
								>
									<v-icon v-if="selectsTotal[4].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="subtotal-menu" v-if="selectsTotal[4].select">
									<div class="subtotal-menu-content">
										<p>
											<span class="taxes-title"
												>Retención {{ labelsByCountry.taxName }}</span
											>
											<span
												>{{ purchase.currencySymbol
												}}{{
													withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0) | round
												}}</span
											>
										</p>
										<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
											<span class="taxes-title">{{ tax.description }}</span>
											<template v-if="withholdingTaxTaxes.length > 0">
												<span v-if="tax.percentage === 0"
													>{{ purchase.currencySymbol }} 0.00</span
												>
												<span v-else>
													{{ purchase.currencySymbol
													}}{{
														(purchase.taxes +
															withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0))
															| round
													}}
												</span>
											</template>
										</p>
									</div>
								</div>
							</transition>
						</v-flex>
						<v-flex class="subtotal-container">
							<div class="subtotal">
								<span>Total: </span>
								<span>
									{{ purchase.currencySymbol }}
									{{ purchase.amount | round }}
								</span>
								<button
									type="button"
									class="btn-totals-sale"
									@click="toggleSelect('total')"
								>
									<v-icon v-if="selectsTotal[1].select" color="info">remove</v-icon>
									<v-icon v-else color="info">add</v-icon>
								</button>
							</div>
							<transition name="fade" mode="out-in">
								<div class="subtotal-menu" v-if="selectsTotal[1].select">
									<div class="subtotal-menu-content">
										<p>
											<span class="taxes-title">Retención Renta</span>
											<template v-if="withholdingTaxRent.length > 0">
												{{ purchase.currencySymbol
												}}{{
													withholdingTaxRent.reduce((a, w) => a + w.amountTax, 0) | round
												}}
											</template>
										</p>
										<p>
											<span class="taxes-title"
												>Retención {{ labelsByCountry.taxName }}</span
											>
											<span
												>{{ purchase.currencySymbol
												}}{{
													withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0) | round
												}}</span
											>
										</p>
										<p>
											<span class="taxes-title">Total</span>
											<template v-if="withholdingTaxRent.length > 0">
												{{ purchase.currencySymbol
												}}{{
													(purchase.amount +
														withholdingTaxTaxes.reduce((a, w) => a + w.amountTax, 0) +
														withholdingTaxRent.reduce((a, w) => a + w.amountTax, 0))
														| round
												}}
											</template>
										</p>
									</div>
								</div>
							</transition>
						</v-flex>
					</v-flex>
				</v-layout>
				<v-flex xs12 pl-5 py-2 mb-3 mt-4 class="content-semi-green">
					<p class="my-0">
						{{
							purchase.payment && purchase.payment.id === 1 ? 'Transacciones' : 'Cuotas'
						}}
					</p>
				</v-flex>
				<v-layout wrap class="transactions-container" pl-2>
					<v-flex xs8 v-if="purchase.payment && purchase.payment.id === 1">
						<v-layout row>
							<v-flex
								v-for="(head, headIndex) in contHead"
								:key="headIndex"
								:class="getSizeClass(headIndex)"
								class="detail-title-row primary--text text-center"
							>
								{{ head }}
							</v-flex>
						</v-layout>
						<template row>
							<v-flex
								v-for="(transaction, transactionIndex) in transactions"
								:key="transactionIndex"
								xs12
								mt-2
								mb-2
							>
								<v-layout row wrap>
									<v-flex xs3 class="text-transaction text-center">{{
										transaction.documentNumber
									}}</v-flex>
									<v-flex xs2 class="text-transaction text-center">{{
										transaction.amount
									}}</v-flex>
									<v-flex xs2 class="text-transaction text-center">{{
										purchase.payment.name
									}}</v-flex>
									<!-- <v-flex xs2 class="text-transaction text-center">{{
										'??? TIPO DE PAGO'
									}}</v-flex> -->
									<v-flex xs2 class="text-transaction text-center">{{
										purchase.employee.name
									}}</v-flex>
									<v-flex
										xs2
										v-if="
											transaction.urlImage ||
											(transaction.voucher && transaction.voucher.urlLink)
										"
										class="text-center"
									>
										<a
											:href="
												transaction.urlImage ||
												(transaction.voucher && transaction.voucher.urlLink)
											"
											target="_blank"
											class="link-transaction"
										>
											link.foto.jpg
										</a>
									</v-flex>
								</v-layout>
							</v-flex>
						</template>
					</v-flex>

					<v-flex
						xs8
						v-else-if="purchase.checkingAccounts && purchase.checkingAccounts.length > 0"
					>
						<v-layout row>
							<v-flex
								v-for="(head, headIndex) in credHead"
								:key="headIndex"
								xs2
								class="detail-title-row primary--text text-center"
							>
								{{ head }}
							</v-flex>
						</v-layout>
						<template row>
							<v-flex
								v-for="(checkingAccounts, checkingAccountsIndex) in purchase
									.checkingAccounts[0].details"
								:key="checkingAccountsIndex"
								xs12
							>
								<v-layout row wrap>
									<v-flex xs2 class="text-transaction text-center">{{
										checkingAccounts.number
									}}</v-flex>
									<v-flex xs2 class="text-transaction text-center">{{
										checkingAccounts.amount.toFixed(2)
									}}</v-flex>
									<v-flex xs2 class="text-transaction text-center">{{
										checkingAccounts.amountPayment.toFixed(2)
									}}</v-flex>
									<v-flex xs2 class="text-transaction text-center">{{
										checkingAccounts.localDate.expirationDate
									}}</v-flex>
									<v-flex xs2 class="text-transaction text-center">{{
										checkingAccounts.statusName
									}}</v-flex>
								</v-layout>
							</v-flex>
						</template>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 style="height: 80px"> </v-flex>
		</v-layout>
		<action-sidebar
			:help-actions="actionsToHelp"
			:limit-text="50"
			:title="action.title"
			:width="action.width"
			:value="action.open"
			@close-modal="close"
		>
			<retentions-form
				v-if="action.code === 'sale-retention'"
				:bases="typeTaxes"
				is-loading
				:purchase="purchase"
				:purchase-details="purchase.details"
				:retention-data="purchase.withholdingTaxActive"
				:supplier="purchase.supplier"
				:type-document-code="purchase.typeDocument.code"
				readonly
				@close="close"
			></retentions-form>
			<template v-if="isCommentary">
				<template v-if="currentProduct.productLots">
					<app-commentaries-lotes
						show-additional
						:disabledEdit="true"
						:product="currentProduct"
						@set-add="setCommentaryLotes"
						@close-modal="closeSidebar"
					/>
				</template>
				<template v-else>
					<app-commentaries
						show-additional
						:product="currentProduct"
						@set-add="setCommentary"
						@close-modal="closeSidebar"
					/>
				</template>
			</template>
			<history-products
				v-if="action.code === 'history-products'"
				:rows="rowsHistory"
				@close-modal="closeSidebar"
			/>
		</action-sidebar>
		<simple-modal
			:enableActions="false"
			:open="openModalDetailDynamicForm"
			@close="openModalDetailDynamicForm = false"
		>
			<div slot="body">
				<!-- Iteración a través de cada sección en detailDynamicForm -->
				<div v-for="(section, index) in detailDynamicForm" :key="index" class="mb-2">
					<h3 class="title font-weight-regular mb-2">{{ section.label }}</h3>

					<div
						class="grid-container"
						style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px"
					>
						<div
							v-for="(field, key) in section.fields"
							:key="key"
							style="display: flex; flex-direction: column"
						>
							<label class="baseText--text">{{ field.label }}</label>
							<span>{{ field.value }}</span>
						</div>
					</div>
				</div>
			</div>
		</simple-modal>
		<modal-detraction
			v-model="showDetraction"
			:show-bank-account="false"
			:detraction-paid="true"
			title="Editar los datos de detracción"
			:detraction="
				purchase.additionalInformation && purchase.additionalInformation.detraction
			"
			:total-amount="purchase.total || 0"
			@accept="saveDetraction"
			@cancel="clearDetraction"
		/>
		<v-dialog persistent max-width="580" v-model="showCalculateSale">
			<modal-calculate-sale
				v-if="showCalculateSale"
				:row-product="rowProduct"
				@close-modal="updatePriceSale"
			/>
		</v-dialog>
	</div>
</template>

<script>
import modalCalculateSale from '@/components/purchases/modal-calculate-sale';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import purchaseDetailData from '@/components/purchases/purchase-detail-data';
import purchasesDetails from '@/components/purchases/purchases-details';
import retentionsForm from '@/components/purchases/retentions-form';
import appCommentariesLotes from '@/components/sales/subcomponents/commentaries-lotes';
import appCommentaries from '@/components/sales/subcomponents/commentaries';
import Sales from '@/shared/sale';
import tableCode from '@/shared/table-code';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import historyProducts from '@/components/products/history-products';
import modalDetraction from '@/components/shared/modal-detraction';

const { round, compose, setNewProperty } = lib;
const { exactDate, getLocalData } = helper;

const twoDecimals = round(2);

const Sale = new Sales();

function created() {
	const { company } = this.$userInfo;
	this.updateColumns(company);
	this.currencySymbol = company.currencyDefault.symbol;
	this.generalTaxes = getLocalData('general-taxes') || [];
	this.loadTypeTaxes();
	this.loadData();
}

function updateColumns({ settings }) {
	const { flagImport } = settings;
	this.columns = this.columns.reduce((list, item) => {
		if (item.value === 'tax') {
			const updatedColumnTax = setNewProperty(
				'name',
				`${this.labelsByCountry.taxName} %`
			)(item);
			return [].concat(list, updatedColumnTax);
		}

		if (item.value === 'productBrands') {
			const updatedBrandColumn = compose(
				setNewProperty('checked', flagImport),
				setNewProperty('visible', flagImport)
			)(item);
			return [].concat(list, updatedBrandColumn);
		}

		return [].concat(list, item);
	}, []);
}

function alertRetention() {
	this.setTypeTaxes();
	this.retentionExist = false;
	this.showNotification(
		'Es necesario configurar las retenciones antes de continuar con la compra',
		'info'
	);
}

function close() {
	this.action.open = false;
	this.action.title = '';
	this.action.code = null;
	this.currentProduct = {};
}

function columnInput(colValue) {
	const columnValue = colValue.column.value;
	const value = Number(colValue.event.target.value);
	this.purchase.details.forEach((row) => {
		this.updateAmounts(row, { fieldName: columnValue, value });
	});
}

function deleteProduct(row, rowIndex) {
	if (rowIndex > -1) {
		this.purchase.details.splice(rowIndex, 1);
		if (this.isEcuador) {
			this.alertRetention();
		}
	}
}

async function loadData(flagDeleteCache = false) {
	try {
		const { data: purchaseData } = await this.$httpSales.get(
			`purchase-documents/${this.id}`,
			{
				params: { flagDeleteCache },
			}
		);
		const user = helper.getLocalData('admin-user');
		const defaultPriceList = {
			[user.salPriceList.id]: {
				price: 0,
				ranges: [{ to: 0, from: 0, price: 0 }],
			},
		};
		purchaseData.details = purchaseData.details.map((detail) => {
			const newDetail = { ...detail };
			// const cost = detail.cost || Number(detail.subtotalWithoutTax) / detail.quantity;
			const cost =
				detail.additionalInformation && !isNaN(detail.additionalInformation.cost)
					? detail.additionalInformation.cost
					: (Number(detail.subtotalWithoutTax) + detail.discountAmount) / detail.quantity;
			const subtotal =
				detail.subtotalWithoutTax || cost * detail.quantity - detail.discountAmount;
			const discount = detail.discountPercentage
				? subtotal * (detail.discountPercentage / 100)
				: detail.discountAmount;
			const total = subtotal + detail.taxAmount;
			newDetail.priceList =
				newDetail.product &&
				newDetail.product.priceList &&
				newDetail.product.priceList[user.salPriceList.id]
					? newDetail.product.priceList[user.salPriceList.id]
					: defaultPriceList;
			const salePrice = newDetail.priceList.price || 0;
			const pricePurchase = detail.price * (1 + detail.tax / 100);
			const purchaseExchangeRate = purchaseData.additionalInformation?.exchangeRate?.value;
			// Cuando la compra tiene tipo de cambio, el costo viaja en la moneda del documento
			// mientras que el precio de venta siempre está en soles. Se convierte el costo a
			// soles antes de calcular la utilidad para no descuadrar el markup/margen.
			const pricePurchaseInSoles = purchaseExchangeRate
				? pricePurchase * purchaseExchangeRate
				: pricePurchase;
			const utilityRow = salePrice - pricePurchaseInSoles;
			newDetail.cost = cost;
			newDetail.brandName = detail.product ? detail.product.brandName : detail.brandName;
			newDetail.discount = discount;
			newDetail.productCode = detail.product ? detail.product.code : detail.code;
			newDetail.productName = detail.product ? detail.product.name : detail.name;
			newDetail.subtotal = detail.subtotalWithoutTax;
			newDetail.taxes = detail.taxes;
			newDetail.total = total;
			newDetail.sendKardexStatus = detail.sendKardexStatus;
			newDetail.unitName = detail.product ? detail.product.unitName : detail.unitName;
			newDetail.stock = [
				detail.stock,
				detail.stockQuantity,
				detail.product && detail.product.stock,
			].find((val) => val !== null && val !== undefined);
			newDetail.profitAmount = utilityRow;
			newDetail.pricePurchase = pricePurchase;
			newDetail.markupPercentage = pricePurchaseInSoles
				? (newDetail.profitAmount / pricePurchaseInSoles) * 100
				: 0;
			newDetail.marginPercentage = salePrice
				? (newDetail.profitAmount / salePrice) * 100
				: 0;
			newDetail.salePrice = newDetail.priceList.price;
			newDetail.flagFree = detail.price > 0 ? 0 : 1;
			newDetail.expirationDate = detail.additionalInformation.expirationDate;
			newDetail.productDeleted = detail.productDeleted || false;
			return newDetail;
		});
		this.purchase = { ...purchaseData };
		const {
			dateDocument,
			number,
			serie,
			supplier,
			typeDocument,
			withholdingTaxActive,
			withholdingTaxId,
			additionalInformation,
			cash,
			sendKardexStatus,
			warehouse,
			documentRelated,
			employee,
			urlImages,
			currency,
			subsidiary,
			amount,
			dateIncome,
		} = this.purchase;
		this.withholdingTaxActive = { ...withholdingTaxActive };
		this.withholdingTaxExist = Boolean(withholdingTaxId);
		this.summary[0].value = supplier ? supplier.name : '';
		this.summary[1].value = exactDate(dateDocument, 'DD-MM-YYYY', true);
		this.summary[2].value = typeDocument ? typeDocument.name : '';
		this.summary[3].value = serie;
		this.summary[4].value = number;
		this.summary[5].value = cash ? cash.name : null;
		this.summary[6].value = this.kardexStatus(sendKardexStatus);
		this.summary[7].value = warehouse ? warehouse.name : '';
		const typeDocumentCode =
			documentRelated && documentRelated.typeDocument
				? documentRelated.typeDocument.code
				: '';
		this.summary[8].value = employee ? employee.fullname : '';
		this.summary[9].value = this.purchase.state;
		this.summary[10].value = urlImages || [];
		this.summary[12].value = this.purchase.totalPerception;
		this.summary[12].show = Boolean(this.purchase.totalPerception);
		this.summary[13].value = documentRelated
			? `${typeDocumentCode}: ${documentRelated.documentNumber}`
			: '';
		this.summary[13].idDocument = documentRelated ? documentRelated.id : '';
		this.summary[15].value = this.purchase.additionalInformation?.tip || 0;
		this.summary[15].show = Boolean(this.purchase.additionalInformation?.tip);
		this.summary[16].value = exactDate(dateIncome, 'DD-MM-YYYY', true);

		const { value: exchangeRate, name: exchangeRateName } =
			additionalInformation?.exchangeRate || {};
		this.summary[17].show = !!exchangeRate;
		this.summary[17].value = `${exchangeRateName} ${exchangeRate}`;

		if (this.purchase.additionalInformation.dueDate) {
			this.summary[14].value = this.purchase.additionalInformation.dueDate;
			this.summary[14].show = true;
		}

		if (this.purchase.period) {
			this.summary[11].value = this.purchase.period.code;
			this.summary[11].show = true;
		}
		this.transactions = this.purchase.transactions || [];
		if (this.purchase?.transactionBank?.length) {
			this.transactions = this.transactions.concat(this.purchase.transactionBank);
		}

		if (this.flagOutbox && this.purchase.accTransactions?.length) {
			this.transactions = this.purchase.accTransactions;
		}
		// const { amount, perception } = this.purchase;
		// this.purchase.amount = perception
		// 	? amount - perception.totalPerception
		// 	: amount;
		this.priceAmountsMethod();

		const addInfo = purchaseData.additionalInformation;
		if (!addInfo) return;
		const { payment, guideData } = addInfo;
		const newDetailDynamicForm = [];
		if (payment) {
			newDetailDynamicForm.push({
				label: 'Tipo de pago',
				fields: payment,
			});
		}
		if (guideData) {
			newDetailDynamicForm.push({
				label: 'Datos adicionales',
				fields: guideData,
			});
		}
		this.detailDynamicForm = newDetailDynamicForm;
		this.isDetraction = !!(
			purchaseData.additionalInformation && purchaseData.additionalInformation.detraction
		);
		const amountDetraction =
			currency === 'USD' ? twoDecimals(700 / this.exchangeRate) : 700;
		this.addDetraction =
			subsidiary &&
			subsidiary.settings.flagDetraction &&
			amount >= amountDetraction &&
			typeDocument.code === 'FAC' &&
			!this.isDetraction;
		if (additionalInformation && additionalInformation.detraction) {
			this.detraction[0].value = additionalInformation.detraction.detractionAmount;
			this.detraction[1].value = additionalInformation.detraction.percentage;
			this.detraction[2].value = additionalInformation.detraction.sunatName;
			this.detractionV2[0].value = additionalInformation.detraction.receiptNumber;
			this.detractionV2[1].value = additionalInformation.detraction.paymentDate;
		}
	} catch (err) {
		console.log(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadTypeTaxes() {
	({ data: this.typeTaxes } = await this.$httpSales.get(
		`catalog-sunat-details-list/${tableCode.IvaRate}`
	));
}

function isCommentary() {
	return this.action.code === 'COMME';
}

function makeCommentary(product) {
	this.currentProduct = product.additionalInformation.productLots
		? {
				...product,
				productLots: product.additionalInformation.productLots,
				commentary: product.commentary,
		  }
		: {
				...product,
				location: product.additionalInformation.location,
				expirationDate: product.additionalInformation.expirationDate,
				commentary: product.commentary,
		  };
	this.action = {
		active: true,
		code: 'COMME',
		open: true,
		title: product.description,
		width: 450,
	};
}

// eslint-disable-next-line max-len
function setCommentaryLotes({ dateDue, date, code, location, codeEan }, commentary) {
	const { id, productId, warWarehousesId } = this.currentProduct;
	this.model.details = this.model.details.map((p) => {
		const newP = { ...p };
		if (
			newP.productId === productId &&
			newP.warWarehousesId === warWarehousesId &&
			newP.id === id
		) {
			newP.commentary = commentary;
			newP.productLots.dateDue = dateDue;
			newP.productLots.date = date;
			newP.productLots.code = code;
			newP.productLots.location = location;
			newP.productLots.codeEan = codeEan;
		}
		return newP;
	});
	this.closeSidebar();
}

function setCommentary(values) {
	const { commentary, expirationDate, location } = values;
	const { id, productId, warWarehousesId } = this.currentProduct;
	const detail = this.model ? 'model' : 'purchase';
	this[detail].details = this[detail].details.map((p) => {
		const newP = { ...p };
		if (
			newP.productId === productId &&
			newP.warWarehousesId === warWarehousesId &&
			newP.id === id
		) {
			newP.commentary = commentary;
			newP.expirationDate = expirationDate;
			newP.location = location;
		}
		return newP;
	});
}

function openSeries(row) {
	this.productSerie = row;
	this.action.code = 'control-series';
	this.action.title = `Control de Series ${row.code || row.productCode}`;
	this.action.width = 700;
	this.action.open = true;
}

function priceAmountsMethod() {
	const amounts = Sale.getAmounts(
		this.purchase.details,
		this.purchase.currency
		// this.purchase.currency,
		// this.purchase.exchangeRate,
		// this.purchase.id,
	);
	this.priceAmounts = amounts;
}

function resumeTaxes() {
	const amounts = Sale.getAmounts(
		this.purchase.details,
		this.purchase.currency
		// this.purchase.currency,
		// this.purchase.exchangeRate,
		// this.purchase.id,
	);
	return Sale.getTotalTaxesAmounts(amounts, this.purchase.details);
}

function resumeTaxesList() {
	const amounts = Sale.getAmounts(
		this.purchase.details,
		this.purchase.currency
		// this.purchase.currency,
		// this.purchase.exchangeRate,
		// this.purchase.id,
	);
	return Sale.getTaxeslist(amounts, this.purchase.details);
}

function runAction({ code }) {
	this.action.code = code;
	if (code === 'sale-retention') {
		this.action.title = this.purchase.supplier
			? `RETENCIONES - ${this.purchase.supplier.name}`
			: 'RETENCIONES';
		this.action.width = 921;
		this.action.open = true;
	} else if (code === 'edit-purchases') {
		this.goTo('purchases-edit', { params: { id: this.id } });
	} else if (code === 'calc-stock-average-cost') {
		this.onUpdateKardex();
	}
}

function setTypeTaxes() {
	this.typeTaxes = this.typeTaxes.map((type) => {
		const newType = {
			id: type.id,
			code: type.code,
			description: type.description,
			percentage: type.percentage,
			value: 0,
		};
		return newType;
	});
}

function summaryData({ discount, rows, total, taxes, subtotal }) {
	this.purchase.amount = twoDecimals(
		total - this.retentionAmount - this.retentionTaxAmount
	);
	this.purchase.taxes = taxes - this.retentionTaxAmount;
	this.purchase.total = total;
	this.purchase.subTotal = subtotal;
	this.purchase.discountAmount = discount;
	this.details = [...rows];
	if (this.seriesObject) {
		this.details = this.details.map((row) => {
			const newRow = { ...row };
			if (row.warehouseProductId === this.seriesObject.warehouseProductId) {
				newRow.detailSeries = this.seriesObject;
				newRow.codeCostCenter = 'Nuevo Codigo';
			}
			return newRow;
		});
		this.seriesObject = null;
	}
}

function closeSidebar(formClosed) {
	this.action.code = '';
	this.action.open = false;
	this.showSupplier = false;
	this.showPayments = false;
	this.showTransactions = false;
	this.showQuotes = false;
	this.showNewProduct = false;
	if (!this.retentionExist && formClosed && this.isEcuador) {
		this.alertRetention();
	}
	this.currentProduct = {};
	this.currentProduct.commentary = '';
	this.currentProduct.expirationDate = null;
	this.currentProduct.lot = '';
	this.filtersChange = {
		year: null,
		month: null,
	};
}

function toggleSelect(code) {
	this.selectsTotal = this.selectsTotal.map((s) => {
		const newSelect = { ...s };
		newSelect.select = s.code === code ? !s.select : false;
		return newSelect;
	});
}

function updateAmounts(row, index, model) {
	if (index !== -1) {
		const newDiscountValue = model === 'cost' ? 0 : row.discountPercentage;
		const newDiscountTax = model === 'tax' ? undefined : row.tax;
		const detail = this.purchase.details[index];
		detail.quantity = row.quantity;
		detail.unitQuantity = row.quantity * row.unitConversion;
		detail.cost = row.cost || row.price;
		detail.priceWithAllDecimals = row.price;
		detail.price = row.cost / row.unitConversion;
		detail.priceOriginal = row.price;
		detail.discountPercentage = newDiscountValue;
		detail.tax = newDiscountTax;
		detail.discountAmount = (row.cost * row.quantity * detail.discountPercentage) / 100;
		detail.subtotal = row.cost * row.quantity - detail.discountAmount;
		detail.taxAmount = detail.subtotal * (row.tax / 100);
		detail.total = detail.subtotal + detail.taxAmount;
		if (this.retentionExist && this.isEcuador) {
			this.alertRetention();
		}
	}
}

function updateBrand(value, row, index) {
	if (index > -1) {
		this.$set(this.purchase.details[index], 'brandId', value);
	}
}

function updateCenterCost(item, row, index) {
	if (index > -1) {
		this.$set(this.purchase.details[index], 'costCenterId', item.id);
		this.$set(this.purchase.details[index], 'costCenterCode', item.code);
	}
}

function withholdingTaxRent() {
	return this.withholdingTaxExist
		? this.withholdingTaxActive.details.filter((d) => d.nameTax === 'RENTA')
		: [];
}

function withholdingTaxTaxes() {
	return this.withholdingTaxExist
		? this.withholdingTaxActive.details.filter((d) => d.nameTax === 'IVA')
		: [];
}

function actionsDisabled() {
	const actionDisabled = this.withholdingTaxExist;
	return [{ code: 'sale-retention', disabled: !actionDisabled }];
}

function kardexStatus(status) {
	if (status === 2) {
		return 'En proceso';
	}
	return status === 3 ? 'Enviado' : 'Pendiente';
}

function goToDetail(idDocument) {
	const routeData = this.$router.resolve({
		name: 'purchase-detail',
		params: { id: idDocument },
	});
	window.open(routeData.href, '_blank');
}

function data() {
	const flagShowAccountingEngine =
		this.$userInfo.company.settings.flagShowAccountingEngine || false;
	return {
		action: {
			code: null,
			open: false,
			title: '',
			width: 921,
		},
		centersCosts: [],
		columns: [
			{
				id: 1,
				name: 'Cod.',
				value: 'productCode',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cant.',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Cant. disponible',
				tooltip: 'Cant. disponible a convertir',
				visible: false,
				checked: false,
				flagVisible: !this.$route.query.cloneId,
			},
			{
				id: 5,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Stock actual',
				value: 'product.stock',
				visible: false,
				checked: false,
			},
			{
				id: 7,
				name: 'Unidad',
				value: 'productUnitName',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Marca',
				value: 'productBrands',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Caract.',
				tooltip: 'Caracteristicas',
				value: 'inlineFeatures',
				visible: false,
				checked: false,
			},
			{
				id: 10,
				name: 'Categoria',
				value: 'categoryName',
				visible: false,
				checked: false,
			},
			{
				id: 11,
				name: 'Centro de Costos',
				value: 'costCenter',
				visible: false,
				checked: false,
				flagVisible: !flagShowAccountingEngine,
			},
			{
				id: 12,
				name: 'Costo',
				tooltip: 'Costo',
				value: 'cost',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'Cost. Unit',
				value: 'price',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: 'Desc. %',
				value: 'discountPercentage',
				visible: true,
				checked: true,
			},
			{
				id: 15,
				name: '',
				value: 'tax',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Subtotal',
				value: 'subtotal',
				visible: true,
				checked: true,
			},
			{
				id: 17,
				name: 'Impuesto',
				value: 'taxAmount',
				visible: true,
				checked: true,
			},
			{
				id: 18,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 19,
				name: 'PV',
				tooltip: 'Precio de Venta - Lista de Precio por defecto',
				value: 'priceSale',
				visible: true,
				checked: true,
			},
			{
				id: 20,
				name: 'Util',
				visible: true,
				checked: true,
			},
			{
				id: 21,
				name: '% Utilidad',
				tooltip: 'Porcentaje de utilidad',
				visible: true,
				checked: true,
			},
			{
				id: 22,
				name: 'Marg. gan',
				tooltip: 'Margen de ganancia',
				visible: false,
				checked: false,
			},
			
			{
				id: 23,
				name: 'Acciones',
				value: 'amount',
				visible: true,
				checked: true,
			},
		],
		currencySymbol: '',
		currentProduct: {},
		details: [],
		flagIntegrationCtCost: false,
		generalTaxes: [],
		originalTotal: 0,
		priceAmounts: {},
		productSerie: {},
		purchase: {},
		quantityCharge: null,
		retentionAmount: 0,
		retentionExist: false,
		retentionTaxAmount: 0,
		selectCharges: 'currency',
		selectsTotal: [
			{ code: 'charge', select: false },
			{ code: 'total', select: false },
			{ code: 'imp', select: false },
			{ code: 'sub', select: false },
			{ code: 'igv', select: false },
		],
		seriesObject: null,
		summary: [
			{
				id: 1,
				class: 'pl-2',
				label: 'Proveedor:',
				value: '',
				show: true,
			},
			{
				id: 2,
				class: 'pl-2',
				label: 'Fecha Pago:',
				value: '',
				show: true,
			},
			{
				id: 3,
				class: 'pl-2',
				label: 'T. Doc.:',
				value: '',
				show: true,
			},
			{
				id: 4,
				class: 'pl-2',
				label: 'Serie:',
				value: '',
				show: true,
			},
			{
				id: 5,
				label: 'Número:',
				class: 'pl-2',
				value: '',
				show: true,
			},
			{
				id: 6,
				label: 'Caja',
				class: 'pl-2',
				value: '',
				show: true,
			},
			{
				id: 7,
				class: 'pl-2',
				label: 'Est. Kardex',
				value: '',
				show: true,
			},
			{
				id: 8,
				class: 'pl-2',
				label: 'Tienda',
				value: '',
				show: true,
			},
			{
				id: 9,
				class: 'pl-2',
				label: 'Empleado',
				value: '',
				show: true,
			},
			{
				id: 10,
				label: 'Estado',
				value: '',
				class: 'pl-2',
				show: true,
			},
			{
				id: 11,
				label: 'Archivos Adjuntos',
				value: '',
				class: 'pl-2',
				show: false,
			},
			{
				id: 12,
				label: 'Perido contable',
				value: 'period',
				class: 'pl-2',
				show: false,
			},
			{
				id: 13,
				label: 'Percepción',
				value: '',
				class: 'pl-2',
				show: false,
			},
			{
				id: 14,
				label: 'Doc. Relacionado',
				value: '',
				class: 'pl-2',
				show: false,
				idDocument: null,
			},
			{
				id: 15,
				label: 'Fecha de vencimiento',
				value: '',
				class: 'pl-2',
				show: false,
				idDocument: null,
			},
			{
				id: 16,
				label: 'Otros cargos',
				value: '',
				class: 'pl-2',
				show: false,
			},
			{
				id: 17,
				class: 'pl-2',
				label: 'F. Ingreso kardex:',
				value: '',
				show: true,
			},
			{
				id: 18,
				class: 'pl-2',
				label: 'T.C SUNAT:',
				value: '',
				show: false,
			},
		],
		detraction: [
			{
				id: 1,
				class: 'pl-2',
				label: 'Monto:',
				value: '',
				show: true,
			},
			{
				id: 2,
				class: 'pl-2',
				label: 'Porcentaje:',
				value: '',
				show: true,
			},
			{
				id: 3,
				class: 'pl-2',
				label: 'Tipo de Detracción:',
				value: '',
				show: true,
			},
		],
		detractionV2: [
			{
				id: 1,
				class: 'pl-2',
				label: 'Nro de constancia:',
				value: '',
				show: true,
			},
			{
				id: 2,
				class: 'pl-2',
				label: 'Fecha de pago:',
				value: '',
				show: true,
			},
		],
		typeTaxes: [],
		withholdingTaxActive: {},
		withholdingTaxExist: false,
		contHead: ['#Trans', 'Monto', 'Met. Pago', 'Empleado', 'Img'],
		credHead: [
			'Cuota',
			'Monto total(PEN)',
			'Monto pagado',
			'Fecha de vencimiento',
			'Estado',
		],
		transactions: [],
		detailDynamicForm: [],
		openModalDetailDynamicForm: false,
		rowsHistory: [],
		dialogCalculateSale: false,
		showCalculateSale: false,
		rowProduct: {},
		loadingGeneral: false,
		showDetraction: false,
		addDetraction: false,
		isDetraction: false,
	};
}

export default {
	name: 'page-purchase-detail',
	components: {
		actionSidebar,
		appActions,
		appCommentaries,
		appCommentariesLotes,
		headerPage,
		purchaseDetailData,
		purchasesDetails,
		retentionsForm,
		simpleModal,
		historyProducts,
		modalCalculateSale,
		modalDetraction,
	},
	computed: {
		actionsDisabled,
		resumeTaxes,
		resumeTaxesList,
		withholdingTaxRent,
		withholdingTaxTaxes,
		isCommentary,
	},
	created,
	data,
	methods: {
		alertRetention,
		close,
		closeSidebar,
		columnInput,
		deleteProduct,
		goToDetail,
		loadData,
		loadTypeTaxes,
		kardexStatus,
		makeCommentary,
		setCommentary,
		setCommentaryLotes,
		openSeries,
		priceAmountsMethod,
		runAction,
		setTypeTaxes,
		summaryData,
		toggleSelect,
		updateAmounts,
		updateBrand,
		updateCenterCost,
		updateColumns,
		getSizeClass(index) {
			if (index === 0) {
				return 'xs3';
			}
			return 'xs2';
		},
		openHistoryProducts(row) {
			this.action = {
				open: true,
				code: 'history-products',
				title: `Historial de Compra - ${row.productName}`,
				width: 850,
			};
			this.loadHistoryProducts(row);
		},
		async loadHistoryProducts(row) {
			const params = {
				flagRecord: true,
				productId: row.productId,
				notStateIn: 3,
			};
			try {
				const response = await this.$httpSales.get('purchase-article-price', {
					params,
				});
				this.rowsHistory = response.data;
			} catch (error) {
				this.showGenericError();
			}
		},
		updatePriceSale(row) {
			this.showCalculateSale = !this.showCalculateSale;
			this.rowProduct = row;
		},
		async onUpdateKardex() {
			this.loadingGeneral = true;
			const body = {
				documentId: Number(this.id),
			};
			try {
				await this.$httpProducts.post('kardex/recalculate-product', body);
				this.showNotification(
					'Se actualizaron los ultimos registros de kardex por productos relacionados a la compra'
				);
			} catch (err) {
				this.showGenericError();
			} finally {
				this.loadingGeneral = false;
			}
		},
		async saveDetraction(detractionData) {
			const url = `/purchase-documents-product-ms/${this.purchase.id}/${this.$userInfo.companyId}/0`;

			const detractionAmount = twoDecimals(
				(this.purchase.amount * detractionData.percentage) / 100
			);
			const body = {
				additionalInformation: {
					...this.purchase.additionalInformation,
					detraction: {
						totalAmount: this.purchase.amount,
						flagDetraction: true,
						detractionAmount,
						sunatCode: detractionData.sunatCode,
						sunatName: detractionData.sunatName,
						percentage: detractionData.percentage,
						detractionPaid: detractionData.detractionPaid,
						receiptNumber: detractionData.receiptNumber,
						paymentDate: detractionData.paymentDate,
						paySupplier: this.purchase.amount - detractionAmount,
					},
				},
			};
			try {
				await this.$httpSales.patch(url, body);
				this.showNotification('Se actualizó correctamente la detracción');
				this.loadData(true);
				this.showDetraction = false;
			} catch (error) {
				this.showGenericError();
			}
		},
		clearDetraction() {
			this.showDetraction = false;
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.title-detail {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium16);
	text-transform: uppercase;
}

.transactions-container {
	margin-bottom: 90px;
	max-height: 185px;
	overflow: auto;

	@media print {
		max-height: 100%;
	}
}

.text-transaction {
	font-weight: bold;
	font-size: 13px;
}

.text-center {
	text-align: center;
}

.btn-width {
	width: 110px !important;
}
</style>
