<template>
	<div>
		<header-page
			:limit-title="90"
			to-show
			:show-clean="false"
			:show-excel="false"
			:title="`${this.$route.meta.title}-#${header.number} - ${
				header.commerceName || '---'
			}`"
		>
			<v-flex text-xs-right xs2>
				Total: <span class="value-info">{{ header.totalOrder }}</span>
			</v-flex>
			<div class="ml-3" v-if="header.documentNumberRelate">
				<v-layout column>
					<v-flex class="primary--text detail-title-row">
						Venta Rel.:
					</v-flex>
					<v-flex>
						<router-link
							:to="{
								name: 'convert',
								params: { id: header.salDocumentId },
							}"
							target="_blank"
						>
							{{ header.documentNumberRelate }}
						</router-link>
					</v-flex>
				</v-layout>
			</div>
		</header-page>
		<v-layout row wrap align-center px-3 pt-3>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						E. Pedido:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ header.orderStateName }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2>
				<v-layout row align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Fecha:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ header.createdAt | formatDate }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Responsable:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ header.clientName }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Nº DNI:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ header.documentClient }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Teléfono.:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ header.phoneClient }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<app-table
			:columns="columns"
			:rows="rows"
			:items-quantity="rows.length"
			class="is-not-selectable mt-3 mb-1"
			:input-search="false"
			:last-page="lastPage"
			:current-page="currentPage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.productCode }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.productName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.quantity }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.unitName }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.salePrice }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.discountPercentage }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.total }}</td>
			</template>
		</app-table>
		<v-layout row wrap px-4 py-1>
			<v-flex xs12 class="totales-section d-flex text-xs-center">
				<v-flex>
					<span>Desc.: </span>
					<span>{{ priceAmounts.discount | round }}</span>
				</v-flex>
				<v-flex>
					<span>{{ getTaxByCountry($userInfo) }}: </span>
					<span>{{ priceAmounts.taxAmount | round }}</span>
				</v-flex>
				<v-flex>
					<span>SubT.: </span>
					<span>{{ priceAmounts.subtotal | round }}</span>
				</v-flex>
				<v-flex>
					<span>Total: </span>
					<span>{{ header.totalOrder | round }}</span>
				</v-flex>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer hide-and-print">
			<v-layout wrap justify-center py-1>
				<v-flex xs1 mr-2>
					<v-btn
						class="btn-action back-to"
						color="info"
						type="button"
						@click.native="goTo('orders')"
					>
						Ir al Listado
					</v-btn>
				</v-flex>
				<v-flex xs1 ml-3>
					<v-btn
						class="btn-action back-to"
						color="primary"
						type="button"
						@click.native="goTo('create-order')"
					>
						Nuevo Pedido
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
		<print-order-warehouse
			id-print="print-order-warehouse"
			:print-info="printInfo"
			:header="header"
			:rows="rows"
		/>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import PrintOrderWarehouseComponent from '@/components/orders/print-order-warehouse';
// import lib from '@/shared/lib';

// const { round } = lib;
// const fourDecimals = round(4);

function created() {
	this.idOrder = this.$route.params.orderId;
	this.loadInformationOrder();
}

async function loadInformationOrder() {
	try {
		const response = await this.$httpSales.get(`orders/${this.idOrder}`);
		const {
			details,
			number,
			createdAt,
			wayPayment,
			commerce,
			responsiblePickUp,
			total,
			orderState,
			employee,
			customerAddress,
			deliveryAddress,
			additionalInfo,
			documentNumberRelate,
		} = response.data;
		const detail = details.map((item) => {
			const newR = { ...item };
			newR.subtotal = item.total - item.taxAmount;
			return newR;
		});
		this.priceAmounts = this.getAmounts(detail);
		this.rows = detail;
		const addr = customerAddress || deliveryAddress || {};
		this.header = {
			number,
			documentClient: responsiblePickUp ? responsiblePickUp.dni : '',
			phoneClient: responsiblePickUp ? responsiblePickUp.phone : '',
			email: (responsiblePickUp && responsiblePickUp.email) || '',
			orderStateName: orderState ? orderState.name : '',
			paymentMethod: wayPayment ? wayPayment.name : null,
			createdAt,
			commerceName: commerce ? commerce.name : '---',
			clientName: responsiblePickUp ? responsiblePickUp.name : '',
			totalOrder: total,
			employeeName: employee ? employee.fullname : '',
			address: (addr.addressLine1 || addr.address || ''),
			department: addr.province ? addr.province.name : '',
			province: addr.city ? addr.city.name : '',
			district: addr.parish ? addr.parish.name : '',
			salDocumentId: additionalInfo?.salDocumentId || null,
			documentNumberRelate: documentNumberRelate || null,
		};
	} catch (error) {
		this.showGenericError();
	}
}

function getAmounts(details) {
	const totals = details.reduce(
		(acc, item) => {
			acc.taxAmount += item.taxAmount;
			acc.discount += item.discount;
			acc.subtotal += item.subtotalWithoutTax;
			acc.total += item.total;
			return acc;
		},
		{ taxAmount: 0, discount: 0, subtotal: 0, total: 0 }
	);
	return totals;
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

function printOrderWarehouse() {
	this.$nextTick(() => {
		const originalPrintArea = document.getElementById('print-order-warehouse');
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

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 3,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Stock', value: 'stock', visible: true, checked: true },
			{ id: 6, name: 'Unidad', value: 'stock', visible: true, checked: true },
			{ id: 7, name: 'Precio', value: 'sale', visible: true, checked: true },
			{
				id: 8,
				name: 'Descuento %',
				value: 'discount',
				visible: true,
				checked: true,
			},
			{ id: 9, name: 'Total', value: 'total', visible: true, checked: true },
		],
		currentPage: 1,
		header: {},
		lastPage: 0,
		rows: [],
		priceAmounts: {
			taxAmount: 0,
			discount: 0,
			subtotal: 0,
			total: 0,
		},
	};
}

export default {
	name: 'page-detail-order',
	created,
	data,
	components: {
		appTable,
		headerPage,
		'print-order-warehouse': PrintOrderWarehouseComponent,
	},
	computed: {
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
	},
	methods: {
		loadInformationOrder,
		getAmounts,
		getTaxByCountry(user) {
			return user.company && user.company.country
				? user.company.country.taxName
				: null;
		},
		formatDateForPrint,
		formatCurrency,
		printOrderWarehouse,
	},
};
</script>
