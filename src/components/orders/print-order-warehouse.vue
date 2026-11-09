<template>
	<div :id="idPrint" class="print-area" style="display: none;">
		<div class="print-container">
			<div class="print-header-simple">
				<div class="header-left">
					<img v-if="printInfo.logo" :src="printInfo.logo" alt="Logo" class="logo-print" />
					<div class="company-info-simple">
						<p class="company-name-sm">{{ printInfo.name }}</p>
						<p class="company-desc-sm" v-if="printInfo.desc && printInfo.desc !== printInfo.name">{{ printInfo.desc }}</p>
					</div>
				</div>
				<div class="header-right-simple">
					<h2 class="title-note">NOTA DE PEDIDO N° {{ orderNumber }}</h2>
				</div>
			</div>
			<div class="print-info-simple">
				<div class="info-left-sm">
					<p><strong>Señor(es):</strong> {{ clientName }}</p>
					<p><strong>Dirección:</strong> {{ address }}</p>
					<p><strong>Ubicación:</strong> {{ department }} - {{ province }} - {{ district }}</p>
					<p><strong>Empleado:</strong> {{ employeeName }}</p>
				</div>
				<div class="info-right-sm">
					<p><strong>M. de pago:</strong> {{ paymentMethod }}</p>
					<p><strong>DNI/RUC:</strong> {{ documentClient }}</p>
					<p><strong>Fecha:</strong> {{ formattedDate }}</p>
				</div>
			</div>
			<table class="print-table-warehouse">
				<thead>
					<tr>
						<th style="width: 8%">ITEM</th>
						<th style="width: 15%">CODIGO</th>
						<th style="width: 37%">DESCRIPCIÓN</th>
						<th style="width: 15%">UBICACIÓN</th>
						<th style="width: 10%">CANT.</th>
						<th style="width: 15%">U.M.</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in detailRows" :key="index">
						<td class="text-center">{{ index + 1 }}</td>
						<td class="text-center">{{ item.productCode || item.code || '-' }}</td>
						<td class="text-left">{{ item.productName || item.name || '-' }}</td>
						<td class="text-center">{{ item.fetchedLocation || item.location || (item.product && item.product.location) || (item.additionalInformation && item.additionalInformation.location) || orderLocation || '-' }}</td>
						<td class="text-center">{{ item.quantity }}</td>
						<td class="text-center">{{ item.unitName || 'UNIDAD' }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
export default {
	name: 'print-order-warehouse',
	props: {
		idPrint: {
			type: String,
			required: true,
		},
		printInfo: {
			type: Object,
			default: () => ({}),
		},
		order: {
			type: Object,
			default: () => null,
		},
		addressPrint: {
			type: String,
			default: '',
		},
		header: {
			type: Object,
			default: () => null,
		},
		rows: {
			type: Array,
			default: () => [],
		},
	},
	computed: {
		orderNumber() {
			if (this.header) return this.header.number;
			if (this.order) return this.order.number;
			return '';
		},
		clientName() {
			if (this.header) return this.header.clientName || '---';
			if (this.order) {
				return this.order.responsiblePickUp
					? this.order.responsiblePickUp.name
					: (this.order.customerName || '---');
			}
			return '---';
		},
		address() {
			if (this.header) return this.header.address || '-';
			if (this.order) return this.addressPrint || '-';
			return '-';
		},
		department() {
			if (this.header) return this.header.department || '';
			if (this.order && this.order.customerAddress && this.order.customerAddress.province) {
				return this.order.customerAddress.province.name;
			}
			return '';
		},
		province() {
			if (this.header) return this.header.province || '';
			if (this.order && this.order.customerAddress && this.order.customerAddress.city) {
				return this.order.customerAddress.city.name;
			}
			return '';
		},
		district() {
			if (this.header) return this.header.district || '';
			if (this.order && this.order.customerAddress && this.order.customerAddress.parish) {
				return this.order.customerAddress.parish.name;
			}
			return '';
		},
		employeeName() {
			if (this.header) return this.header.employeeName || '---';
			if (this.order) return this.order.employee ? this.order.employee.fullname : '---';
			return '---';
		},
		paymentMethod() {
			if (this.header) return this.header.paymentMethod || 'CONTADO';
			if (this.order) return this.order.wayPayment ? this.order.wayPayment.name : 'CONTADO';
			return 'CONTADO';
		},
		documentClient() {
			if (this.header) return this.header.documentClient || '---';
			if (this.order) {
				return this.order.responsiblePickUp
					? this.order.responsiblePickUp.dni
					: (this.order.documentNumber || '---');
			}
			return '---';
		},
		formattedDate() {
			const dateString = this.header ? this.header.createdAt : (this.order ? this.order.createdAt : null);
			if (!dateString) return '---';
			const date = new Date(dateString);
			const day = String(date.getDate()).padStart(2, '0');
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const year = date.getFullYear();
			return `${day}-${month}-${year}`;
		},
		detailRows() {
			if (this.rows && this.rows.length > 0) return this.rows;
			if (this.order && this.order.details) return this.order.details;
			return [];
		},
		orderLocation() {
			if (this.order && this.order.additionalInfo && this.order.additionalInfo.location) {
				return this.order.additionalInfo.location;
			}
			return null;
		},
	},
};
</script>
