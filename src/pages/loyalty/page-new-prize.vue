<template>
	<div class="new-prize">
		<header-page
			name="new-prize"
			title="Nuevo Premio"
		/>
		<v-layout wrap class="main-form" pt-4 px-5>
			<v-flex xs12 md6 pr-5>
				<v-layout wrap>
					<v-flex xs12>
						<p class="title-form">Información</p>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-layout>
							<v-flex xs6 pr-2>
								<autocomplete-component
									append-icon="arrow_drop_down"
									clearable
									http-code="$httpProducts"
									:item="prize.categoryId"
									item-text="name"
									item-value="id"
									:items="categories"
									label-value="Categoría"
									model="categoryId"
									new-register-text="Nueva Categoría"
									:on-clean="cleanData"
									placeholder="Seleccionar"
									prop="name"
									resource-url="urldeCategoria"
									:return-object="false"
									select-create
									@new-register="openSlideModal('new-category', 'Crear Categoría')"
									@return-data="setData"
								></autocomplete-component>
							</v-flex>
							<v-flex xs6 pl-2>
								<app-input-text
									label="Nombre"
									model="name"
									:text="prize.name"
									@input="setData"
								></app-input-text>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-layout>
							<v-flex xs3>
								<label ref="up" for="upload-image">
									<vue-six-four
										id="upload-image"
										hidden
										@vue-six-four="getFile"
									/>
									<button
										class="product-image-container"
										:disabled="isLoadingImage"
										type="button"
										@click="actionUploadImage"
									>
										<template v-if="prize.urlImage">
											<img
												:src="prize.urlImage"
												class="product-image"
												alt="sube una imagen"
											/>
											<span class="product-image-hover">Cambiar foto</span>
											<button @click.stop="openDialogImagen" class="product-image-hover-delete">
												<v-icon color="white">clear</v-icon>
											</button>
										</template>
										<template v-else>
											<template v-if="isLoadingImage">
												<span class="product-image-loading">
													CARGANDO...
												</span>
											</template>
											<template v-else>
												<img
													src="/static/img/image-default.svg"
													height="40"
													alt="sube una imagen"
												/>
												<p class="product-image-title mb-0">SUBIR FOTO</p>
												<p class="product-image-size mb-0">HASTA 500KB</p>
											</template>
										</template>
									</button>
								</label>
							</v-flex>
							<v-flex xs9 ml-2>
								<v-layout wrap>
									<v-flex xs6 mb-3>
										<app-input-text
											label="Orden"
											model="order"
											:text="prize.order"
											@input="setData"
										></app-input-text>
									</v-flex>
									<v-flex xs12>
										<btn-add-item 
											title="Agregar"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs12 mb-3>
						<v-layout mb-2>
							<v-flex xs2>
								<span class="new-prize__label">Orden</span>
							</v-flex>
							<v-flex xs10>
								<span class="new-prize__label">Imagen</span>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs2 class="new-prize__content-text" text-xs-center>
								<span>1</span>
							</v-flex>
							<v-flex xs5 class="new-prize__content-text">
								<span>Nombre de imagen. jpg</span>
							</v-flex>
							<v-flex xs3>
								<v-layout>
									<v-flex xs4 text-xs-center>
										<app-tooltip-button
											color="yellowFav"
											icon="star"
											text="Favorito"
											:size="19"
										/>
									</v-flex>
									<v-flex xs4 text-xs-center>
										<v-switch
											color="success"
											hide-details
											v-model="flag"
										></v-switch>
									</v-flex>
									<v-flex xs4 text-xs-center>
										<app-tooltip-button
											color="primary"
											icon="pending"
											text="Acciones"
											:size="19"
										/>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs6 mb-3>
						<app-input-text
							label="Puntos"
							model="point"
							:text="prize.point"
							@input="setData"
						></app-input-text>
					</v-flex>
					<v-flex xs12>
						<p class="title-form mb-0">Fecha de Expiración</p>
					</v-flex>
					<v-flex xs12 mb-2>
						<v-radio-group
							colums
							v-model="selectOptionDate"
							hide-details
						>
							<v-radio
								class="mb-2"
								label="No Caduca"
								:value="1"
								color="primary"
							></v-radio>
							<v-radio
								label="Rango de Fecha"
								:value="2"
								color="primary"
							></v-radio>
						</v-radio-group>
					</v-flex>
					<v-flex v-if="selectOptionDate === 2" xs12 mb-2>
						<v-layout pl-4>
							<v-flex xs4 pr-2>
								<app-date-mask
									label="Fecha Inicio"
									v-model="startDate"
									@format-date="onDate($event, 'startDate')"
								></app-date-mask>
							</v-flex>
							<v-flex xs4 pl-2>
								<app-date-mask
									label="Fecha Final"
									v-model="endDate"
									@format-date="onDate($event, 'startDate')"
								></app-date-mask>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 md6 pl-5>
				<v-layout wrap>
					<v-flex xs12>
						<p class="title-form">Asociar Producto</p>
					</v-flex>
					<v-flex xs12 mb-3>
						<btn-add-item 
							title="Asociar tu Producto"
							@click-add="openSlideModal('associate-product', 'Asociar Producto')"
						/>
					</v-flex>
					<v-flex xs12>
						<p class="title-form">Asociar Grupo de Clientes</p>
					</v-flex>
					<v-flex xs12>
						<btn-add-item 
							title="Asociar Grupo de Clientes"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			@close-modal="cancelModal"
			v-model="action.open"
		>
			<new-category 
				v-if="action.code === 'new-category'"
				@close-modal="cancelModal"/>
			<associate-product
				v-if="action.code === 'associate-product'"
				@close-modal="cancelModal"/>	
		</action-sidebar>
	</div>
</template>
<script>
import btnAddItem from '@/components/shared/btn-add-item';
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';
import newCategory from '@/components/loyalty/new-category';
import actionSidebar from '@/components/shared/action-sidebar';
import associateProduct from '@/components/loyalty/associate-product';

function setData() {}

function getFile() {}

function openDialogImagen() {
	this.dialogImage = true;
}

function openSlideModal(code, title, width = 450) {
	this.action = {
		active: true,
		open: true,
		code,
		title,
		width,
	};
}

function cancelModal() {
	this.action = {
		active: false,
		open: false,
		code: '',
		title: '',
		width: 0,
	};
}

function data() {
	return {
		dialogImage: false,
		categories: [
			{
				id: 1,
				name: 'prueba',
			},
			{
				id: 0,
				name: 'new',
				btn: true,
			},
		],
		prize: {},
		selectOptionDate: 1,
		flag: false,
		startDate: null,
		endDate: null,
		cleanData: false,
		action: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
	};
}
export default {
	name: 'page-new-prize',
	data,
	components: {
		btnAddItem,
		VueSixFour,
		newCategory,
		actionSidebar,
		associateProduct,
	},
	methods: {
		getFile,
		setData,
		openDialogImagen,
		openSlideModal,
		cancelModal,
	},
	mixins: [upLoadImageMixin],
};
</script>

<style lang="scss" scoped>
	.title-form {
		border-bottom: 1px solid color(subheader);
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(medium16);
		margin-bottom: 21px;
		padding-bottom: 9px;
	}

	.product-image-container {
		align-items: center;
		background-color: rgba(156, 166, 176, 0.07);
		border: 1px dashed #9ca6b0;
		border-radius: 5px;
		color: rgba(156, 166, 176, 0.4);
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		font-family: font(open-bold);
		font-size: size(medium15);
		height: 118px;
		justify-content: center;
		max-width: 134px;
		position: relative;
		width: 100%;

		&:hover > .product-image-hover {
			display: flex;
		}

		&:hover > .product-image-hover-delete {
			display: block;
		}
	}

	.main-form {
		background-color: color(maki-white);
		min-height: calc(100vh - 100px);
		padding-bottom: 80px;
		padding-top: 5px;
	}

	.new-prize {
		&__label {
			color: color(primary);
			font-size: 11px;
			font-weight: bold;
		}

		&__content-text {
			background-color: rgba(195, 231, 232, 0.29);
			color: color(paginationText);
			font-size: 12px;
			padding: 4px;
		}
	}
</style>