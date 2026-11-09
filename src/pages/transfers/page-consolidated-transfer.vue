<template>
	<div>
		<header-page :limit-title="80" :title="$route.query.showDetail
			? `${$route.meta.title} - ${this.dateConsolidation}`
			: $route.meta.title
			" />
		<v-layout class="px-5 pt-2" align-end>
			<v-flex xs12 sm4 md4>
				<products-search-input ref="productSearcher" ref-value="productSearcher" id="productSearcher"
					:clean-input="cleanInput" :search-value="selectedProduct" :flagInputEvent="true"
					@search="openSearch" />
			</v-flex>
			<v-spacer></v-spacer>
			<v-flex xs2>
				<v-btn type="button" :disabled="disabledSave" color="primary"
					class="btn-action px-2 white--text btn-full py-2" @click.native="saveDraft">
					Grabar Borrador
				</v-btn>
			</v-flex>
		</v-layout>
		<v-flex xs12 mt-4>
			<table-consolidated :list-product="products" :list-detail="productDetail" :num-colum="numTransfer"
				:disabled-send="disabledSend" :consolidation="consolidationData" @set-theory="setTheory"
				@open-dialog-record="openDialogRecord" @send-transfer="validSendTransfer"
				@set-conversion="setConversionWarehouse" @show-conversion="showConversion" @open-custom-modal="showCustomModal = true" />
		</v-flex>
		<v-layout> </v-layout>
		<action-sidebar :width="action.width" :code-action="action.code" :title="action.title" v-model="action.open"
			@close-modal="closeModal">
			<products-search-form v-if="action.code === 'product-searcher'" show-consolidated
				:warehouse-origin="warehouseOrigin" :search-value="searchVal" @add-product="setProduct" />
			<record-transfer v-if="action.code === 'record-transfer'" :warehouse-id="idWarehouseTransfer"
				:id-transfer="idtransfer" :product-id="idProduct" :name-product="nameProduct" :name-point="namePoint"
				@close-slide="closeModalRecord" />
		</action-sidebar>
		<v-dialog v-model="show" persistent max-width="345px">
			<modal-items title="Realizar Envio" v-if="show" name-action="Continuar" @close-modal="closeModal"
				@action-modal="sendTransferPoint(itemTransfer)" show-slot>
				<div class="px-3 pt-5 pb-5 text-modal">
					¿ Hay productos que tiene relación a la transacción, primero generé
					"Grabar Borrador". Desea continuar ?
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="showModalConversion" max-width="280px">
			<modal-items v-if="showModalConversion" :title="productName" show-slot @close-modal="closeModal"
				@action-modal="applyAction" :show-regular="arrayConversion.length > 0">
				<div v-if="arrayConversion.length > 0">
					<v-layout v-for="(item, index) in arrayConversion" :key="index" row d-flex justify-center
						align-center mb-2 px-4 pb-2 pt-2>
						<v-flex xs2>
							<v-checkbox v-model="item.isSelected" color="primary" hide-details
								@change="addConversion(item, $event)"></v-checkbox>
						</v-flex>
						<v-flex xs4>
							{{ item.name }}
						</v-flex>
					</v-layout>
				</div>
				<v-layout v-else px-4 pb-2 pt-2>
					<label> Este producto no cuenta con conversiones. </label>
				</v-layout>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="showStockModal" persistent max-width="400px">
			<modal-items title="Stock Insuficiente" v-if="showStockModal" name-action="Entendido" 
			@close-modal="closeModal"
			@action-modal="closeModal" 
			show-slot>
			<div class="px-4 pt-4 pb-4 text-modal">
				<p>No hay stock suficiente para realizar el envio de los siguiente productos:</p>
				<ul class="mt-2 text-left" style="padding-left:20px;">
					<li v-for="(product, index) in insufficientProducts" :key="index">
						{{ product.codeProduct }} - {{ product.nameProduct }}
					</li>
				</ul>
			</div>

			</modal-items>
		</v-dialog>
		<modal-resumen-consolidated 
			v-model="showCustomModal" 
			:items="products"
			:consolidation-data="consolidationData"
			@on-processing="isProcessingStock = true"
			@on-error="isProcessingStock = false"
			@on-accept="onAcceptStock" />

		<app-loading
			:show-loading="isProcessingStock"
			:label="'La carga terminará en un momento y podrás ver toda la información del consolidado de transferencias.'"
		/>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import tableConsolidated from '@/components/shared/table/table-consolidated';
import recordTransfer from '@/components/products/record-transfer';
import appLoading from '@/components/shared/app-loading';
import modalResumenConsolidated from './modal-resumen-consolidated';

const { exactDate } = helper;

function created() {
	this.loadConsolidated();
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	if (this.searchVal) {
		this.action.code = 'product-searcher';
		this.action.title = 'Productos';
		this.action.width = 930;
		this.action.open = true;
	}
}

function applyAction() {
	this.closeModal();
	const { productId } = this.productObject;
	this.productDetail = this.productDetail.map((transfer) => {
		const newTransfer = { ...transfer };
		const indexProduct =
			transfer.products &&
			transfer.products.findIndex((p) => p && p.productId === productId);
		if (indexProduct > -1) {
			const newDetail = { ...transfer.products[indexProduct] };
			if (newDetail.status === 2) {
				this.conversionsProduct.forEach((conversion) => {
					if (!newDetail.conversions) {
						newDetail.conversions = [];
					}
					const converIndex = newDetail.conversions.findIndex(
						(conver) => conver && conver.codeConversion === conversion.code
					);
					if (!(converIndex > -1)) {
						const objConvert = {
							codeConversion: conversion.code,
							conversionId: conversion.id,
							quantityTo: 0,
							unitCode: newDetail.unitCode,
							unitConversion: conversion.name,
							unitId: newDetail.unitId,
							unitName: newDetail.unitName,
							unitQuantity: conversion.quantity,
						};
						newDetail.conversions.push(objConvert);
					}
				});
			}
			// const totalConversion = newDetail.conversions.reduce((a, m) =>
			// 	a + m.unitQuantity, 0);
			// newDetail.quantity = newDetail.status === 2 ? totalConversion : newDetail.quantity;
			newTransfer.products[indexProduct] = newDetail;
		}
		return newTransfer;
	});
	const getTotal = this.productDetail.reduce((accum, transfer) => {
		let newAccum = accum;
		const filterProduct = transfer.products.filter(
			(i) =>
				i.brandId === this.productObject.brandId &&
				i.productId === this.productObject.productId
		);
		if (filterProduct && filterProduct.length > 0) {
			newAccum += filterProduct.reduce((a, i) => a + i.quantity, 0);
		}
		return newAccum;
	}, 0);
	const findIndex = this.products.findIndex(
		(p) =>
			p.brandId === this.productObject.brandId &&
			p.productId === this.productObject.productId
	);
	if (findIndex > -1) {
		this.products[findIndex].quantitySend = getTotal;
		this.products[findIndex].newQuantity =
			this.products[findIndex].quantityAvailable -
			this.products[findIndex].quantitySend;
	}
	this.conversionsProduct = [];
}

async function saveDraft() {
	try {
		const { idConsolidated } = this.$route.params;
		const detailTransfer = [];
		this.productDetail.map((transfer) => {
			const filterStock = transfer.products.filter(
				(p) => p.id || p.quantity >= 0
			);
			const newRow = filterStock.map((detail) => {
				const newDetail = {};
				newDetail.id = detail.id || undefined;
				newDetail.transferId = detail.transferId || transfer.transferId;
				newDetail.quantity = detail.quantity;
				const filterConversion = detail.conversions.filter(
					(p) => p.codeConversion !== 'UNQ'
				);
				newDetail.additionalInformation = {
					conversions: filterConversion || [],
				};
				if (!detail.id) {
					newDetail.productId = detail.productId;
					newDetail.brandId = detail.brandId;
					newDetail.warehouseOriginId = this.warehouseOrigin;
					newDetail.warehouseSourceId = detail.warehouseSourceId;
				}
				detailTransfer.push(newDetail);
				return detailTransfer;
			});
			return newRow;
		});
		const filterTotalConsolidation = this.products.filter(
			(p) => p.firstDetailId
		);
		const body = {
			details: detailTransfer,
			totalConsolidation: filterTotalConsolidation.map((product) => {
				const newProduct = {};
				newProduct.firstDetailId = product.firstDetailId;
				newProduct.quantityTheoretical = Number(product.quantityTheoretical);
				newProduct.quantityAvailable = product.quantityAvailable;
				// newProduct.quantityRequested = product.quantityRequested;
				newProduct.quantitySend = product.quantitySend;
				newProduct.newQuantity = product.newQuantity;
				newProduct.stock = product.stock;
				return newProduct;
			}),
		};
		const response = await this.$httpProducts.patch(
			`transfers/consolidation/${idConsolidated}`,
			body
		);
		if (response) {
			this.loadConsolidated();
		}
		this.showNotification('Se generó el borrador correctamente');
	} catch (error) {
		this.showGenericError(error.data.messageError);
	}
}

async function loadConsolidated() {
	const { idConsolidated } = this.$route.params;
	const response = await this.$httpProducts.get(
		`transfers/consolidation/${idConsolidated}`
	);
	this.warehouseOrigin = response.data.warehouseOriginId;
	this.dateConsolidation = exactDate(
		response.data.consolidationDate,
		'DD-MM-YYYY HH:mm:ss'
	);
	this.consolidationData = response.data;
	const flagKardex = response.data.additionalInformation && response.data.additionalInformation.flagKardex;
	this.products = response.data.details.map((row) => {
		const newRow = { ...row };
		// newRow.disabled = false;
		newRow.quantityTheoretical = row.quantityTheoretical || 0;
		if (flagKardex) {
			newRow.quantityAvailable = row.stock;
		} else {
			newRow.quantityAvailable = newRow.quantityTheoretical + row.stock;
		}
		newRow.conversionProduct = this.setConversionFromProduct(row.conversions);

		this.productDetail = response.data.transfers.map((transfer) => {
			const newTransfer = { ...transfer };
			const flag = transfer.transferDetails.findIndex(
				(i) => i.brandId === row.brandId && i.productId === row.productId
			);
			if (flag > -1) {
				const detail = transfer.transferDetails[flag];
				detail.conversions =
					detail.additionalInformation &&
						detail.additionalInformation.conversions
						? detail.additionalInformation.conversions
						: [];
				newRow.quantityRequested = row.quantityRequested;
				// if (row.quantityRequested > 0) {
				// 	newRow.quantityRequested = row.quantityRequested;
				// } else {
				// 	newRow.quantityRequested += Number(detail.quantity);
				// }
				if (row.quantitySend > 0) {
					newRow.quantitySend = row.quantitySend;
				} else {
					newRow.quantitySend += Number(detail.quantity);
				}
				newRow.newQuantity = newRow.quantityAvailable - newRow.quantitySend;
			}
			return newTransfer;
		});
		return newRow;
	});
	this.numTransfer = response.data.transfers.length;
	this.productDetail = response.data.transfers.map((transfer) => {
		const groupDetail = [];
		const detailGeneral = {
			products: [],
			...transfer,
		};
		this.products.forEach((product) => {
			const flag = transfer.transferDetails.findIndex(
				(i) =>
					i.brandId === product.brandId && i.productId === product.productId
			);
			const objUnidad = {
				codeConversion: product.unitCode,
				quantityTo: 0,
				unitCode: product.unitCode,
				unitId: product.unitId,
				unitName: product.unitName,
				unitQuantity: 0,
			};
			if (flag > -1) {
				const detail = transfer.transferDetails[flag];
				if (
					detail.additionalInformation &&
					detail.additionalInformation.conversions &&
					detail.additionalInformation.conversions.length > 0
				) {
					detail.conversions =
						detail.additionalInformation &&
							detail.additionalInformation.conversions
							? detail.additionalInformation.conversions
							: [];
					const validUnd = detail.conversions.find(
						(p) => p.unitId === product.unitId
					);
					if (!validUnd) {
						detail.conversions.push(objUnidad);
					}
					// detail.conversions.push(objUnidad);
				} else {
					const objNewConversion = {
						...objUnidad,
						quantityTo: detail.quantity,
					};
					detail.conversions.push(objNewConversion);
				}
				detail.totalSend =
					detail.conversions && detail.conversions.length > 0
						? detail.conversions.reduce(
							(a, d) => Number(a) + Number(d.unitQuantity),
							0
						)
						: 0;
				groupDetail.push(detail);
			} else {
				const unit = [
					{
						codeConversion: product.unitCode,
						quantityTo: 0,
						unitCode: product.unitCode,
						unitId: product.unitId,
						unitName: product.unitName,
						unitQuantity: 0,
					},
				];
				groupDetail.push({
					productId: product.productId,
					brandId: product.brandId,
					quantity: 0,
					conversions: unit,
					status: transfer.status,
					transferId: transfer.transferId,
					warehouseSourceId: transfer.warehouseSourceId,
				});
			}
			detailGeneral.products = groupDetail;
		});
		return detailGeneral;
	});
}

async function onAcceptStock() {
	try {
		const { idConsolidated } = this.$route.params;

		const detailTransfer = [];
		this.productDetail.forEach((transfer) => {
			const filterStock = transfer.products.filter((p) => p.id || p.quantity >= 0);
			
			filterStock.forEach((detail) => {
				const newDetail = {};
				newDetail.id = detail.id || undefined;
				newDetail.transferId = detail.transferId || transfer.transferId;
				newDetail.quantity = detail.quantity;
				
				const filterConversion = detail.conversions.filter((p) => p.codeConversion !== 'UNQ');
				newDetail.additionalInformation = { conversions: filterConversion || [] };
				
				if (!detail.id) {
					newDetail.productId = detail.productId;
					newDetail.brandId = detail.brandId;
					newDetail.warehouseOriginId = this.warehouseOrigin;
					newDetail.warehouseSourceId = detail.warehouseSourceId;
				}
				
				detailTransfer.push(newDetail);
			});
		});

		const filterTotalConsolidation = this.products.filter((p) => p.firstDetailId);
		const totalConsolidationArray = filterTotalConsolidation.map((product) => {
			const newProduct = {};
			newProduct.firstDetailId = product.firstDetailId;
			newProduct.quantityTheoretical = Number(product.quantityTheoretical);
			newProduct.quantityAvailable = product.quantityAvailable;
			newProduct.quantitySend = product.quantitySend;
			newProduct.newQuantity = product.newQuantity;
			newProduct.stock = product.stock + Number(product.quantityTheoretical);
			return newProduct;
		});

		const body = {
			details: detailTransfer,
			totalConsolidation: totalConsolidationArray,
			additionalInformation: {
				...this.consolidationData.additionalInformation, 
				flagKardex: true 
			}
		};

		const response = await this.$httpProducts.patch(
			`transfers/consolidation/${idConsolidated}`,
			body
		);

		if (response) {
			await this.loadConsolidated();
			this.showNotification('El stock ha sido realizado y actualizado correctamente.');
		}
	} catch (error) {
		console.error('Error al actualizar consolidado:', error);
		if (error.data && error.data.messageError) {
			this.showGenericError(error.data.messageError);
		} else {
			this.showGenericError('Ocurrió un error al intentar actualizar el estado del consolidado.');
		}
	} finally {
		this.isProcessingStock = false;
	}
}


function openDialogRecord({ id, productId }, item) {
	this.action = {
		open: true,
		code: 'record-transfer',
		title: 'Historial de Transferencias',
		width: 600,
	};
	const product = this.products.find((p) => p.productId === productId);
	this.nameProduct = product.nameProduct;
	this.idWarehouseTransfer = item.warehouseSourceId || null;
	this.namePoint = item.warehouseName || null;
	this.idtransfer = id;
	this.idProduct = productId;
}

function closeModal() {
	this.action = {
		open: false,
		code: '',
		title: '',
	};
	this.showModalConversion = false;
	this.productName = '';
	this.show = false;
	this.nameProduct = null;
	this.idtransfer = null;
	this.idProduct = null;
	// this.conversionsProduct = [];
	this.showStockModal = false;
	this.insufficientProducts = [];
}

function closeModalRecord() {
	this.action = {
		open: false,
		code: '',
		title: '',
	};
	this.idProduct = null;
	this.nameProduct = null;
	this.idtransfer = null;
	this.productName = null;
}

function setProduct(productItem) {
	const findProduct = this.products.find(
		(p) => p.productId === productItem.productId
	);
	if (findProduct) {
		this.showNotification(
			`El producto ya se encuentra agregado: ${productItem.name}.`,
			'warning'
		);
	} else {
		const { idConsolidated } = this.$route.params;
		const newProducts = {
			codeProduct: productItem.code,
			productId: productItem.productId,
			brandId: productItem.brandId,
			nameProduct: productItem.product ? productItem.product.name : '',
			quantityTheoretical: 0,
			conversions: productItem.product ? productItem.product.conversions : {},
			stock: productItem.stock || 0,
			quantityAvailable: productItem.stock,
			quantityRequested: 0,
			quantitySend: 0,
			newQuantity: 0,
			// disabled: true,
			headerId: idConsolidated,
			priceCost: 0.001,
			unitId: productItem.product ? productItem.product.unitId : '',
			unitCode:
				productItem.product && productItem.product.unit
					? productItem.product.unit.code
					: '',
			unitName:
				productItem.product && productItem.product.unit
					? productItem.product.unit.name
					: '',
		};
		this.products.push(newProducts);
		this.productDetail = this.productDetail.map((transfer) => {
			const newTransfer = { ...transfer };
			const objUnidad = {
				codeConversion: newProducts.unitCode,
				quantityTo: 0,
				unitCode: newProducts.unitCode,
				unitId: newProducts.unitId,
				unitName: newProducts.unitName,
				unitQuantity: 1,
			};
			const objDetailTransfer = {
				id: null,
				transferId: transfer.transferId,
				quantity: 0,
				conversions: [objUnidad],
				productId: newProducts.productId,
				brandId: newProducts.brandId,
				warehouseOriginId: this.warehouseOrigin,
				warehouseSourceId: transfer.warehouseSourceId,
			};
			newTransfer.products.push(objDetailTransfer);
			return newTransfer;
		});
	}
	this.searchVal = null;
	this.closeModal();
}

function setTheory({ value }, index, product) {
	const sumProduct = Number(value) + product.stock;
	this.products[index].quantityTheoretical = value;
	this.products[index].quantityAvailable = sumProduct;
	this.products[index].newQuantity =
		this.products[index].quantityAvailable - this.products[index].quantitySend;
	// this.products = this.products.map((productItem) => {
	// 	const newProduct = { ...productItem };
	// 	this.productDetail.forEach((transfer) => {
	// 		const flag = transfer.products.findIndex(i => i.brandId ===
	// 			product.brandId
	// 			&& i.productId === product.productId);
	// 		if (flag > -1) {
	// 			// const detail = transfer.products[flag];
	// 			// newProduct.quantitySend = detail.conversions && detail.conversions.length > 0 ?
	// 			// 	detail.conversions.reduce((a, d) => Number(a) + Number(d.quantityTo), 0) : 0;
	// 			newProduct.newQuantity = this.products[index].quantityAvailable - newProduct.quantitySend;
	// 		}
	// 	});
	// 	return newProduct;
	// });
}

function validSendTransfer(item) {
	const productsToSend = item.products.filter(p => p.quantity > 0);
	const noStockItems = [];
	productsToSend.forEach((detail) => {
		const globalProduct = this.products.find(
			(p) => p.productId === detail.productId && p.brandId === detail.brandId);
		if (globalProduct && globalProduct.newQuantity < 0) {
			noStockItems.push(globalProduct);
		}
	});
	if (noStockItems.length > 0) {
		this.insufficientProducts = noStockItems;
		this.showStockModal = true;
		return;
	}
	const filterProduct = item.products.filter(
		(p) => !p.transferDetailId && p.quantity > 0
	);
	if (filterProduct.length > 0) {
		this.show = true;
		this.itemTransfer = item;
	} else {
		this.sendTransferPoint(item);
	}
}

async function sendTransferPoint(item) {
	this.disabledSend = true;
	const filterArray = item.products.filter((p) => p.quantity > 0);
	const array = filterArray.map((r) => {
		const newDate = new Date();
		const flag = filterArray.find(
			(i) => i.brandId === r.brandId && i.productId === r.productId
		);
		const newRow = {};
		if (flag) {
			const detail = flag;
			newRow.additionalInformation = {
				conversionsSend: detail.conversions,
			};
			newRow.idDetail = detail.transferDetailId;
			newRow.dateOnline = newDate.getTime().toString();
			newRow.productId = detail.productId;
			newRow.quantitySent = detail.quantity;
			newRow.status = detail.status;
			newRow.reason = detail.reason;
		}
		return newRow;
	});
	const { idConsolidated } = this.$route.params;
	const body = {
		details: array,
		consolidationId: Number(idConsolidated),
	};
	try {
		const response = await this.$httpProducts.patch(
			`transfers/${item.transferId}/start`,
			body
		);
		if (response) {
			this.loadConsolidated();
			this.show = false;
			this.showNotification('Se genero el envío correctamente');
		}
	} catch (error) {
		this.showGenericError(error.data.messageError);
	} finally {
		this.disabledSend = false;
	}
}

function showConversion(index, product) {
	this.showModalConversion = true;
	this.productObject = product;
	this.productName = product.name || product.nameProduct;
	this.arrayConversion = this.setConversionFromProduct(product.conversions);
}

function setConversionFromProduct(conversions) {
	const conversionsFromProduct = conversions
		? Object.keys(conversions).map((k) => {
			const newConversions = { ...conversions[k] };
			newConversions.isSelected = false;
			newConversions.id = Number(k);
			return newConversions;
		})
		: [];
	return [].concat(conversionsFromProduct);
}

function setConversionWarehouse(
	itemHeader,
	detailTransfer,
	item,
	indexHeader,
	index,
	indexDetail,
	{ value }
) {
	const findProduct = this.products.find(
		(p) =>
			p.brandId === detailTransfer.brandId &&
			p.productId === detailTransfer.productId
	);
	if (
		findProduct &&
		findProduct.conversionProduct &&
		findProduct.conversionProduct.length > 0
	) {
		const findConversion = findProduct.conversionProduct.find(
			(con) => con.id === item.conversionId
		);
		if (findConversion) {
			this.productDetail[indexHeader].products[indexDetail].conversions[
				index
			].quantityTo = Number(value);
			this.productDetail[indexHeader].products[indexDetail].conversions[
				index
			].unitQuantity = Number(findConversion.quantity) * Number(value);
		} else {
			this.productDetail[indexHeader].products[indexDetail].conversions[
				index
			].quantityTo = Number(value);
			this.productDetail[indexHeader].products[indexDetail].conversions[
				index
			].unitQuantity = Number(value);
		}
	} else {
		this.productDetail[indexHeader].products[indexDetail].conversions[
			index
		].quantityTo = Number(value);
		this.productDetail[indexHeader].products[indexDetail].conversions[
			index
		].unitQuantity = Number(value);
	}
	const totalConversion = this.productDetail[indexHeader].products[
		indexDetail
	].conversions.reduce((a, m) => a + m.unitQuantity, 0);
	if (detailTransfer.conversions.length === 1) {
		this.productDetail[indexHeader].products[indexDetail].quantity =
			Number(totalConversion);
	} else {
		this.productDetail[indexHeader].products[indexDetail].quantity =
			Number(totalConversion);
	}
	const getTotal = this.productDetail.reduce((accum, transfer) => {
		let newAccum = accum;
		const filterProduct = transfer.products.filter(
			(i) =>
				i.brandId === detailTransfer.brandId &&
				i.productId === detailTransfer.productId
		);
		if (filterProduct && filterProduct.length > 0) {
			newAccum += filterProduct.reduce((a, i) => a + i.quantity, 0);
		}
		return newAccum;
	}, 0);
	const indexRow = itemHeader.products.findIndex(
		(i) =>
			i.brandId === detailTransfer.brandId &&
			i.productId === detailTransfer.productId
	);
	if (indexRow > -1) {
		this.products[indexRow].quantitySend = getTotal;
		this.products[indexRow].newQuantity =
			this.products[indexRow].quantityAvailable -
			this.products[indexRow].quantitySend;
	}
}

function addConversion(item) {
	this.conversionsProduct.push(item);
}

function disabledSave() {
	return this.productDetail.every((p) => p.status === 5);
}

function data() {
	return {
		numTransfer: 0,
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		arrayConversion: [],
		conversionsProduct: [],
		dateConsolidation: null,
		consolidationData: {},
		cleanInput: false,
		idProduct: null,
		itemTransfer: {},
		disabledSend: false,
		inventoriesDetail: [],
		selectedProduct: '',
		searchVal: null,
		namePoint: null,
		productName: null,
		productObject: {},
		products: [],
		productDetail: [],
		show: false,
		showModalConversion: false,
		warehouseOrigin: null,
		showCustomModal: false,
		showStockModal: false,
		insufficientProducts: [],
		isProcessingStock: false
	};
}

export default {
	name: 'page-consolidated-transfer',
	created,
	data,
	components: {
		actionSidebar,
		headerPage,
		modalItems,
		productsSearchInput,
		productsSearchForm,
		recordTransfer,
		tableConsolidated,
		modalResumenConsolidated,
		appLoading
	},
	computed: {
		disabledSave,
	},
	methods: {
		addConversion,
		applyAction,
		closeModal,
		closeModalRecord,
		loadConsolidated,
		saveDraft,
		setConversionWarehouse,
		setProduct,
		setTheory,
		sendTransferPoint,
		setConversionFromProduct,
		showConversion,
		openSearch,
		openDialogRecord,
		validSendTransfer,
		onAcceptStock,
	},
};
</script>
<style scoped>
::v-deep .main-header-page {
	margin-top: -10px !important;
	padding-bottom: 5px !important;
}
</style>