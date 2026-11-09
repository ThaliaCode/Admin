<template>
	<div>
		<action-sidebar
			title="Eliminar Proveedor"
			:value="true"
			@close-modal="close"
		>
			<form-delete
				:name="name"
				@cancel="close"
				@delete-register="deleteRegister"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import formDelete from '@/components/shared/form-delete';

	function close() {
		this.goTo('suppliers');
	}

	async function deleteRegister() {
		try {
			await this.$httpSales.delete(`suppliers/${this.id}`);
			this.showNotification(`El proveedor "${this.name}" ha sido eliminado correctamente.`);
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'PURCHASE_RELATED_EXISTS') {
					this.showNotification('El proveedor no puede ser eliminado por contar con compras realizadas.',
						'error');
				}
			}
		} finally {
			this.close();
		}
	}

	export default {
		name: 'suppliers-delete',
		components: {
			actionSidebar,
			formDelete,
		},
		methods: {
			close,
			deleteRegister,
		},
		props: {
			id: {
				type: [Number, String],
			},
			name: {
				type: String,
			},
		},
	};
</script>
