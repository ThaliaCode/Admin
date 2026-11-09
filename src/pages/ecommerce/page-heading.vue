<template>
    <div>
       <header-page
				name="heading"
        title="Rubro"
       />
			 <app-actions
			 	:resource-uri="$route.name"
				@run-action="runAction"
			 />
       <div class="px-5 pt-5">
        <app-table
					name="heading-table"
					class="is-not-selectable"
					:columns="columns"
					:rows="rows"
					:current-page="currentPage"
					:last-page="lastPage"
					:input-search="false"
					@on-page="changePage"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.order }}</td>
						<td v-show="showRow(columns, 2)" class="is-not-selectable">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 3)" class="pd-10">
							<img
							v-if="props.row.additionalInformation.icon"
							:src="props.row.additionalInformation.icon" class="image">
						<td v-show="showRow(columns, 4)" class="pd-10">
							<img
							v-if="props.row.additionalInformation.image"
							:src="props.row.additionalInformation.image" class="image"> 
						<td v-show="showRow(columns, 5)" class="px-4">
							<v-layout row align-center justify-center>
								<v-flex xs2>
									<v-tooltip top>
										<v-switch
											slot="activator"
											color="success"
											hide-details
											v-model="props.row.flagActive"
											@change="changeHeading(props.row)"
										></v-switch>
										<span>{{ props.row.flagActive ? 'Desactivar Rubro' : 'Activar Rubro' }}</span>
									</v-tooltip>
								</v-flex>
								<v-flex xs2>
									<app-tooltip-button
										color="success"
										icon="edit"
										text="Editar Rubro"
										@click-icon="editHeading(props.row)"
									/>
								</v-flex>
								<v-flex xs2>
									<app-tooltip-button
										color="error"
										icon="delete"
										text="Eliminar Rubro"
										@click-icon="openConfirmDelete(props.row)"
									/>
								</v-flex>
							</v-layout>
						</td>
					</template> 
				</app-table>
       		</div>
			 <action-sidebar
				:title="action.title"
				:width="action.width"
				:value="action.open"
				@close-modal="closeModal"
			 >
			 	<create-heading
				 	:disabled="disabledHeading"
					:model="modalCreate"
					@close-modal="closeModal"
					@save-form="saveForm"
					@set-data="setData"
				/>
			 </action-sidebar>
			 <v-dialog v-model="dialogHeading" persistent max-width="500px">
				<v-card>
					<v-card-title class="subheading">
							{{ dialogMessage }}
					</v-card-title>
					<v-card-actions class="justify-center">
						<v-btn
							class="btn-action"
							color="info"
							dark
							@click.native="closeDialog"
						>
							Cancelar
						</v-btn>
						<v-btn
							class="btn-action"
							color="error"
							dark
							@click.native="deleteHeading"
						>
							Eliminar
						</v-btn>
					</v-card-actions>
				</v-card>
			 </v-dialog>
    </div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import createHeading from '@/components/ecommerce/create-heading';

function created() {
	this.loadHeading();
}

async function loadHeading(page = 1) {
	this.params.page = page;
	try {
		const response = await this.$httpSales.get('items', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

async function deleteHeading() {
	try {
		await this.$httpSales.delete(`items-commerce/${this.idHeading}`);
		this.closeDialog();
		this.loadHeading();
	} catch (error) {
		this.showGenericError();
	}
}

function runAction(item) {
	this.action = {
		active: true,
		open: true,
		code: item.code,
		title: 'Crear Rubro',
		width: 440,
	};
}

function closeModal() {
	this.action.code = '';
	this.action.open = false;
	this.action.title = '';
	this.modalCreate = {
		image: null,
		icon: null,
		itemId: '',
		order: null,
	};
	this.idHeading = null;
	this.disabledHeading = false;
}

async function saveForm(model) {
	if (model.order !== null && model.order === '' && model.order < 1) {
		this.showNotification('El orden debe ser mayor a 0', 'info');
	} else {
		const body = {
			image: model.image,
			icon: model.icon || null,
			order: model.order ? Number(model.order) : null,
		};
		const urlPost = 'items-commerce';
		const urlPatch = `items-commerce/${this.idHeading}`;
		const url = this.idHeading ? urlPatch : urlPost;
		const message = this.idHeading ? 'actualizado' : 'creado';
		const method = this.idHeading ? 'patch' : 'post';
		if (method !== 'patch') {
			body.itemId = model.itemId;
		}
		try {
			await this.$httpSales[method](url, body);
			this.showNotification(`El rubro fue ${message} correctamente.`);
			this.closeModal();
			this.loadHeading();
		} catch (error) {
			if (error.status === 400) {
				if (error.data.message === 'ITEM_ALREADY_SET') {
					this.showGenericError('Usted ya tiene creado un rubro maestro.');
				}
			} else {
				this.showGenericError();
			}
		}
	}
}

function closeDialog() {
	this.dialogHeading = false;
	this.idHeading = null;
}

function openConfirmDelete({ id, name }) {
	this.idHeading = id;
	this.dialogHeading = true;
	this.dialogMessage = `¿Desea eliminar el rubro '${name}'?`;
}

function editHeading(row) {
	this.disabledHeading = true;
	this.action = {
		open: true,
		title: 'Editar Rubro',
		width: 440,
	};
	this.modalCreate = {
		image: row.additionalInformation ? row.additionalInformation.image : null,
		icon: row.additionalInformation ? row.additionalInformation.icon : null,
		itemId: row.id,
		order: row.order || null,
	};
	this.idHeading = row.id;
}

async function changeHeading(row) {
	const body = {
		flagActive: row.flagActive,
	};
	try {
		await this.$httpSales.patch(`items-commerce/${row.id}/active`, body);
		if (row.flagActive === 1) {
			this.showNotification('El rubro fue desactivado correctamente.');
		} else {
			this.showNotification('El rubro fue activado correctamente.');
		}
		this.loadHeading();
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadHeading(page);
}

function setData({ model, value }) {
	this.modalCreate[model] = value;
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		columns: [
			{
				id: 1,
				name: 'Orden',
				value: 'order',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Icono',
				value: 'icon',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Imagen',
				value: 'image',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Acciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		rows: [],
		currentPage: 1,
		dialogMessage: '',
		dialogHeading: false,
		idHeading: null,
		modalCreate: {
			image: null,
			icon: null,
			itemId: '',
			order: null,
		},
		lastPage: 0,
		disabledHeading: false,
		params: {
			page: null,
			type: 2,
		},
	};
}

export default {
	name: 'page-heading',
	created,
	data,
	components: {
		appActions,
		actionSidebar,
		appTable,
		createHeading,
		headerPage,
	},
	methods: {
		changeHeading,
		changePage,
		closeDialog,
		closeModal,
		deleteHeading,
		editHeading,
		loadHeading,
		saveForm,
		runAction,
		openConfirmDelete,
		setData,
	},
};
</script>

<style lang="scss" scoped>
.image {
  max-height: 20px;
	max-width: 70px;
}

.pd-10 {
	padding: 10px 5px !important;
}
</style>