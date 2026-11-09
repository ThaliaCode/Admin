<template>
	<div>
		<v-layout wrap mt-3>
			<v-flex xs8 px-3>Mostrar Lista de Vendedores</v-flex>
			<v-flex xs4 px-3>
				<v-switch
					color="success"
					hide-details
					v-model="settings.assignEmployee"
				></v-switch>
			</v-flex>
			<v-flex 
				xs12 
				class="text-info" 
				mb-3
				px-3>Recuerda que al activar “Lista de vendedores” te permitirá asignar un vendedor a la nueva venta (móvil y web).</v-flex>
			<v-flex 
				xs12 
				pa-3 
				class="back-gray"
				v-if="settings.assignEmployee">
				<v-layout wrap>
					<v-flex xs12 mb-2>Tipos de Producto</v-flex>
					<v-flex xs6>
						<v-checkbox
							color="primary"
							v-model="settings.showByFinishedProduct"
							label="Producto terminado"
							hide-details
						></v-checkbox>
					</v-flex>
					<v-flex xs6>
						<v-checkbox
							color="primary"
							v-model="settings.showByServiceProduct"
							label="Servicio "
							hide-details
						></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="saveData"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	if (this.warehouse.settings) {
		this.settings = { ...this.warehouse.settings };
	}
}

async function saveData() {
	const body = {
		settings: { ...this.settings },
	};
	try {
		await this.$httpProducts.patch(`warehouses/${this.warehouse.id}`, body);
		this.showNotification('Se configuró correctamente.');
		this.$emit('close');
	} catch (error) {
		this.showGenericError();
	}
}

function data() {
	return {
		settings: {
			assignEmployee: false,
			showByFinishedProduct: false,
			showByServiceProduct: false,
		},
	};
}

export default {
	name: 'warehouse-settings',
	data,
	created,
	components: {
		modalSidebarButton,
	},
	methods: {
		saveData,
	},
	props: {
		warehouse: {
			type: Object,
			default: () => {},
		},
	},
};
</script>

<style lang="scss" scoped>
	.text-info {
		color: map-get($colors, accent);
		font-size: 11px;
	}
	
	.back-gray {
		background: map-get($colors, background-gray);
	}
</style> 