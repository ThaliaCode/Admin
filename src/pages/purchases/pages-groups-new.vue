<template>
	<div>
		<action-sidebar
			:title="title"
			:value="action.value"
			:width="action.width"
			@close-modal="close"
		>
			<groups-form
				:id="id"
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

	function close() {
		this.action.value = false;
		this.goTo('groups');
	}

	function title() {
		const module = 'Grupo';
		return this.id ? `Editar ${module}` : `Nuevo ${module}`;
	}

	async function save(model) {
		const method = this.id ? 'patch' : 'post';
		const url = this.id ? `group/${this.id}` : 'group';
		const message = this.id ? 'editado' : 'creado';
		try {
			await this.$httpSales[method](url, model);
			this.showNotification(`El grupo ha sido ${message} correctamente`);
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
		};
	}

	export default {
		name: 'groups-new',
		components: {
			actionSidebar,
			groupsForm,
		},
		computed: {
			title,
		},
		data,
		methods: {
			close,
			save,
		},
		props: {
			id: {
				type: [Number, String],
			},
			typeEntityId: {
				type: [Number, String],
			},
		},
	};
</script>
