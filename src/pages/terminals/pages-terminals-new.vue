<template>
	<div>
		<action-sidebar
			:title="title"
			:value="true"
			:width="600"
			@close-modal="close"
		>
			<terminals-form
				:id="id"
				@close="close"
				@save="save"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import terminalsForm from '@/components/terminals/terminals-form';

	function close() {
		this.goTo('terminals');
	}

	function title() {
		const module = this.labelTerminal();
		return this.id ? `Editar ${module}` : `Nueva ${module}`;
	}

	async function save(model, isEdit) {
		const newModel = { ...model };
		const method = this.id ? 'patch' : 'post';
		const url = this.id ? `terminals/${this.id}` : 'terminals';
		const message = this.id ? 'editada' : 'creada';
		if (isEdit) {
			delete newModel.comSubsidiariesId;
			delete newModel.warWarehousesId;
		}
		try {
			await this.$httpSales[method](url, newModel);
			const initial = this.isPeru ? 'La terminal' : 'El punto de venta';
			this.showNotification(`${initial} ha sido ${message} correctamente.`);
			this.close();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	export default {
		name: 'terminals-new',
		components: {
			actionSidebar,
			terminalsForm,
		},
		computed: {
			title,
		},
		methods: {
			close,
			save,
		},
		props: {
			id: {
				type: [Number, String],
			},
		},
	};
</script>
