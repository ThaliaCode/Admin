<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 mb-3>
				<v-layout 
					row 
					wrap
					class="wrapper-check">
					<v-flex xs12 pt-2 pb-1>
						<h5>Datos Generales</h5>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-select
					:item="category.father"
					:items="items"
					item-text="name"
					item-value="id"
					label="Categoría padre(*)"
					model="fatherId"
					:return-object="false"
					@input="setData"
				></app-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-input-text
					label="Título"
					model="title"
					:text="category.name"
					@input="setData"
				></app-input-text>
			</v-flex>
			<v-flex xs12 mb-3>
				<app-input-text
					label="Slug"
					model="slug"
					:text="category.name"
					@input="setData"
				></app-input-text>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-text-field
					class="textarea-content filter-select"
					label="Descripción"
					v-model="category.description">
				</v-text-field>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-layout>
					<v-flex v-for="image in images" :key="image.id" xs4 pa-2>
						<label :ref="`up${image.id}`" :for="`upload-image-${image.id}`">
							<vue-six-four
								:id="`upload-image-${image.id}`"
								hidden
								@vue-six-four="getFile"
							/>
							<button
								class="product-image-container"
								:disabled="isLoadingImage"
								type="button"
								@click="actionUploadImages(`up${image.id}`)"
							>
								<template v-if="category.urlImage">
									<img
										:src="category.urlImage"
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
										<p class="product-image-title mb-0">{{ image.name }}</p>
									</template>
								</template>
							</button>
						</label>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-layout 
					row 
					wrap
					class="wrapper-check">
					<v-flex xs11 pt-2>
						<h5>Activar Automáticamente</h5>
					</v-flex>
					<v-flex xs1>
						<v-checkbox
							v-model="showDate"
							hide-details
							></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 v-if="showDate">
				<v-layout row wrap justify-space-between>
					<v-flex xs5>
						<app-date-mask
							label="Fecha Inicio"
							v-model="startDate"
							@format-date="onDate($event, 'startDate')"
						></app-date-mask>
					</v-flex>
					<v-flex xs5>
						<app-date-mask
							id="end-date"
							label="Fecha Fin"
							v-model="endDate"
							@format-date="onDate($event, 'endDate')"
						></app-date-mask>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex></v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('create-category')"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import upLoadImageMixin from '@/mixins/upLoadImage';

function setData() {}

function onDate() {}

function openDialogImagen() {
	this.dialogImage = true;
}

function actionUploadImages(value) {
	this.$refs[value][0].click();
}

function data() {
	return {
		category: {},
		dialogImage: false,
		items: [],
		showDate: false,
		startDate: null,
		endDate: null,
		images: [
			{
				id: 1,
				name: 'Ícono app',
			},
			{
				id: 2,
				name: 'Ícono web',
			},
			{
				id: 3,
				name: 'Ícono Imagen',
			},
		],
	};
}

export default {
	name: 'new-category',
	data,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	methods: {
		onDate,
		openDialogImagen,
		setData,
		actionUploadImages,
	},
	mixins: [upLoadImageMixin],
};
</script>
<style lang="scss" scoped>
	.wrapper-check {
		border-bottom: 1px solid map-get($colors, blue-grey);
		h5 {
			color: color(primary);
		}
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
</style>