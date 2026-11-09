<template>
	<v-dialog v-model="internalShow" persistent max-width="900px">
		<modal-items 
			title="Envío rápido de mercadería" 
			v-if="internalShow" 
			name-action="Confirmar" 
			@close-modal="close"
			@action-modal="acceptAction" 
			show-slot>
			<div class="px-3 pt-4 pb-4 text-modal">
				<div class="mb-4 text-xs-left">
					<div style="display: inline-block; border: 1px solid #e0e0e0; border-radius: 6px; padding: 8px 16px; font-weight: bold; font-size: 14px; background-color: #ffffff; color: #424242;">
						{{ consolidationData.warehouse.name }}
					</div>
				</div>

				<v-data-table
					:headers="headers"
					:items="filteredItems"
					hide-actions
					class="elevation-1 tabla-consolidado"
				>
					<template slot="items" slot-scope="props">
						<td>{{ props.item.codeProduct }}</td>
						<td>{{ props.item.nameProduct }}</td>
						<td class="text-xs-center">{{ props.item.stock }}</td>
						<td class="text-xs-center">{{ props.item.quantityTheoretical }}</td>
                        <td class="text-xs-center">{{ Number(props.item.price || 0).toFixed(2) }}</td>
                        <td class="text-xs-center">{{ (Number(props.item.price || 0) * Number(props.item.quantityTheoretical || 0)).toFixed(2)}}</td>
					</template>
				</v-data-table>

			</div>
		</modal-items>
	</v-dialog>
</template>

<script>
import modalItems from '@/components/shared/modal-items';
import helper from '@/shared/helper';

export default {
	name: 'modal-resumen-consolidated',
	components: {
		modalItems,
	},
	props: {
		value: {
			type: Boolean,
			default: false,
		},
		items: {
			type: Array,
			default: () => [],
		},
		consolidationData: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			headers: [
				{ text: 'CÓDIGO', value: 'codeProduct', sortable: false, align: 'left' },
				{ text: 'PRODUCTO', value: 'nameProduct', sortable: false, align: 'left' },
				{ text: 'STOCK ACTUAL ALMACÉN', value: 'stock', sortable: false, align: 'center' },
				{ text: 'CANTIDAD A ENVIAR', value: 'quantityTheoretical', sortable: false, align: 'center' },
                { text: 'P. VENTA UNITARIO', value: 'price', sortable: false, align: 'center' },
                { text: 'PRECIO VENTA TOTAL', value: 'totalPrice', sortable: false, align: 'center' }
			]
		};
	},

	computed: {
		internalShow: {
			get() {
				return this.value;
			},
			set(val) {
				this.$emit('input', val); 
			},
		},
		filteredItems() {
			return this.items.filter(item => Number(item.quantityTheoretical) > 0);
		}
	},
	methods: {
		close() {
			this.internalShow = false;
		},
		async acceptAction() {
			try {
				const kardexItems = this.filteredItems.map(producto => ({
					warehouseId: this.consolidationData.warehouse.id,
					brandId: producto.brandId,
					productId: producto.productId,
					quantity: Number(producto.quantityTheoretical),
					priceCost: Number(producto.priceCost || 0),

				}));
				const newDate = new Date();
				const hours = String(newDate.getHours()).padStart(2, '0');
				const minutes = String(newDate.getMinutes()).padStart(2, '0');
				const seconds = String(newDate.getSeconds()).padStart(2, '0');
				const payloadParaBackend = {
					dateOnline: newDate.getTime().toString(),
					isConsolidation: true,
					typeOperation: 1,
					documentTypeId: 0,
					description: 'Transferencia rapida consolidada',
					createdAt: helper.exactDate(`${this.$today()}T${hours}:${minutes}:${seconds}`, 'YYYY-MM-DD HH:mm:ss'),
					kardex: kardexItems
				};

				this.internalShow = false;
				this.$emit('on-processing');
				const response = await this.$httpProducts.post('kardex/movements', payloadParaBackend);

				if (response) {
					this.$emit('on-accept'); 
				}
			} catch (error) {
				this.$emit('on-error');
				console.error('El backend rechazó los datos:', error);
				if (error.data && error.data.messageError) {
					this.showGenericError(error.data.messageError);
				} else {
					this.showGenericError('Ocurrió un error al intentar agregar el stock.');
				}
			}
		},
	},
};
</script>
<style scoped>
::v-deep .modal-items-title {
    background-color: #49979B !important;
    color: #ffffff !important;
    text-transform: none !important; 
    font-size: 18px !important;
    font-weight: bold !important;
}
::v-deep .modal-items-title button i,
::v-deep .modal-items-title button .v-icon.v-icon,
::v-deep .modal-items-title button * {
    color: #ffffff !important;
    fill: #ffffff !important;
}
::v-deep .modal-items-action {
    background-color: #ffffff !important;
    border-top: none !important;
}
::v-deep .modal-items-btn--cancel {
    background-color: #E63938 !important;
    border: 1px solid #E63938 !important;
    color: #ffffff !important;
    border-radius: 8px !important;
    padding: 8px 24px !important;
    font-weight: bold !important;
}
::v-deep .modal-items-btn {
    background-color: #49979B !important;
    border: 1px solid #49979B !important;
    color: #ffffff !important;
    border-radius: 8px !important;
    padding: 8px 24px !important;
    font-weight: bold !important;
    display: inline-flex;
    align-items: center;
}
::v-deep .elevation-1.tabla-consolidado {
    box-shadow: none !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    overflow: hidden !important; 
}
::v-deep .v-table thead {
    background-color: #49979B !important; 
}
::v-deep .v-table thead th {
    color: #ffffff !important;
    font-weight: bold !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
}
::v-deep .v-table tbody td {
    font-size: 13px !important;
    color: #424242 !important;
}
</style>
