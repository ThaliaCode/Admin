<template>
	<div>
		<action-sidebar
			:title="'Nuevo Grupo'"
			:value="action.value"
			:width="action.width"
			@close-modal="close"
		>
			<groups-form
				:type-entity-id="typeEntityId"
				@close="close"
				@save="save"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import groupsForm from '@/components/purchases/groups-form';
	import typeEntityId from '@/shared/type-entity';

	function close() {
		this.action.value = false;
		this.goTo('suppliers');
	}

	async function save(model) {
		try {
			await this.$httpSales.post('group', model);
			this.showNotification('El grupo ha sido creado correctamente');
			this.close();
		} catch (err) {
			if (err.status === 400) {
				if (err.data.message === 'GROUP_EXISTS') {
					this.showNotification('El código ingresado ya existe.',
						'error');
				}
			} else if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	function data() {
		return {
			action: {
				value: true,
				width: 404,
			},
			typeEntityId: typeEntityId.Supplier,
		};
	}

	export default {
		name: 'suppliers-group',
		components: {
			actionSidebar,
			groupsForm,
		},
		data,
		methods: {
			close,
			save,
		},
	};
</script>
