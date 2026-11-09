<template>
	<div class="new-unit">
		<v-layout row justify-center mt-5>
			<v-flex xs10>
				<v-text-field
					single-line
					label="Nueva Unidad de medida"
					class="filter-select"
					name="new-units-name"
					type="text"
					v-model="unit"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="feature-footer">
			<modal-sidebar-button
				:is-loading="!unit.length > 0"
				v-on:cancel-button-clicked="closeModal"
				v-on:accept-button-clicked="registerUnit"/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

	function clearInfo() {
		this.unit = '';
	}

	function closeModal() {
		this.clearInfo();
		this.$emit('cancel-modal', false);
	}

	async function registerUnit() {
		const body = {
			name: this.unit,
			flagActive: true,
		};
		try {
			await this.$httpProducts.post('units', body);
			this.$emit('update-units');
			this.clearInfo();
			this.closeModal();
		} catch (e) {
			this.showGenericError();
		}
	}

	function data() {
		return {
			unit: '',
		};
	}

	export default {
		name: 'new-units',
		components: {
			modalSidebarButton,
		},
		data,
		methods: {
			clearInfo,
			closeModal,
			registerUnit,
		},
	};
</script>

<style lang="scss" scoped>
</style>
