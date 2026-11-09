<template>
	<div>
		<action-sidebar
			:title="title"
			:value="true"
			:width="552"
			@close-modal="close"
		>
			<suppliers-form
				:id="id"
				@close="close"
				@save="save"
			/>
		</action-sidebar>
	</div>
</template>

<script>
	import actionSidebar from '@/components/shared/action-sidebar';
	import suppliersForm from '@/components/purchases/suppliers-form';

	function close() {
		this.goTo('suppliers');
	}

	function title() {
		const module = 'Proveedor';
		return this.id ? `Editar ${module}` : `Nuevo ${module}`;
	}

	async function save(model) {
		const method = this.id ? 'patch' : 'post';
		const url = this.id ? `suppliers/${this.id}` : 'suppliers';
		const message = this.id ? 'editado' : 'creado';
		try {
			await this.$httpSales[method](url, model);
			this.showNotification(`El proveedor ha sido ${message} correctamente.`);
			this.close();
		} catch (err) {
			if (err.status === 400) {
				if (err.data.message === 'DOCUMENT_NUMBER_EXISTS') {
					this.showNotification('El número de documento ingresado ya existe. Es probable que el proveedor que intenta registrar ya exista.',
						'error');
				} else if (err.data.message === 'PAYMENT_METHOD_NOT_EXIST') {
					this.showNotification('La forma de pago seleccionada no se encuentra registrada.',
						'error');
				} else if (err.data.message === 'SUPPLIER_TYPE_NOT_EXIST') {
					this.showNotification('El tipo de proveedor seleccionado no se encuentra registrado.',
						'error');
				} else if (err.data.message === 'TYPE_EXPENSE_NOT_EXIST') {
					this.showNotification('El origen seleccionado no se encuentra registrado.',
						'error');
				} else if (err.data.message === 'AUTO_CODE_SUPPLIER_NOT_EXIST') {
					this.showNotification('El código autogenerado de proveedor no ha sido configurado.',
						'error');
				} else if (err.data.message === 'PARISH_NOT_EXIST') {
					this.showGenericError('La parroquia seleccionada no existe.');
				} else if (err.data.message === 'CITY_NOT_EXIST') {
					this.showGenericError('La ciudad seleccionada no existe.');
				} else if (err.data.message === 'PROVINCE_NOT_EXIST') {
					this.showGenericError('La provincia seleccionada no existe.');
				}
			} else if (err.status === 500) {
				this.showGenericError();
			}
		}
	}

	export default {
		name: 'suppliers-new',
		components: {
			actionSidebar,
			suppliersForm,
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
