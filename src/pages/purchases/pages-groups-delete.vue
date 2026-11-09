<template>
	<div>
		<action-sidebar
			title="Eliminar Grupo"
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
		this.goTo('groups');
	}

	async function deleteRegister() {
		try {
			await this.$httpSales.delete(`group/${this.id}`);
			this.showNotification(`El grupo "${this.name}" ha sido eliminado correctamente.`);
			this.close();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	export default {
		name: 'groups-delete',
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
