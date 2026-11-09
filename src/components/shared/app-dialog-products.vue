<template>
  <div>
    <v-dialog
			v-model="showDialog"
			persistent
			max-width="450"
		>
			<modal-items
				v-if="showDialog"
				:title="titleDialog"
				name-action="Cerrar"
				show-slot
				:show-regular="false"
				@close-modal="$emit('close-modal')"
				>
				<v-flex class="pt-2 px-4 ">
					<label class="error--text bold">{{ textDialog }} </label>
				</v-flex>
				<div class="pa-4" v-for="(row, index) in products" :key="index" v-if="products">
					<label class="caption">Producto: {{ row.name }} , Codigo: {{ row.code }}, Unidad: {{row.unitName}}</label>
				</div>
			</modal-items>
		</v-dialog>
  </div>
</template>

<script>
import modalItems from '@/components/shared/modal-items';

export default {
	name: 'app-dialog-products',
	components: {
		modalItems,
	},
	props: {
		products: {
			type: Array,
			default: () => [],
		},
		showDialog: {
			type: Boolean,
			default: false,
		},
		textDialog: {
			type: String,
			default: '',
		},
		titleDialog: {
			type: String,
			default: '',
		},
	},
};
</script>