<template>
	<div>
		<v-layout wrap align-center pa-4 body-1>
			<v-flex>
				<v-text-field
					top
					single-line
					multi-line
					type="text"
					no-resize
					label="Observación"
					class="textarea-content filter-select mt-3"
					v-model="transfers.observation"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="close"
				@accept-button-clicked="importRegisters"
			/>
		</section>	
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

function close() {
	this.$emit('close-modal');
	this.clear();
}

async function importRegisters() {
	this.disabled = true;
	const body = { comment: this.transfers.observation };
	try {
		await this.$httpProducts.patch(`transfers/${this.id}/cancel`, body);
		this.showNotification('La acción se realizó correctamente.');
		helper.removeLocalData('list-transfer');
		this.$emit('close-modal');
	} catch (error) {
		this.showGenericError();
		this.disabled = false;
	}
}

function clear() {
	this.transfers.observation = '';
}

function data() {
	return {
		transfers: {
			observation: '',
		},
		disabled: false,
	};
}

export default {
	name: 'modal-transfers',
	data,
	methods: {
		close,
		clear,
		importRegisters,
	},
	components: {
		modalSidebarButton,
	},
	props: {
		id: [Number, String],
	},
};
</script>
