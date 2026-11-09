<template>
	<div>
		<header-page show-documents :title="title" :number-bill="purchase.documentNumber">
		</header-page>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout row wrap px-4 mt-4>
			<v-flex xs12>
				<v-layout row mb-2>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">Amb.:</v-flex>
							<v-flex xs8 class="box-description">
								{{
									purchase.subsidiary && purchase.subsidiary.typeAmbientTax === 1
										? 'Prueba'
										: 'Producción'
								}}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">Emisión:</v-flex>
							<v-flex xs8 class="box-description">
								<template v-if="purchase.additionalInformation">
									{{ purchase.additionalInformation.typeEmission }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">F. Auto.:</v-flex>
							<v-flex xs8 class="box-description">{{
								purchase.emissionDate | exactDate('DD/MM/YYYY')
							}}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs4 pr-2>
						<v-layout row>
							<v-flex xs2 class="box-title">Clave:</v-flex>
							<v-flex xs10 class="box-description">{{ purchase.accessKey }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2>
						<v-layout row>
							<v-flex xs4 class="box-title">E. Auto.:</v-flex>
							<v-flex xs8 class="box-description">Autorizado</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout row mb-2>
					<v-flex xs4 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">#Auto.:</v-flex>
							<v-flex xs8 class="box-description">{{ purchase.accessKey }}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">Emit. por:</v-flex>
							<v-flex xs8 class="box-description">
								<template v-if="purchase.supplier">
									{{ purchase.supplier.name }}
								</template>
								<template v-else-if="purchase.additionalInformation">
									{{ purchase.additionalInformation.razonSocial }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">Doc:</v-flex>
							<v-flex xs8 class="box-description">
								<template v-if="purchase.supplier">
									{{ purchase.supplier.documentNumber }}
								</template>
								<template v-else-if="purchase.additionalInformation">
									{{ purchase.additionalInformation.ruc }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs4>
						<v-layout row>
							<v-flex xs2 class="box-title">Direc.:</v-flex>
							<v-flex xs10 class="box-description">
								<template v-if="purchase.supplier">
									{{ purchase.supplier.address }}
								</template>
								<template v-else-if="purchase.additionalInformation">
									{{ purchase.additionalInformation.dirMatriz }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout row>
					<!-- <v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">#Contrib.E.</v-flex>
							<v-flex xs8 class="box-description"></v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">Cont.:</v-flex>
							<v-flex xs8 class="box-description">
								<template
									v-if="
										purchase.additionalInformation &&
											purchase.additionalInformation.infoDocument
									"
								>
									{{ purchase.additionalInformation.infoDocument.obligadoContabilidad }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex> -->
					<v-flex xs4 pr-2>
						<v-layout row>
							<v-flex xs2 class="box-title">Emit. a:</v-flex>
							<v-flex xs10 class="box-description">
								<template v-if="purchase.subsidiary">
									{{ purchase.subsidiary.sucursalName }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 pr-2>
						<v-layout row>
							<v-flex xs4 class="box-title">Doc.:</v-flex>
							<v-flex xs8 class="box-description">
								<template v-if="purchase.subsidiary">
									{{ purchase.subsidiary.ruc }}
								</template>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2>
						<v-layout row>
							<v-flex xs4 class="box-title">F. Emisión:</v-flex>
							<v-flex xs8 class="box-description">
								{{ purchase.emissionDate | exactDate('DD/MM/YYYY') }}
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2>
						<v-layout row>
							<v-flex xs4 class="box-title">Otros Cargos:</v-flex>
							<v-flex xs8 class="box-description">
								{{
									purchase.additionalInformation &&
									purchase.additionalInformation.infoDocument.propina
								}}
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout row wrap px-3 mt-2>
			<v-btn
				round
				color="primary"
				@click="associateProducts"
				:disabled="!rows.some((r) => r.isSelected)"
			>
				Asociar Productos
			</v-btn>
		</v-layout>
		<template v-if="purchase.typeTransaction.code !== 'CRT'">
			<app-table
				:check-all="checkAll"
				name="billing-detail-sri"
				selectable
				:columns="columns"
				:current-page="currentPage"
				:rows="rows"
				:last-page="lastPage"
				:main-list="false"
				@row-is-selected="handleRowSelected"
				@on-selected-all="handleSelectedAll"
				class="px-4 mt-4 mb-0"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						<v-tooltip right>
							<button slot="activator" class="item-link" @click="openSearch(props.row)">
								{{ props.row.codigoPrincipal }}
							</button>
							<span>Modificar</span>
						</v-tooltip>
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.codQuipu || '-' }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.descripcion }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.cantidad }}</td>
					<td v-show="showRow(columns, 5)">
						{{ countryCurrencySymbol }}
						<template v-if="props.row.impuestos">
							{{ props.row.precioUnitario | round }}
						</template>
						<template v-else>
							{{ props.row.baseImponible | round }}
						</template>
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.descuento }}</td>
					<td v-show="showRow(columns, 7)">
						<template v-if="props.row.impuestos">
							<template v-if="props.row.impuestos.find((i) => i.codigo === '02')">
								{{ props.row.impuestos.find((i) => i.codigo === '02').valor }}
							</template>
							<template v-else>
								{{ props.row.impuestos[0].valor }}
							</template>
						</template>
						<template v-else> {{ props.row.porcentajeRetener }}% </template>
					</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.total | round }}
					</td>
					<td v-show="showRow(columns, 9)">
						<app-tooltip-button
							:top="false"
							left
							color="primary"
							icon="add_circle"
							text="Nuevo producto"
							@click-icon="openSiderbar('create-product', props.row)"
						></app-tooltip-button>
					</td>
				</template>
			</app-table>
		</template>
		<template v-else>
			<app-table
				name="retention-detail-sri"
				:columns="columnsRetention"
				:current-page="currentPage"
				:rows="rows"
				:last-page="lastPage"
				:main-list="false"
				class="is-not-selectable no-main-list px-4 mt-4 mb-0"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columnsRetention, 1)">
						{{ getTypeTax(props.row) }}
					</td>
					<td v-show="showRow(columnsRetention, 2)">
						{{ props.row.codigoRetencion }}
					</td>
					<td v-show="showRow(columnsRetention, 3)">{{ props.row.baseImponible }}</td>
					<td v-show="showRow(columnsRetention, 4)">{{ props.row.porcentajeRetener }}</td>
					<td v-show="showRow(columnsRetention, 5)">{{ props.row.valorRetenido }}</td>
					<td v-show="showRow(columnsRetention, 6)">{{ props.row.codDocSustento }}</td>
					<td v-show="showRow(columnsRetention, 7)">{{ props.row.numDocSustento }}</td>
					<td v-show="showRow(columnsRetention, 8)">
						{{ props.row.fechaEmisionDocSustento }}
					</td>
				</template>
			</app-table>
		</template>
		<v-layout row wrap px-4 v-if="purchase.typeTransaction.code !== 'CRT'">
			<v-flex xs12 class="totals-section d-flex text-xs-center">
				<v-flex py-1 class="subtotal">
					<span class="pr-2">Otros cargos:</span>
					<span>{{ purchase.currency }}{{ otherChargesTotal | round }}</span>
				</v-flex>
				<v-flex pink white--text py-1 class="subtotal">
					<span class="pr-2">Desc.%:</span>
					<span>{{ purchase.currency }}{{ totalDiscount | round }}</span>
				</v-flex>
				<v-flex d-flex class="subtotal-container">
					<div py-1 class="subtotal">
						<span class="pr-2">SubT.:</span>
						<span>{{ purchase.currency }}{{ subtotalGlobal | round }}</span>
						<button type="button" class="btn-summary-import" @click="toggleSelect('sub')">
							<v-icon v-if="selectsTotal[0].select" color="info">remove</v-icon>
							<v-icon v-else color="info">add</v-icon>
						</button>
					</div>
					<transition name="fade" mode="out-in">
						<div class="subtotal-menu" v-if="selectsTotal[0].select">
							<div class="subtotal-menu-content">
								<p v-for="tax in generalTaxes" :key="tax.id">
									<span class="taxes-title">{{ tax.description }}</span>
									<span
										>{{ purchase.currency }} {{ resumeSubtotal[tax.code] | round }}</span
									>
								</p>
							</div>
						</div>
					</transition>
				</v-flex>
				<v-flex d-flex class="subtotal-container">
					<div py-1 class="subtotal">
						<span class="pr-2">Impuestos:</span>
						<span>{{ purchase.currency }}{{ totalTaxes | round }}</span>
						<button
							type="button"
							class="btn-summary-import"
							@click="toggleSelect('taxes')"
						>
							<v-icon v-if="selectsTotal[1].select" color="info">remove</v-icon>
							<v-icon v-else color="info">add</v-icon>
						</button>
					</div>
					<transition name="fade" mode="out-in">
						<div class="subtotal-menu" v-if="selectsTotal[1].select">
							<div class="subtotal-menu-content">
								<p v-for="tax in generalTaxes" :key="tax.id">
									<span class="taxes-title">{{ tax.description }}</span>
									<span
										>{{ purchase.currency }} {{ getTaxAmount(tax.code) | round }}</span
									>
								</p>
								<p>
									<span class="taxes-title">Otros cargos</span>
									<span>{{ purchase.currency }} {{ otherChargesTotal | round }}</span>
								</p>
							</div>
						</div>
					</transition>
				</v-flex>
				<v-flex py-1>
					<span class="pr-2">Total:</span>
					<span>{{ purchase.currency }}{{ totalGlobal | round }}</span>
				</v-flex>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabledBtn"
				:success-text="successText"
				:hidden="hiddenBtn"
				@cancel-button-clicked="
					goTo('detail-import', {
						params: { dateEnd, dateStart, id },
						query: { page: $route.query.page || 1 },
					})
				"
				@accept-button-clicked="handleAcceptButton"
			/>
		</section>
		<simple-modal
			:open="openRelated"
			@close="closeRelated"
			textCancel="Cancelar"
			@cancel="closeRelated"
			textConfirm="Aceptar"
			@confirm="confirmRelatedDocument"
		>
			<span slot="title">
				Documento relacionado encontrado
			</span>
			<span slot="message">
				{{ this.messageRelated }}
			</span>
		</simple-modal>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:back-btn="action.code !== 'NS'"
			@close-modal="cancelModal"
		>
			<create-product
				v-if="action.code === 'create-product'"
				:code-validated="codeLoading"
				:label-switch="labelSwitch"
				:model="model"
				:validate-loading="validateLoading"
				:disabled-prod="disabledProd"
				@change-flag-sales="changeFlagSales"
				@cancel-modal="cancelModal"
				@remove-alternate-code="removeAlternateCode"
				@set-data="getData"
				@save-product="saveProduct"
			/>
			<products-search-form
				v-if="action.code === 'product'"
				master
				:search-value="searchVal"
				:prevent-multiple-add-modal="true"
				@add-product="setProduct"
			/>
			<suppliers-form-short
				v-if="action.code === 'NS'"
				:disabled-supplier="disabledSupplier"
				:address="supplierAddress"
				:flag-type-person="flagTypePerson"
				:commercial-name="supplierCommercialName"
				:name="supplierName"
				:ruc="supplierDocument"
				:hide-cancel="true"
				@save="saveSupplier"
			></suppliers-form-short>
			<products-search-form
				v-if="action.code === 'PE'"
				master
				:show-filter="false"
				:flag-load-types="false"
				:initialTypeSelect="8"
				:prevent-multiple-add-modal="true"
				@add-product="setProductExpress"
			/>
		</action-sidebar>

	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import createProduct from '@/components/sri/create-product';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import suppliersFormShort from '@/components/sri/suppliers-form-short';
import typeEntityEcommerce from '@/shared/type-entity-ecommerce';
import TypeOfBill from '@/shared/type-of-bill';
import TableCode from '@/shared/table-code';
import jsonCountries from '@/i18n/constants/format-country.json';
import simpleModal from '@/components/field-sale/shared/simple-modal';

const MAX_AMOUNT_DIFF = 0.15;

function normalizeAmount(value) {
	const numeric = Number(value || 0);
	if (!Number.isFinite(numeric)) {
		return 0;
	}
	return Number(numeric.toFixed(2));
}

function getAmountsValidationContext(vm) {
	const calculatedTotal = normalizeAmount(
		vm.rows.reduce((acum, r) => acum + (r.isFree ? 0 : Number(r.total || 0)), 0)
	);
	const tipAmount = normalizeAmount(
		vm.purchase?.additionalInformation?.infoDocument?.propina || 0
	);
	const purchaseAmount = normalizeAmount(vm.purchase.amount) * (vm.purchase.typeTransaction.code === 'NTC' ? -1 : 1);
	const calculatedTotalWithTip = normalizeAmount(calculatedTotal);
	console.log('calculatedTotalWithTip => ', calculatedTotalWithTip);
	console.log('purchaseAmount => ', purchaseAmount);
	console.log('tipAmount => ', tipAmount);
	const totalsDiff = normalizeAmount(Math.abs(calculatedTotalWithTip - (purchaseAmount - tipAmount)));
	const canAutoAlign = totalsDiff <= MAX_AMOUNT_DIFF;
	const normalizedTotal = canAutoAlign ? purchaseAmount : calculatedTotalWithTip;
	return {
		canAutoAlign,
		calculatedTotal: calculatedTotalWithTip,
		normalizedTotal,
		purchaseAmount,
		totalsDiff,
		tipAmount,
	};
}

/** Igual que pages-purchases-new: Date local a las 05:00 para el API. */
function toPurchasePaymentDate(value) {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value;
	}
	const s = String(value).trim();
	const ymd = s.includes('/') ? helper.convertDate(s) : s.split(/[T ]/)[0];
	if (ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
		return new Date(`${ymd} 05:00:00`);
	}
	const d = new Date(s);
	return Number.isNaN(d.getTime()) ? null : d;
}

function lastDayOfMonthPaymentDate(emissionDate) {
	const basis = toPurchasePaymentDate(emissionDate);
	const y = basis.getFullYear();
	const m = basis.getMonth();
	const last = new Date(y, m + 1, 0).getDate();
	const mm = String(m + 1).padStart(2, '0');
	const dd = String(last).padStart(2, '0');
	return new Date(`${y}-${mm}-${dd} 05:00:00`);
}

function getTaxAmount(taxCode) {
	const calculatedTax = normalizeAmount(this.resumeTaxes[taxCode]);
	const infoDocument = this.purchase?.additionalInformation?.infoDocument || {};

	const infoTaxByCode = {
		'01': normalizeAmount(infoDocument.totalImpuesto),
		'07': normalizeAmount(infoDocument.totalIcbper || infoDocument.icbper),
	};

	const infoTax = normalizeAmount(infoTaxByCode[taxCode]);
	if (infoTax > 0) {
		return infoTax;
	}
	return calculatedTax;
}

function created() {
	const environment = this.purchase.additionalInformation
		? this.purchase.additionalInformation.ambiente
		: '';
	const countryCode = this.$userInfo.company.country.countryCode;
	const countryData = this.jsonCountries[countryCode] || {};
	this.typeEnvironment = environment === 1 ? 'Prueba' : 'Producción';
	// this.exchangeRate = helper.getLocalData('exchange-rate-purchase') || 1;
	this.generalTaxes = helper.getLocalData('general-taxes') || [];
	this.loadDetail();
	this.loadPaymentMethods();
	this.loadSunat();
	this.taxName = countryData.taxName || 'Impuesto';
	this.columns[6].name = this.taxName;
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.model = {
		alternateCode: [],
		categoryId: null,
		code: null,
		description: null,
		flagSales: true,
		name: null,
		price: 0,
		type: null,
		unitId: null,
		brandId: null,
		warehouseId: null,
		cost: 0,
		flagTaxCost: false,
		taxUnitId: null,
		priceList: {},
	};
}

async function loadDetail() {
	const params = { ...this.params };
	try {
		console.log('purchaseId => ', this.purchaseId);
		({ data: this.purchase } = await this.$httpSales.get(
			`document-account-status/${this.purchaseId}`,
			{
				params,
			}
		));
		const details = Array.isArray(this.purchase.details) ? this.purchase.details : [];
		this.rows = details.map((d, idx) => {
			const newDetail = {
				...d,
				rowKey: `${idx}-${d.productCode || d.codigoPrincipal || ''}`,
				codigoPrincipal: d.productCode || d.codigoPrincipal || idx + 1,
				descripcion: d.productDescription || d.descripcion,
				cantidad: d.quantity || d.cantidad,
				precioUnitario: d.unitCost || d.precioUnitario,
				descuento: d.discountAmount || d.descuento || 0,
				total: d.totalAmount || d.total,
				baseImponible: Number(d.precioTotalSinImpuesto),
			};
			const taxes = Array.isArray(d.impuestos)
				? d.impuestos
				: d.impuestos && d.impuestos.impuesto
				? Array.isArray(d.impuestos.impuesto)
					? d.impuestos.impuesto
					: [d.impuestos.impuesto]
				: null;

			newDetail.impuestos = taxes;
			const detTotalTax = taxes ? taxes.reduce((a, t) => a + Number(t.valor), 0) : 0;
			console.log('newDetail => ', newDetail);
			const importe = Number(this.purchase.additionalInformation.infoDocument.importeTotal);
			if (!newDetail.total) {
				if (taxes && taxes.length > 0) {
					newDetail.total = Number((newDetail.baseImponible + detTotalTax));
					if (newDetail.total !== importe) {
						newDetail.total = Number((newDetail.total - 0.01).toFixed(2));
					}
				} else {
					newDetail.total = Number((d.valorRetenido || 0).toFixed(2));
				}
			} 
			if (newDetail.total) {
				if (newDetail.total !== importe) {
					newDetail.total = Number((newDetail.baseImponible + detTotalTax)).toFixed(2);
				}
			}
			if (d.codigoRetencion) {
				const sizeComplete = 15;
				const numDocSustentoSize = `${d.numDocSustento}`.length;
				const zerosGroup = [];
				for (let index = 0; index < sizeComplete - numDocSustentoSize; index += 1) {
					zerosGroup.push(0);
				}
				const zerosString = zerosGroup.join('');
				const numDocSustentoSizeComplete = `${zerosString}${d.numDocSustento}`;
				newDetail.numDocSustento = numDocSustentoSizeComplete;
			}
			newDetail.isSelected = false;
			return newDetail;
		});
		this.checkAll = false;
		if (this.purchase.typeTransaction.code === 'CRT') {
			this.loadTypeTaxes();
			this.searchSaleByDocument();
		}
	} catch (err) {
		console.log(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function openSiderbar(value, row) {
	this.action.code = value;
	if (value === 'create-product') {
		this.rowSelected = { ...row };
		this.model.alternateCode = [row.codigoPrincipal];
		this.model.description = row.descripcion;
		this.model.name = row.descripcion;
		this.model.code = row.codigoPrincipal;
		this.model.price = row.precioUnitario;
		this.action.width = 552;
		this.action.title = 'Nuevo Producto';
		this.validateCode(row.codigoPrincipal);
	}
	this.action.open = true;
}

function openSearch(row) {
	const { codigoPrincipal } = row;
	this.searchVal = codigoPrincipal ? `${codigoPrincipal}`.trim() : '';
	this.rowSelected = { ...row };
	this.action.code = 'product';
	this.action.title = 'Productos';
	this.action.width = 634;
	this.action.open = true;
}

function resumeTaxes() {
	return this.generalTaxes.reduce((a, g) => {
		const newAcum = { ...a };
		newAcum[g.code] = 0;
		const purchaseTax = this.rows.reduce((ac, d) => {
			const detailTaxes = Array.isArray(d.impuestos) ? d.impuestos : [];
			const tax = detailTaxes.find((t) => Number(t.codigo) === Number(g.code));
			return ac + (tax ? Number(tax.valor) : 0);
		}, 0);
		newAcum[g.code] = purchaseTax;
		return newAcum;
	}, {});
}

function resumeSubtotal() {
	const infoDocument = this.purchase?.additionalInformation?.infoDocument;
	if (!infoDocument) {
		return this.generalTaxes.reduce((a, g) => {
			const newAcum = { ...a };
			newAcum[g.code] = 0;
			return newAcum;
		}, {});
	}

	const subtotalMapping = {
		'01': Number(infoDocument.totalGravado) || 0, // IGV - Gravado
		'04': Number(infoDocument.totalExportacion) || 0, // Exportación
		'05': Number(infoDocument.totalGratuito) || 0, // Gratuito
		'02': Number(infoDocument.totalExonerado) || 0, // Exonerado
		'03': Number(infoDocument.totalInafecto) || 0, // Inafecto
		'07': 0, // ICBPER - no tiene subtotal específico
	};

	return this.generalTaxes.reduce((a, g) => {
		const newAcum = { ...a };
		newAcum[g.code] = subtotalMapping[g.code] || 0;
		return newAcum;
	}, {});
}

function toggleSelect(code) {
	this.selectsTotal = this.selectsTotal.map((s) => {
		const newSelect = { ...s };
		newSelect.select = s.code === code ? !s.select : false;
		return newSelect;
	});
}

function subtotalGlobal() {
	const subtotal = this.rows.reduce((acc, det) => {
		if (det.isFree) return acc;
		return acc + det.baseImponible;
	}, 0);
	return normalizeAmount(subtotal);
}

function totalDiscount() {
	const discount = this.rows.reduce(
		(acc, det) => (det.isFree ? acc : acc + Number(det.descuento || 0)),
		0
	);
	return normalizeAmount(discount);
}

function totalTaxes() {
	const taxes = this.rows.reduce((acc, det) => {
		if (det.isFree) return acc;
		const detailTaxes = Array.isArray(det.impuestos) ? det.impuestos : [];
		const taxesValue = detailTaxes.reduce(
			(acumTax, tax) => acumTax + Number(tax.valor),
			0
		);
		return acc + taxesValue;
	}, 0);
	return normalizeAmount(taxes) + this.otherChargesTotal;
}

function otherChargesTotal() {
	return normalizeAmount(
		this.purchase?.additionalInformation?.infoDocument?.propina || 0
	);
}

function totalGlobal() {
	const calculatedTotal = normalizeAmount(
		this.rows.reduce((acum, r) => acum + (r.isFree ? 0 : Number(r.total || 0)), 0)
	);
	return normalizeAmount(calculatedTotal + this.otherChargesTotal);
}

async function searchValue(value) {
	const searchTrim = value ? value.trim() : '';
	if (searchTrim) {
		this.loading = true;
		try {
			const { data: response } = await this.productsSelections(searchTrim);
			this.products = response.map((prod) => {
				const newProd = { ...prod };
				newProd.autoBarcode = prod.product.autoBarcode;
				newProd.categoryName = prod.product.category.name;
				newProd.code = prod.product.code;
				newProd.description = prod.product.description;
				newProd.name = prod.product.name;
				newProd.priceCost = prod.priceCost ? prod.priceCost : 0;
				newProd.units = prod.product.conversions
					? this.unitsByProduct(prod.product)
					: [{ ...prod.product.unit }];
				newProd.unitConversion = 1;
				newProd.unitId = prod.product.unitId;
				newProd.unitName = prod.product.unit.name;
				newProd.unitQuantity = prod.quantity;
				newProd.warehouseName = prod.warehouse.name;
				newProd.warWarehouseProductBrandId = prod.warWarehouseProductBrandId || prod.id;
				return newProd;
			});
			if (this.products.length === 0) {
				this.showNotification(
					'No se encontró ninguna coincidencia. Es necesario crear el producto para homologarlo.'
				);
			}
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loading = false;
		}
	}
}

async function setProduct(prod, brandId, documentId, express = false) {
	if (this.isSettingProduct) {
		return;
	}
	this.isSettingProduct = true;

	const body = {
		moduleCode: 'COMPRA',
		supplierId: this.purchase.supplierId || this.supplierId,
		details: prod ? this.buildDetails(prod, brandId, express) : [],
	};
	if (
		documentId !== undefined &&
		documentId !== null &&
		this.purchase.typeTransaction.code === 'CRT'
	) {
		body.saleDocumentId = documentId;
	} else if (documentId !== undefined && documentId !== null) {
		body.purDocumentId = documentId;
	}
	try {
		await this.$httpSales.patch(
			`document-account-status/${this.purchase.id}/details`,
			body
		);
		this.cancelModal();
		if (prod) {
			this.showNotification('La homologación se realizó correctamente.');
		}
		this.loadDetail();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'BENEFICIARY_NOT_EXIST') {
				this.showGenericError('El proveedor no existe.');
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.isSettingProduct = false;
	}
}

function removeAlternateCode(alternateCode) {
	const index = this.model.alternateCode.findIndex((code) => code === alternateCode);
	if (index > -1) {
		this.model.alternateCode.splice(index, 1);
	}
}

function labelSwitch() {
	return this.model.flagSales ? 'Desactivar' : 'Activar';
}

function changeFlagSales(value) {
	this.model.flagSales = value;
}

function getData(modelData) {
	const { model, value, onSearch } = modelData;
	if (model) {
		if (!onSearch && value !== undefined && value !== null) {
			this.$set(this.model, model, value);
		}
	} else {
		this.validateCode(modelData);
	}
}

function runAction({ code, name }) {
	this.action.code = code;
	this.action.title = name;
	this.action.open = true;
}

async function saveSupplier(supplierModel) {
	this.disabledSupplier = true;
	try {
		const { data: newSupplier } = await this.$httpSales.post('suppliers', supplierModel);
		this.supplierId = newSupplier.id;
		this.cancelModal();
		this.showNotification('El proveedor ha sido creado correctamente.');
		this.loadDetail();
	} catch (err) {
		console.log(err);
		if (err.status === 400) {
			if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
				this.showNotification(
					'El número de documento ingresado ya existe. Es probable que el proveedor que intenta registrar ya exista.',
					'error'
				);
			} else if (err.data.message === 'PAYMENT_METHOD_NOT_EXIST') {
				this.showNotification(
					'La forma de pago seleccionada no se encuentra registrada.',
					'error'
				);
			} else if (err.data.message === 'SUPPLIER_TYPE_NOT_EXIST') {
				this.showNotification(
					'El tipo de proveedor seleccionado no se encuentra registrado.',
					'error'
				);
			} else if (err.data.message === 'TYPE_EXPENSE_NOT_EXIST') {
				this.showNotification(
					'El origen seleccionado no se encuentra registrado.',
					'error'
				);
			} else if (err.data.message === 'AUTO_CODE_SUPPLIER_NOT_EXIST') {
				this.showNotification(
					'El código autogenerado de proveedor no ha sido configurado.',
					'error'
				);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.disabledSupplier = false;
	}
}

function purchase({ additionalInformation, supplierId, typeTransaction }) {
	if (additionalInformation) {
		const infoDocument = additionalInformation.infoDocument || {};
		const sizeComplete = 13;
		const rucNumber = additionalInformation.ruc || '';
		const rucSize = `${rucNumber}`.length;
		const zerosGroup = [];
		for (let index = 0; index < sizeComplete - rucSize; index += 1) {
			zerosGroup.push(0);
		}
		const zerosString = zerosGroup.join('');
		const rucComplete = rucNumber
			? `${zerosString}${rucNumber}`
			: infoDocument.receiverDocNumber || infoDocument.identificacionComprador || '';
		this.supplierDocument = rucComplete;
		this.supplierName = additionalInformation.razonSocial;
		this.supplierCommercialName = additionalInformation.nombreComercial;
		this.supplierAddress = additionalInformation.dirMatriz;
		this.flagTypePerson =
			(this.purchase.supplier && this.purchase.supplier.flagTypePerson) ||
			infoDocument.tipoIdentificacionComprador ||
			infoDocument.receiverDocType ||
			null;
	}
	if (typeTransaction.code !== 'CRT' && !supplierId) {
		this.searchSupplier(this.supplierDocument);
	}
}

function actionsDisabled() {
	const code = 'NS';
	const disabled =
		!!this.purchase.supplierId ||
		!!this.supplierId ||
		this.purchase.typeTransaction.code === 'CRT';
	return [{ code, disabled }];
}

async function searchSupplier(supplierId) {
	const params = { search: supplierId };
	try {
		const { data: suppliers } = await this.$httpSales.get('suppliers', { params });
		const supplier = suppliers.find((s) => s.documentNumber === this.supplierDocument);
		if (supplier) {
			this.supplierId = supplier.id;
			this.supplierLimitCredit = supplier.creditLimitation;
			this.setProduct(null);
		} else {
			this.showNotification(
				'El proveedor de la compra no se encuentra registrado en el sistema. Es necesario registrarlo para poder continuar',
				'warning'
			);
			this.action.code = 'NS';
			this.action.title = 'CREAR PROVEEDOR';
			this.action.open = true;
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function closeRelated() {
	this.openRelated = false;
}

async function handleAcceptButton() {
	if (this.purchase.typeTransaction.code === 'NTC') {
		await this.verifyRelatedDocument();
	} else {
		await this.saveDetailPurchase();
	}
}

async function confirmRelatedDocument() {
	this.closeRelated();
	await this.saveDetailPurchase();
}

async function verifyRelatedDocument() {
	if (this.purchase.typeTransaction.code === 'NTC') {
		const { infoDocument } = this.purchase.additionalInformation || {};
		const typeDocument = (infoDocument?.codDocModificado === '1' || infoDocument?.codDocModificado === '01') ? 'FAC' : this.purchase.typeTransaction.code;
		const docNumber = infoDocument?.numDocModificado.replace(/\s+/g, '') || '';
		const [series, number] = docNumber.split('-');
		const params = {
			supplierId: this.purchase.supplierId,
			series: series,
			number: number,
			typeDocumentCode: typeDocument,
		};
		try {
			const { data: response } = await this.$httpSales.get(
				'/purchase-documents/data', { params }
			);
			this.relatedDocument = response.id;
			this.messageRelated = `El documento esta relacionado con la compra con codigo ${response.documentNumber}, de click en aceptar para registrar la compra con el documento relacionado.`;
			this.openRelated = true;
		} catch (err) {
			this.messageRelated = 'El documento NO esta relacionado con ninguna compra, por favor verifique la información. Si da click en aceptar se registrara la compra sin documento relacionado.';
			this.openRelated = true;
		}		
	}
}

async function saveDetailPurchase() {
	const { purchaseAmount, totalsDiff } = getAmountsValidationContext(this);
	if (totalsDiff > MAX_AMOUNT_DIFF) {
		this.showNotification(
			'El total de la compra no coincide con el total de los productos',
			'error'
		);
		console.log('total de los productos', this.totalGlobal);
		console.log('total de la compra', purchaseAmount);
		console.log('diferencia detectada', totalsDiff);
		return;
	}
	if (this.purchase.saleDocumentId || this.purchase.purDocumentId) {
		this.goTo('detail-import', {
			params: { dateEnd: this.dateEnd, dateStart: this.dateStart, id: this.id },
			query: { page: this.$route.query.page || 1 },
		});
	} else {
		const newDate = new Date();
		this.isLoading = true;
		const typeDocument = this.purchase.typeTransaction
			? this.purchase.typeTransaction.code
			: '';
		const url =
			this.purchase.typeTransaction.code === 'CRT'
				? `withholding-tax/${this.saleId}/purchase`
				: `purchase-documents/${typeDocument}/type-document`;
		const message =
			this.purchase.typeTransaction.code === 'CRT'
				? 'La retención ha sido registrada correctamente.'
				: 'La compra ha sido registrada correctamente.';
		let body = {};
		const normalizePurchaseDate = (value) => {
			if (!value) return null;
			if (typeof value === 'string') {
				const trimmed = value.trim();
				if (!trimmed) return null;
				if (trimmed.includes('/')) {
					return `${helper.convertDate(trimmed)} 05:00`;
				}
				if (trimmed.includes('T')) {
					return `${trimmed.split('T')[0]} 05:00`;
				}
				return `${trimmed.split(' ')[0]} 05:00`;
			}
			return `${helper.formatDate(value, 'YYYY-MM-DD')} 05:00`;
		};
		const [serie, number] = this.purchase.documentNumber.split('-');
		if (this.purchase.typeTransaction.code === 'CRT') {
			body = {
				authorizationNumber: this.purchase.accessKey,
				code: '',
				dateAccouting: null,
				dateDocument: normalizePurchaseDate(this.purchase.emissionDate),
				dateExpiration: null,
				dateOnline: newDate.getTime().toString(),
				details: this.purchase.details.map((detail, index) => {
					const newDetail = {
						amountTax: detail.valorRetenido,
						brandId: detail.brandId,
						baseIva: detail.baseImponible,
						codeAccounting: null,
						codePercentageTax: `${detail.codigoRetencion}`,
						codeTax: `${detail.codigoRetencion}`,
						description: this.getTypeTax(detail),
						namePercentageTax: null,
						numberOrder: index + 1,
						percentageTax: detail.porcentajeRetener,
						productType: detail.productType,
					};
					if (this.getTypeTax(detail) === 'RENTA') {
						delete newDetail.baseIva;
						newDetail.baseExempt = 0;
						newDetail.baseRecorded = 0;
						newDetail.baseZero = detail.baseImponible;
					}
					return newDetail;
				}),
				flagSale: true,
				number,
				// hashOnline: `${this.purchase.id}-${this.purchase.documentNumber}`,
				serie,
			};
		} else {
			const { additionalInformation = {} } = this.purchase;
			const { infoDocument = {} } = additionalInformation;
			const paymentMethodId = infoDocument.medioPago && infoDocument.medioPago.id;
			const cuotasCredito =
				infoDocument.medioPago && Array.isArray(infoDocument.medioPago.cuota)
					? infoDocument.medioPago.cuota
					: [];

			const amountDetraction =
				this.countryCurrencySymbol === 'USD'
					? parseFloat((700 / this.exchangeRate).toFixed(2))
					: 700;
			const amountDetractionUSD = 
				this.purchase.currency === 'USD'
					? parseFloat((700 / Number(infoDocument.tipoCambio)).toFixed(2))
					: 700;

			let detractionBody;
			if (
				this.purchase.subsidiary?.settings?.flagDetraction &&
				this.totalGlobal >= (this.countryCurrencySymbol === 'USD' ? amountDetraction : amountDetractionUSD) &&
				this.purchase.typeTransaction?.code === 'FAC'
			) {
				const infoDetracion = infoDocument.infoDetracion?.[0];
				if (infoDetracion) {
					const sunatMatch =
						this.typesDetraction.find(
							(t) => Number(t.percentage) === Number(infoDetracion.porcentajeDetraccion)
						) || {};
					detractionBody = {
						totalAmount: this.totalGlobal,
						flagDetraction: true,
						detractionAmount: Number(infoDetracion.valorDetraccion),
						sunatCode: sunatMatch.code || '',
						sunatName: sunatMatch.description || '',
						percentage: Number(infoDetracion.porcentajeDetraccion),
						detractionPaid: false,
						receiptNumber: infoDetracion.numeroReferencia || null,
						paymentDate: null,
						paySupplier: this.purchase.currency === 'USD' ? this.totalGlobal - Number(Number(infoDetracion.valorDetraccion) / Number(infoDocument.tipoCambio).toFixed(2)).toFixed(2) : this.totalGlobal - Number(infoDetracion.valorDetraccion),
					};
				}
			}

			let detailsPayments = [];
			if (paymentMethodId === 2 && infoDocument.medioPago) {
				if (cuotasCredito.length > 0) {
					detailsPayments = cuotasCredito.map((cuota) => ({
						amount: Number(cuota.monto) + (detractionBody?.detractionAmount || 0),
						expirationDate: toPurchasePaymentDate(cuota.fechaVencimiento),
					}));
				} else {
					const exp = lastDayOfMonthPaymentDate(this.purchase.emissionDate);
					if (exp) {
						detailsPayments = [{ amount: this.totalGlobal, expirationDate: exp }];
					}
				}
			}
			if (this.purchase.typeTransaction?.code === 'NTC' && paymentMethodId === 2) {
				const purchaseAmountNtc = normalizeAmount(this.purchase.amount);
				const detailsPaymentsAmount = normalizeAmount(
					detailsPayments.reduce((acc, item) => acc + Number(item.amount || 0), 0)
				);
				const pendingAmount = normalizeAmount(purchaseAmountNtc - detailsPaymentsAmount);
				if (pendingAmount > MAX_AMOUNT_DIFF) {
					const fallbackExpirationDate =
						(detailsPayments.length > 0 &&
							detailsPayments[detailsPayments.length - 1].expirationDate) ||
						lastDayOfMonthPaymentDate(this.purchase.emissionDate);
					if (fallbackExpirationDate) {
						detailsPayments = [
							...detailsPayments,
							{ amount: pendingAmount, expirationDate: fallbackExpirationDate },
						];
					}
				}
			}

			const tipAmount = normalizeAmount(infoDocument.propina || 0);
			const warehouses = helper.getLocalData('warehouses');

			body = {
				referenceExternal: null,
				dateOnline: newDate.getTime().toString(),
				subsidiaryId: this.purchase.subsidiaryId,
				warehouseId: this.purchase.warehouseId || this.warehouseId,
				purDocumentsId: this.relatedDocument || null,
				flagIncomeStatus: true,
				entityStateId: 1, // registered
				dateDocument: normalizePurchaseDate(this.purchase.emissionDate),
				dateIncome: normalizePurchaseDate(
					this.purchase.receptionDate || this.purchase.emissionDate
				),
				documentNumber: this.purchase.documentNumber,
				serie,
				number,
				amount: normalizeAmount(this.totalGlobal),
				commentary: 'Compra generada desde documento importado de la SRI',
				currency: this.purchase.currency,
				supplierId: this.purchase.supplierId || this.supplierId,
				discountAmount: this.totalDiscount,
				subTotal: this.subtotalGlobal,
				taxes: this.totalTaxes,
				typeBilling: TypeOfBill.Physical,
				additionalInformation: {
					...this.purchase.additionalInformation,
					accessKey: this.purchase.accessKey,
					...(detractionBody ? { detraction: detractionBody } : {}),
					tip: tipAmount,
				},
				details: this.rows.map((detail) => {
					const detailTaxes = Array.isArray(detail.impuestos) ? detail.impuestos : [];
					const mainTax =
						detailTaxes.find((i) => Number(i.codigo) === 2) || detailTaxes[0] || {};
					const isFree = detail.isFree ? 1 : 0;
					return {
						flagFree: isFree,
						brandId: detail.brandId,
						quantity: Number(detail.cantidad),
						productId: detail.productId,
						description: detail.descripcion,
						productType: detail.productType || 1,
						stockQuantity: detail.stockQuantity || 0,
						price: isFree ? 0 : Number(detail.precioUnitario),
						cost: isFree ? 0 : Number(detail.precioUnitario),
						tax: mainTax.tarifa || 0,
						taxAmount: isFree ? 0 : detailTaxes.reduce((a, i) => a + Number(i.valor), 0),
						subtotalWithoutTax: isFree
							? 0
							: Number(detail.precioTotalSinImpuesto || detail.subtotal || 0),
						costCenterCode: detail.costCenterCode,
						costCenterId: detail.costCenterId,
						discountAmount: detail.discountAmount || detail.descuento || 0,
						discountPercentage: detail.discountPercentage || 0,
						unitId: detail.unitId,
						unitCode: detail.unitCode,
						unitName: detail.unitName,
						unitConversion: detail.unitConversion || 1,
						warWarehousesId: this.purchase.warehouseId || this.warehouseId,
					};
				}),
				transactions: [],
				warehouseName: warehouses.find((w) => w.id === this.purchase.warehouseId)?.name || undefined,
				paymentMethodId,
				detailsPayments,
				cashId: this.purchase.employee?.cashId,
			};
		}
		try {
			const { data: pur } = await this.$httpSales.post(url, body);
			const id = this.purchase.typeTransaction.code === 'CRT' ? this.saleId : pur.id;
			this.showNotification(message);
			this.setProduct(null, null, id);
		} catch (error) {
			if (error.status === 400) {
				if (error.data.message === 'PURCHASE_NOT_FOUND') {
					this.showGenericError('El documento de compra no existe.');
				} else if (error.data.message === 'PURCHASE_DOCUMENT_NOT_ORC_BOL') {
					this.showGenericError(
						'El tipo de documento no debe ser distinto a ORC (Orden de Compra), BOL (Boleta) o FAC (Factura)'
					);
				} else if (error.data.message === 'METHOD_PAYMENT_NOT_FOUND') {
					this.showGenericError('El método de pago no existe');
				} else if (error.data.message === 'TYPE_DOCUMENT_NOT_FOUND') {
					this.showGenericError('El tipo de documento no existe');
				} else if (error.data.message === 'TYPE_DOCUMENT_PURCHASE_INVALID') {
					this.showGenericError(
						'No se pueden crear retenciones en una orden de compra (ORC)'
					);
				} else if (error.data.message === 'PURCHASE_WITHHOLDING_TAX_REQUIRED') {
					this.showGenericError('Es necesario configurar retenciones en la compra');
				} else if (error.data.message === 'SERIE_EXIST') {
					this.showGenericError(
						'La serie para comprobante de retención no existe o no ha sido configurada'
					);
				} else if (error.data.message === 'SUPPLIER_NOT_EXIST') {
					this.showGenericError('El proveedor no existe');
				} else if (error.data.message === 'RANGE_SECUENCIAL_SUPPLIER_ERROR') {
					this.showGenericError('El secuencial de serie se encuentre fuera de rango');
				} else if (error.data.message === 'DATE_DOCUMENT_OUT_OF_RANGE') {
					this.showGenericError(
						'No se puede generar el documento fuera de rango de fechas válidas de la serie'
					);
				} else if (error.data.message === 'TRANSACTION_INVALID') {
					this.showGenericError('Es necesario elegir una cuenta bancaria');
				} else if (error.data.message === 'SERIES_QUANTITY_NOT_EQUAL_PRODUCT_QUANTITY') {
					this.showNotification(
						'La cantidad de un producto no es igual a la cantidad de series',
						'error'
					);
				} else if (error.data.message === 'BALANCE_CASH_INVALID') {
					this.showGenericError(
						'No puede realizar la compra porque el monto excede el saldo disponible de su caja'
					);
				} else if (error.data.message === 'SUPPLIER_CREDIT_LIMIT_ERROR') {
					this.showGenericError(
						`El crédito máximo para este proveedor es de ${this.purchase.currency}${this.supplierLimitCredit}.`
					);
				} else {
					this.showGenericError(error.data.messageError);
				}
				console.log('error', error);
			} else {
				this.showGenericError();
			}
		} finally {
			this.isLoading = false;
		}
	}
}

function disabledBtn() {
	return (
		(this.purchase.typeTransaction.code === 'CRT' && !this.saleId) ||
		(this.purchase.typeTransaction.code !== 'CRT' &&
			this.rows.some((r) => !r.codQuipu)) ||
		this.isLoading
	);
}

async function validateCode(value) {
	if (value) {
		this.validateLoading = true;
		const entityId = typeEntityEcommerce.Product;
		const body = {
			entityId,
			code: value || null,
		};
		this.model.code = value || null;
		try {
			await this.$httpProducts.post('slug', body);
			this.codeLoading = true;
		} catch (err) {
			this.codeLoading = false;
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.validateLoading = false;
		}
	}
}

async function saveProduct() {
	this.disabledProd = true;
	const body = { ...this.model };
	const { brandId, taxUnitId, taxUnit, priceList, warehouseId, ...productBody } = body;

	const payload = {
		brandId: brandId || undefined,
		product: {
			...productBody,
			cost: Number(body.cost) || 0,
			price: Number(body.price) || 0,
			flagActive: true,
			flagSales: !!body.flagSales,
			isPublic: true,
			originPlatform: 2, // SRI / Web
			flagTaxCost: !!body.flagTaxCost,
			taxCostPercentage: body.flagTaxCost && taxUnit ? Number(taxUnit.percentage) : 0,
		},
		priceList: priceList || {},
		warehouses: [
			{
				id: this.model.warehouseId,
				stock: 0,
				maxStock: 0,
				minStock: 0,
			},
		],
	};

	try {
		({ data: this.productSaved } = await this.$httpProducts.post('e-products', payload));
		this.cancelModal();
		this.showNotification('El producto ha sido creado correctamente.');
		this.setProduct(this.productSaved, this.productSaved.brandId);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'PRODUCT_DUPLICATE_CODE') {
				this.showGenericError('El código de producto ya existe.');
			}
		}
	} finally {
		this.disabledProd = false;
	}
}

async function loadPaymentMethods() {
	try {
		({ data: this.paymentMethods } = await this.getTypePayments('purchase'));
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadTypeTaxes() {
	try {
		({ data: this.taxTypes } = await this.$httpSales.get(
			`/catalog-sunat-details-list/${TableCode.Purchases}`
		));
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function getTypeTax(detail) {
	const code = detail.codigo || detail.codigoRetencion;
	const taxType = this.taxTypes.find((tt) => Number(tt.code) === Number(code)) || {};
	return taxType.description;
}

function title() {
	const doc = this.purchase.typeTransaction
		? this.purchase.typeTransaction.name
		: 'Factura';
	return `${this.$route.meta.title} ${doc} - ${doc} #`;
}

function successText() {
	if (this.purchase.purDocumentId || this.purchase.saleDocumentId) {
		return 'Regresar';
	}
	return this.purchase.typeTransaction.code === 'CRT' ? 'Registrar Retención' : 'Aceptar';
}

async function searchSaleByDocument() {
	if (!this.purchase.documentNumber || !this.purchase.subsidiary) {
		return;
	}
	this.isLoading = true;
	const [serie, number] = this.purchase.documentNumber.split('-');
	const body = {
		subsidiaryId: this.purchase.subsidiary.id,
		typeDocumentId: this.purchase.typeTransactionId,
		serie,
		number,
	};
	try {
		const { data: sale } = await this.$httpSales.post('sale-documents/search', body);
		if (sale) {
			this.saleId = sale.id;
		} else {
			this.showGenericError(
				`No se ha encontrado la venta #${serie}-${number} en el sistema. Es necesario crearla para poder registrar la retención.`
			);
		}
	} catch (err) {
		if (err.data && err.data.message === 'DOCUMENT_NUMBER_NOT_FOUND') {
			this.showGenericError(
				`No se ha encontrado la venta #${serie}-${number} en el sistema. Es necesario crearla para poder registrar la retención.`
			);
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}

function hiddenBtn() {
	return !!this.purchase.purDocumentId || !!this.purchase.saleDocumentId;
}

async function loadSunat() {
	const code = 'TABLA23';
	try {
		({ data: this.typesDetraction } = await this.$httpSales.get(
			`catalog-sunat-details-list/${code}`
		));
		this.typesDetraction = this.typesDetraction.map((type) => {
			const newRow = {
				...type,
				description: `${type.code} ${type.description} - ${type.percentage}%`,
			};
			return newRow;
		});
	} catch (err) {
		this.showGenericError();
	}
}

function data() {
	return {
		jsonCountries,
		typesDetraction: [],
		exchangeRate: 1,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 552,
		},
		codeLoading: false,
		columns: [
			{ id: 1, name: 'Cód XML', value: 'cod', checked: true, visible: true },
			{ id: 2, name: 'Cód Quipu', value: 'cod-quipu', checked: true, visible: true },
			{ id: 3, name: 'Descripción', value: 'description', checked: true, visible: true },
			{ id: 4, name: 'Cantidad', value: 'quantity', checked: true, visible: true },
			{ id: 5, name: 'Precio', value: 'price', checked: true, visible: true },
			{ id: 6, name: 'Descuento', value: 'discount', checked: true, visible: true },
			{ id: 7, name: '', checked: true, visible: true },
			{ id: 8, name: 'Total', value: 'total', checked: true, visible: true },
			{ id: 9, name: 'Acción', value: 'action', checked: true, visible: true },
		],
		columnsRetention: [
			{ id: 1, name: 'Código', value: 'codigo', checked: true, visible: true },
			{
				id: 2,
				name: 'Cód. Retención',
				value: 'codigoRetencion',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Base Imponible',
				value: 'baseImponible',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: '% de Retención',
				value: 'porcentajeRetener',
				checked: true,
				visible: true,
			},
			{ id: 5, name: 'Valor Ret.', value: 'valorRetenido', checked: true, visible: true },
			{
				id: 6,
				name: 'Cod. de sustento',
				value: 'codDocSustento',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Nro de Documento',
				value: 'numDocSustento',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Fecha de emisión',
				value: 'fechaEmisionDocSustento',
				checked: true,
				visible: true,
			},
		],
		currentPage: 1,
		endDate: null,
		generalTaxes: [],
		isLoading: false,
		lastPage: 0,
		model: {
			alternateCode: [],
			categoryId: null,
			code: null,
			description: null,
			flagSales: true,
			name: null,
			price: 0,
			type: null,
			unitId: null,
			brandId: null,
			warehouseId: null,
		},
		params: {
			search: null,
		},
		productSaved: {},
		productSelected: {},
		purchase: {
			typeTransaction: {},
		},
		rows: [],
		rowSelected: {},
		taxTypes: [],
		typeEnvironment: null,
		saleId: null,
		searchVal: null,
		selectsTotal: [
			{ code: 'sub', select: false },
			{ code: 'taxes', select: false },
		],
		supplierAddress: '',
		supplierCommercialName: '',
		supplierDocument: '',
		supplierId: 0,
		supplierLimitCredit: null,
		supplierName: '',
		validateLoading: false,
		checkAll: false,
		flagTypePerson: null,
		disabledSupplier: false,
		disabledProd: false,
		isSettingProduct: false,
		openRelated: false,
		messageRelated: '',
		relatedDocument: null,
	};
}

export default {
	name: 'page-detail-purchase',
	components: {
		appActions,
		actionSidebar,
		appTable,
		createProduct,
		headerPage,
		modalSidebarButton,
		productsSearchForm,
		suppliersFormShort,
		simpleModal,
	},
	computed: {
		actionsDisabled,
		disabledBtn,
		hiddenBtn,
		labelSwitch,
		resumeSubtotal,
		resumeTaxes,
		subtotalGlobal,
		successText,
		title,
		totalDiscount,
		totalGlobal,
		totalTaxes,
		otherChargesTotal,
	},
	created,
	data,
	methods: {
		cancelModal,
		changeFlagSales,
		getData,
		getTypeTax,
		getTaxAmount,
		loadDetail,
		loadPaymentMethods,
		loadSunat,
		loadTypeTaxes,
		openSearch,
		openSiderbar,
		removeAlternateCode,
		runAction,
		closeRelated,
		verifyRelatedDocument,
		saveDetailPurchase,
		confirmRelatedDocument,
		handleAcceptButton,
		saveProduct,
		saveSupplier,
		searchSaleByDocument,
		searchSupplier,
		searchValue: helper.debounce(searchValue),
		setProduct,
		toggleSelect,
		validateCode: helper.debounce(validateCode),
		associateProducts() {
			this.action.code = 'PE';
			this.action.title = 'ASOCIAR PRODUCTOS EXPRESS';
			this.action.open = true;
			this.action.width = 800;
			this.searchVal = null;
		},
		handleRowSelected(row) {
			this.rows = this.rows.map((r) => {
				if (r.rowKey === row.rowKey) {
					return { ...r, isSelected: row.isSelected };
				}
				return r;
			});
		},
		handleSelectedAll(checked) {
			this.checkAll = checked;
			this.rows = this.rows.map((r) => ({ ...r, isSelected: checked }));
		},
		setProductExpress(prod, brandId, documentId) {
			this.setProduct(prod, brandId, documentId, true);
		},

		buildDetails(prod, brandId, express) {
			if (express) {
				return this.rows
					.filter((r) => r.isSelected)
					.map((r) => ({
						brandId:
							(prod.brands && prod.brands[0] && prod.brands[0].id) ||
							brandId ||
							prod.brandSpId,
						cantidad: Number(r.cantidad),
						codigoPrincipal: `${r.codigoPrincipal}`,
						codQuipu: prod.code || prod.product.code,
						// descuento: Number(r.descuento),
						// precioUnitario: prod.price,
						productId: prod.id || prod.product.id,
						productType: prod.type,
						stockQuantity: prod.stock,
					}));
			}
			return [
				{
					brandId:
						(prod.brands && prod.brands[0] && prod.brands[0].id) ||
						prod.brandSpId ||
						brandId,
					cantidad: Number(this.rowSelected.cantidad),
					codigoPrincipal: `${this.rowSelected.codigoPrincipal}`,
					codQuipu: prod.code || prod.product.code,
					// descuento: Number(this.rowSelected.descuento),
					// precioUnitario: prod.price,
					productId: prod.id || prod.product.id,
					productType: prod.type,
					stockQuantity: prod.stock,
				},
			];
		},
	},
	props: {
		dateEnd: [Date, String, Number],
		dateStart: [Date, String, Number],
		id: [Number, String],
		purchaseId: [Number, String],
	},
	watch: {
		purchase,
	},
};
</script>
<style lang="scss" scoped>
.box-title {
	background: map-get($colors, detail-gray);
	color: map-get($colors, blue-check);
	font-size: 11px;
	padding: 7px 4px;
}

.box-description {
	background: map-get($colors, value-gray);
	font-size: 11px;
	overflow: auto;
	padding: 7px;
	white-space: nowrap;
}

.mt-200 {
	margin-top: 200px;
}

.item-link {
	color: map-get($colors, background-sidebar);
	font-family: font(open-semibold);
	font-size: size(small11);
	text-decoration: underline map-get($colors, background-sidebar);
}

.btn-summary-import {
	border: 1px solid color(primary);
	border-radius: 2px;
	height: 15px;
	width: 15px;

	.icon {
		font-size: 15px;
		height: 18px;
		line-height: 0.9;
	}
}
</style>
