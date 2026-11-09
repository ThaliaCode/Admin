<template>
	<div class="detail-in-table" :class="{ 'pr-0': modal }">
		<v-layout wrap align-center primary py-2 px-4>
			<v-flex xs6>
				<span class="body-1 white--text my-0">#</span>
				<span class="title white--text">
					{{ orderSelected.number }}
				</span>
				<span class="title white--text" v-if="orderSelected.commerce">
					- {{ orderSelected.commerce.name || '---' }}
				</span>
			</v-flex>
			<v-flex xs6 text-xs-right pl-4>
				<span class="body-1 white--text my-0">Total</span>
				<span class="white--text my-0 total-order ml-2 mr-2">
					{{ symbolCurrency }} {{ orderSelected.total | round }}
				</span>
				<button @click="printOrderWarehouseModal" class="border-l pl-2" title="Impresión Almacén">
					<v-icon color="white" title="Impresión Almacén">print</v-icon>
				</button>
				<button @click="closeDetails" class="border-l pl-2">
					<v-icon color="white">clear</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<div class="min-height white">
			<v-layout wrap px-4 py-2>
				<v-flex xs12 mb-2 body-1>
					<div class="content-green">Dirección</div>
					<div class="c-text-green">{{ getAddress }}</div>
				</v-flex>
				<v-flex xs4 mb-2 body-1 v-if="orderSelected.flagPickUp === 1">
					<div class="content-green">Departamento</div>
					<div class="c-text-green">
						{{
							orderSelected.customerAddress && orderSelected.customerAddress.province
								? orderSelected.customerAddress.province.name
								: ''
						}}
					</div>
				</v-flex>
				<v-flex xs4 mb-2 body-1 v-if="orderSelected.flagPickUp === 1">
					<div class="content-green">Provincia</div>
					<div class="c-text-green">
						{{
							orderSelected.customerAddress && orderSelected.customerAddress.city
								? orderSelected.customerAddress.city.name
								: ''
						}}
					</div>
				</v-flex>
				<v-flex xs4 mb-2 body-1 v-if="orderSelected.flagPickUp === 1">
					<div class="content-green">Distrito</div>
					<div class="c-text-green">
						{{
							orderSelected.customerAddress && orderSelected.customerAddress.parish
								? orderSelected.customerAddress.parish.name
								: ''
						}}
					</div>
				</v-flex>
				<v-flex xs5 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Fecha</v-flex>
						<v-flex xs8 class="c-text-green">{{
							orderSelected.createdAt | formatDate
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs7 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Modo de Pago</v-flex>
						<v-flex xs8 class="c-text-green">{{
							orderSelected.wayPayment ? orderSelected.wayPayment.name : ''
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1 v-if="orderSelected.additionalInfo">
					<v-layout>
						<v-flex xs4 class="content-green">Datos de Depósito</v-flex>
						<v-flex xs8 class="c-text-green">
							<p class="mb-2">
								<span class="bold">Método de Pago:</span>
								<span>{{ orderSelected.paymentMethod || '---' }}</span>
							</p>
							<p class="mb-2">
								<span class="bold"
									>{{
										orderSelected.paymentMethodCode
											? orderSelected.paymentMethodCode === 'deposito'
												? 'Nro de Depósito'
												: 'Nro de Teléfono'
											: 'Nro de Depósito'
									}}:</span
								>
								<span>{{
									orderSelected.additionalInfo
										? orderSelected.additionalInfo.depositNumber || '---'
										: '---'
								}}</span>
							</p>
							<p class="mb-2">
								<span class="bold">Voucher:</span>
								<a
									:href="
										orderSelected.additionalInfo
											? orderSelected.additionalInfo.urlVoucher || null
											: ''
									"
									target="_blank"
									v-if="orderSelected.additionalInfo.urlVoucher"
								>
									<img
										:src="
											orderSelected.additionalInfo
												? orderSelected.additionalInfo.urlVoucher
												: ''
										"
										alt="voucher de pago"
										height="40px"
									/>
								</a>
								<span v-else>---</span>
							</p>
							<p>
								<span class="bold">Estado de Voucher:</span>
								<span>{{ orderSelected.voucherStatus || '---' }}</span>
							</p>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Empleado</v-flex>
						<v-flex xs8 class="c-text-green">{{
							orderSelected.employee ? orderSelected.employee.fullname : ''
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex v-if="orderSelected.stateLogs && orderSelected.stateLogs.find(log => log.orderStateCode === 'CANCELED')" xs12 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Responsable de anulación</v-flex>
						<v-flex xs8 class="c-text-green">{{
							orderSelected.stateLogs && orderSelected.stateLogs.find(log => log.orderStateCode === 'CANCELED') ? orderSelected.stateLogs.find(log => log.orderStateCode === 'CANCELED').name : ''
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex v-if="orderSelected.stateLogs && orderSelected.stateLogs.find(log => log.orderStateCode === 'CANCELED')" xs12 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Fecha y hora de anulación</v-flex>
						<v-flex xs8 class="c-text-green">{{
							!(orderSelected.stateLogs && orderSelected.stateLogs.find(log => log.orderStateCode === 'CANCELED')) ? '' : orderSelected.stateLogs.find(log => log.orderStateCode === 'CANCELED').date | formatDate
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-switch
						v-model="viewRespon"
						label="Ver detalle responsable"
						color="primary"
						inset
						hide-details
					/>
				</v-flex>
				<template v-if="viewRespon">
					<v-flex xs12 mb-2 body-1>
						<span class="body-2 title-details-table">Responsable: </span>
					</v-flex>
					<v-flex xs6 mb-2 body-1>
						<v-layout>
							<v-flex xs4 class="content-green">Responsable</v-flex>
							<v-flex xs8 class="c-text-green">{{
								orderSelected.responsiblePickUp
									? orderSelected.responsiblePickUp.name
									: ''
							}}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 mb-2 body-1>
						<v-layout>
							<v-flex xs4 class="content-green">Correo</v-flex>
							<v-flex xs8 class="c-text-green">{{
								(orderSelected.responsiblePickUp &&
									orderSelected.responsiblePickUp.email) ||
								orderSelected.customer.email
							}}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 mb-2 body-1>
						<v-layout>
							<v-flex xs4 class="content-green">{{ captionDocuments }}</v-flex>
							<v-flex xs8 class="c-text-green">{{
								orderSelected.responsiblePickUp ? orderSelected.responsiblePickUp.dni : ''
							}}</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 mb-2 body-1>
						<v-layout>
							<v-flex xs4 class="content-green">Teléfono</v-flex>
							<v-flex xs8 class="c-text-green">{{
								orderSelected.responsiblePickUp
									? orderSelected.responsiblePickUp.phone
									: ''
							}}</v-flex>
						</v-layout>
					</v-flex>
				</template>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 title-details-table">Facturación: </span>
					{{ orderSelected.typePaymentName }}
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Tipo de documento</v-flex>
						<v-flex xs8 class="c-text-green">{{ dataBill.typeDocument }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1 v-if="existPayment">
					<v-layout>
						<v-flex xs4 class="content-green">M. de pago</v-flex>
						<v-flex xs8 class="c-text-green">{{
							orderSelected.additionalInfo.paymentType.name
						}}</v-flex>
						<v-flex
							v-if="existPayment && orderSelected.additionalInfo.paymentType.id === 2"
							xs4
							pl-3
						>
							Ver Cuotas
							<v-icon
								v-if="existPayment && orderSelected.additionalInfo.paymentType.id === 2"
								color="primary"
								class="ml-2"
								size="19"
								@click="onQuote"
							>
								remove_red_eye
							</v-icon>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-layout
					mb-3
					wrap
					class="transactions-container"
					pl-5
					v-if="
						existPayment &&
						orderSelected.additionalInfo.paymentType.id === 2 &&
						showQuotation
					"
				>
					<v-flex xs12>
						<v-layout>
							<v-flex xs9>
								<v-layout wrap>
									<v-flex xs12 mb-2>
										<v-layout>
											<v-flex xs2 class="detail-title-row primary--text text-center"
												>Cuota
											</v-flex>
											<v-flex xs2 class="detail-title-row primary--text text-center"
												>Monto</v-flex
											>
											<v-flex xs2 class="detail-title-row primary--text text-center"
												>Fecha de Vencimiento
											</v-flex>
										</v-layout>
									</v-flex>
									<template>
										<v-flex
											xs12
											v-for="(detail, detailIndex) in orderSelected.additionalInfo
												.paymentType.details"
											:key="detailIndex"
										>
											<v-layout>
												<v-flex xs2 class="text-center">{{ detailIndex + 1 }}</v-flex>
												<v-flex xs2 class="text-center">{{
													detail.amount.toFixed(2)
												}}</v-flex>
												<v-flex xs2 class="text-center">{{
													detail.expirationDate
												}}</v-flex>
											</v-layout>
										</v-flex>
									</template>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-flex xs6 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">{{ dataBill.labelDocument }}</v-flex>
						<v-flex xs8 class="c-text-green">{{ dataBill.fullName }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">{{ dataBill.labelDocumentNumber }}</v-flex>
						<v-flex xs8 class="c-text-green">{{ dataBill.documentNumber }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1 v-if="isDebts">
					<v-layout>
						<v-flex xs4 class="content-green">Deuda total pendiente</v-flex>
						<v-flex xs7 class="c-text-green"
							><span
								class="mr-2"
								v-for="(amount, currency) in dataBill.customer.debtsSales"
								:key="currency"
								v-if="amount !== 0"
								>{{ currency }}: {{ amount | round }}</span
							></v-flex
						>
						<app-tooltip-button
							icon="remove_red_eye"
							text="Ver Detalle de la deuda"
							color="success"
							size="20"
							class="ml-3 mr-3"
							@click-icon="$emit('open-debt', dataBill)"
						/>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Dirección</v-flex>
						<v-flex xs8 class="c-text-green">{{ dataBill.address || '-' }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex xs4 class="content-green">Comentario</v-flex>
						<v-flex xs8 class="c-text-green">{{ orderSelected.comments || '-' }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs4 mb-2 body-1 v-if="orderSelected.additionalInfo && showDetailPayment">
					<v-layout>
						<v-flex xs6 class="content-green">Paga con</v-flex>
						<v-flex xs5 class="c-text-green"
							>{{ symbolCurrency
							}}{{ orderSelected.additionalInfo.changeAmount || '---' }}</v-flex
						>
					</v-layout>
				</v-flex>
				<v-flex xs4 mb-2 body-1 v-if="orderSelected.additionalInfo && showDetailPayment">
					<v-layout>
						<v-flex xs6 class="content-green">Vuelto</v-flex>
						<v-flex xs5 class="c-text-green"
							>{{ symbolCurrency
							}}{{
								orderSelected.additionalInfo.changeAmount
									? orderSelected.additionalInfo.changeAmount - orderSelected.total
									: '---'
							}}</v-flex
						>
					</v-layout>
				</v-flex>
				<v-flex xs4 mb-2 body-1>
					<v-layout>
						<v-flex xs8 class="content-green">Costo de Env.</v-flex>
						<v-flex xs4 class="c-text-green"
							>{{ symbolCurrency }}{{ orderSelected.costShipping | round }}</v-flex
						>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1 v-if="orderSelected.additionalInfo">
					<v-layout v-if="orderSelected.additionalInfo.customerComment">
						<v-flex xs4 class="content-green">Comentario: </v-flex>
						<v-flex xs8 class="c-text-green">{{
							orderSelected.additionalInfo.customerComment
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 title-details-table">Productos: </span>
				</v-flex>
				<v-flex xs12>
					<ecommerce-details-products-list
						:is-edit-product="isEditProduct"
						:rows="orderSelected.details"
						:modal="modal"
					/>
				</v-flex>
				<v-flex
					xs12
					class="mt-2"
					body-1
					v-if="
						isEditProduct &&
						orderSelected.details.some((d) =>
							d.product ? d.product.flagWeighable || false : false
						)
					"
				>
					<v-btn
						color="primary"
						class="btn-action btn-auto px-2 py-1"
						@click="updateQuantityOrder"
					>
						Actualizar cantidades
					</v-btn>
				</v-flex>
				<v-flex
					xs6
					mb-2
					mt-1
					body-1
					v-if="
						orderSelected.additionalInfo ? orderSelected.additionalInfo.photos : false
					"
				>
					<span class="body-2 title-details-table">Fotos: </span>
				</v-flex>
				<v-flex
					xs12
					v-if="
						orderSelected.additionalInfo ? orderSelected.additionalInfo.photos : false
					"
				>
					<content-images measure="120" :images="orderSelected.additionalInfo.photos" />
				</v-flex>
			</v-layout>
		</div>
		<print-order-warehouse
			id-print="print-order-warehouse-modal"
			:print-info="printInfo"
			:order="orderSelected"
			:address-print="getAddressPrint"
		/>
	</div>
</template>

<script>
import ecommerceDetailsProductsList from '@/components/ecommerce/ecommerce-details-products-list';
import lib from '@/shared/lib';
import contentImages from '@/components/shared/content-images';
import printOrderWarehouse from '@/components/orders/print-order-warehouse';

function getAddress() {
	if (this.orderSelected.flagPickUp) {
		return (
			this.getFullDeliveryAddress() ||
			(this.orderSelected.trackingInformation &&
				this.orderSelected.trackingInformation.address)
		);
	}
	const addressLine1 = lib.getDeeper(
		'deliveryAddress',
		'addressLine1'
	)(this.orderSelected);
	const address = lib.getDeeper('deliveryAddress', 'address')(this.orderSelected);
	return addressLine1 || address;
}

function getFullDeliveryAddress() {
	const street = lib.getDeeper('deliveryAddress', 'addressLine1')(this.orderSelected);
	const departmentName = lib.getDeeper(
		'deliveryAddress',
		'province',
		'name'
	)(this.orderSelected);
	const provinceName = lib.getDeeper(
		'deliveryAddress',
		'parish',
		'name'
	)(this.orderSelected);
	const districtName = lib.getDeeper(
		'deliveryAddress',
		'city',
		'name'
	)(this.orderSelected);
	const reference = lib.getDeeper('deliveryAddress', 'reference')(this.orderSelected);
	let num = lib.getDeeper('deliveryAddress', 'number')(this.orderSelected);
	num = num ? `#${num}` : num;
	const consolidation = [
		(street || '').toUpperCase(),
		num,
		(reference || '').toUpperCase(),
		(departmentName || '').toUpperCase(),
		(provinceName || '').toUpperCase(),
		(districtName || '').toUpperCase(),
	];
	const filterConsolidation = consolidation.reduce((acc, c) => {
		if (c) {
			return acc ? `${acc}, ${c}` : c;
		}
		return acc;
	}, '');
	return filterConsolidation;
}

function closeDetails() {
	this.$emit('close-details', this.orderSelected);
}

function captionDocuments() {
	return this.isPeru ? 'Nº de DNI' : 'Nº de Cédula';
}

function dataBill() {
	const { customer, flagBill, dataBill: dataBillF, addressLine } = this.orderSelected;
	if (flagBill === 1) {
		// Tomar la info del data billin
		return {
			typeDocument: dataBillF.typeDocument === 'FAC' ? 'FAC - Factura' : 'BOL - Boleta',
			labelDocument: 'Razón social',
			labelDocumentNumber: 'RUC',
			documentNumber: dataBillF.ruc,
			fullName: dataBillF.rzSocial,
			customer,
			address: addressLine,
		};
	} else if (flagBill === 0) {
		// La data sale del customer pero el tipo de documento de additionaInfo
		const { fullName, documentName, documentNumber } =
			this.orderSelected.customer.typePerson;
		const { additionalInfo = {} } = this.orderSelected;
		const { typeDocumentCode, typeDocumentName } = additionalInfo;
		const typeDocument =
			typeDocumentCode && typeDocumentName
				? `${typeDocumentCode} - ${typeDocumentName}`
				: 'No especificado';
		return {
			typeDocument,
			labelDocument: 'Nombre',
			labelDocumentNumber: documentName,
			documentNumber,
			fullName,
			customer,
			address: addressLine,
		};
	}
	const { customerBill } = this.orderSelected;
	// const dataBillF = this.orderSelected.dataBill;
	const typePersonCurrent = {
		labelDocument: 'Razón Social',
		labelDocumentNumber: 'RUC',
	};
	const typePersonValue = customerBill ? customerBill.typePerson : {};
	const isRuc = typePersonValue.documentName === 'RUC';
	return {
		labelDocument:
			this.isPeru || isRuc || !typePersonValue.fullName
				? typePersonCurrent.labelDocument
				: 'Nombres y Apellidos',
		labelDocumentNumber:
			this.isPeru || !typePersonValue.documentNumber
				? typePersonCurrent.labelDocumentNumber
				: typePersonValue.documentName,
		documentNumber: dataBillF ? dataBillF.ruc : null,
		fullName: dataBillF ? dataBillF.rzSocial : null,
		customer,
		address: addressLine,
	};
}

function labelCommentary() {
	return this.isMibodega ? 'Bodeguero' : 'Responsable';
}

function symbolCurrency() {
	return this.orderSelected.currency === 'PEN' ? 'S/.' : '$';
}

function showDetailPayment() {
	let show = false;
	console.log('orderSelected => ', this.orderSelected);
	if (this.orderSelected.wayPayment) {
		if (this.orderSelected.wayPayment.code === 'PPR') {
			show = this.orderSelected.wayPaymentDetailCode
				? this.orderSelected.wayPaymentDetailCode === 'EFECTIVO'
				: true;
		}
	}
	return show;
}

function formatDateForPrint(dateString) {
	if (!dateString) return '---';
	const date = new Date(dateString);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
}

function formatCurrency(amount) {
	if (amount === null || amount === undefined) return '0.00';
	return parseFloat(amount).toFixed(2);
}

function getAddressPrint() {
	if (this.orderSelected.flagPickUp) {
		return this.getFullDeliveryAddress() || '-';
	}
	return this.orderSelected.deliveryAddress
		? this.orderSelected.deliveryAddress.addressLine1 || '-'
		: '-';
}

function printOrderWarehouseModal() {
	this.$nextTick(() => {
		const originalPrintArea = document.getElementById('print-order-warehouse-modal');
		if (!originalPrintArea) return;
		const printArea = originalPrintArea.cloneNode(true);
		printArea.removeAttribute('id');
		printArea.style.display = 'block';
		printArea.style.position = 'absolute';
		printArea.style.left = '-9999px';
		printArea.style.top = '0';
		document.body.appendChild(printArea);
		document.body.classList.add('printing-mode');
		setTimeout(() => {
			window.print();
			setTimeout(() => {
				document.body.classList.remove('printing-mode');
				if (printArea.parentNode) {
					printArea.parentNode.removeChild(printArea);
				}
			}, 100);
		}, 100);
	});
}

async function fetchLocations() {
	if (!this.$httpProducts || !this.orderSelected || !this.orderSelected.details) return;
	const fetchPromises = this.orderSelected.details.map(async (item) => {
		const code = item.productCode || item.code;
		if (!code) return;
		try {
			const { data: res } = await this.$httpProducts.get('products', { params: { search: code, limit: 10 } });
			const productsArray = Array.isArray(res) ? res : (res && res.data);
			if (productsArray && productsArray.length > 0) {
				const prod = productsArray.find(p => 
					p.code === code || 
					p.productCode === code || 
					(p.product && p.product.code === code) ||
					(p.alternateCode && p.alternateCode.includes(code))
				);
				if (prod && prod.location) {
					this.$set(item, 'fetchedLocation', prod.location);
				}
			}
		} catch (e) {
			console.warn(`Could not fetch location for ${code}`, e);
		}
	});
	await Promise.all(fetchPromises);
}

export default {
	name: 'ecommerce-details-in-table',
	components: {
		ecommerceDetailsProductsList,
		contentImages,
		printOrderWarehouse,
	},
	data() {
		return {
			viewRespon: false,
			showQuotation: false,
		};
	},
	watch: {
		orderSelected: {
			immediate: true,
			deep: true,
			handler(newVal) {
				if (newVal && newVal.details) {
					this.fetchLocations();
				}
			}
		}
	},
	computed: {
		dataBill,
		getAddress,
		getAddressPrint,
		captionDocuments,
		labelCommentary,
		symbolCurrency,
		showDetailPayment,
		printInfo() {
			const subsidiary = (this.$userInfo && this.$userInfo.subsidiary) || {};
			const company = (this.$userInfo && this.$userInfo.company) || {};
			return {
				logo: subsidiary.urlLogo || company.logo || null,
				name: subsidiary.rzSocial || company.companyRzSocial || '---',
				desc: subsidiary.sucursalName || company.companyName || '',
				address: subsidiary.address || company.address || '',
				phone: subsidiary.phone || company.phone || '',
				email: subsidiary.email || company.email || '',
				contact: subsidiary.contactName ? `${subsidiary.contactName} ${subsidiary.contactLastname || ''}`.trim() : '',
				ruc: subsidiary.ruc || company.ruc || company.documentNumber || '---'
			};
		},
		isEditProduct() {
			const { orderStateName, orderState, flagSale } = this.orderSelected;
			if (this.$route.name === 'pending-orders-list') {
				return orderState.name === 'Confirmado' && !flagSale;
			} else if (this.$route.name === 'detail-route-distribution') {
				return orderState.name === 'Asignado' && !flagSale;
			}
			return orderStateName === 'Confirmado' && !flagSale;
		},
		existPayment() {
			return (
				this.orderSelected.additionalInfo && this.orderSelected.additionalInfo.paymentType
			);
		},
		isDebts() {
			const { customer } = this.orderSelected;
			if (!customer) return false;
			else if (Object.keys(customer.debtsSales).length !== 0) {
				const debts = Object.values(customer.debtsSales).every((amount) => amount === 0);
				return !debts;
			}
			return false;
		},
	},
	methods: {
		closeDetails,
		getFullDeliveryAddress,
		fetchLocations,
		onQuote() {
			this.showQuotation = !this.showQuotation;
		},
		isDebt(row) {
			const isCusDebt = Object.keys(row.customer.debtsSales).length === 0;
			return !isCusDebt;
		},
		formatDateForPrint,
		formatCurrency,
		printOrderWarehouseModal,
		async updateQuantityOrder() {
			try {
				const body = {
					details: this.orderSelected.details.map((detail) => ({
						id: detail.id,
						productId: detail.productId,
						quantity: detail.quantity,
					})),
				};
				await this.$httpSales.patch(`update-details/${this.orderSelected.id}`, body);
				this.showNotification('Se actualizaron las cantidades correctamente');
				this.$emit('close-details', {});
				this.$emit('load-data');
			} catch (error) {
				if (error && error.data && error.data.messageError) {
					this.showGenericError(error.data.messageError);
				} else this.showGenericError();
			}
		},
	},
	props: {
		orderSelected: {
			default: () => {},
			type: Object,
		},
		modal: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.min-height {
	border-bottom-right-radius: 10px;
	// min-height: calc(100vh - 450px);
	position: relative;
}

.bottom {
	bottom: 10%;
	left: 0;
	position: absolute;
	right: 0;
}

.detail-in-table {
	padding-right: 44px;
	position: sticky;
	// top: 100px;
}

.block {
	display: block;
}

.title-details-table {
	color: map-get($colors, blue-card);
	font-family: map-get($fonts, open-bold);
}

.total-order {
	font-family: font(open-bold);
	font-size: map-get($sizes, medium20);
}

.gray-detail-table {
	color: map-get($colors, paginationText);
}

.content-details-table {
	display: flex;
	justify-content: space-between;
	width: 80%;
}

.detail-close-button {
	background-color: transparent;
	margin-right: 15px;
	position: absolute;
	right: 0;
	top: 0;
}

.content-green {
	background: map-get($colors, title-green);
	color: map-get($colors, background-sidebar);
	font-weight: 700;
	padding: 4px 12px;
}

.c-text-green {
	background: map-get($colors, text-green);
	color: map-get($colors, paginationText);
	padding: 4px 12px;
}

.border-l {
	border-left: 1px solid map-get($colors, white);
}

.bold {
	font-family: font(open-bold);
}

.text-center {
	text-align: center;
	font-size: 13px;
}
</style>
