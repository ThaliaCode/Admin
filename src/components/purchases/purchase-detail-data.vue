<template>
	<v-layout row wrap align-center>
		<template v-for="field in summary">
			<v-flex
				v-if="
					field.show ||
					(field.id === 11 && field.value && field.value.length) ||
					field.idDocument
				"
				mb-4
				:key="field.id"
				xs3
			>
				<v-layout v-if="field.show" row wrap align-center :class="field.class">
					<v-flex d-flex align-center pl-2 class="column-label">
						{{ field.label }}
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						<span class="status" v-if="field.id === 10">
							<document-state
								:color="field.value.color"
								:tooltip="field.value.description"
							/>
							<p>{{ field.value.description }}</p>
						</span>
						<span v-else>{{ field.value }}</span>
					</v-flex>
				</v-layout>
				<v-layout
					v-else-if="field.id === 11 && field.value && field.value.length"
					row
					wrap
					align-center
					:class="field.class"
				>
					<v-flex d-flex align-center pl-2 class="column-label">
						Archivos Adjuntos
					</v-flex>
					<v-flex>
						<v-btn
							flat
							slot="activator"
							class="btn-auto"
							v-for="image in field.value"
							:key="image"
							@click="goToImage(image)"
						>
							<div class="btn-content">
								<v-icon size="25" color="primary">
									{{ isImgPdf(image) ? 'picture_as_pdf' : 'image' }}
								</v-icon>
								<span>{{ getImageName(image) }}</span>
							</div>
						</v-btn>
					</v-flex>
				</v-layout>
				<v-layout v-else-if="field.idDocument" row wrap align-center :class="field.class">
					<v-flex d-flex align-center pl-2 class="column-label">
						{{ field.label }}
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						<button
							@click="$emit('go-detail-purchases', field.idDocument)"
							class="btn-link"
						>
							{{ field.value }}
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
		</template>
	</v-layout>
</template>

<script>
import documentState from '@/components/shared/document-state';

export default {
	name: 'purchase-detail-data',
	props: {
		summary: {
			default: () => [],
			type: Array,
		},
		vendorName: [String],
	},
	components: {
		documentState,
	},
	methods: {
		getStatus(status) {
			const color = status;
			const tooltip = status;
			return { color, tooltip };
		},
		getImageName(imageUrl) {
			const parts = imageUrl.split('/');
			const fileName = parts.at(-1);
			const fileParts = fileName.split('.');
			const truncatedName =
				fileParts[0].length > 5 ? `${fileParts[0].slice(0, 5)}...` : fileParts[0];
			const finalName = `${truncatedName}.${fileParts[1]}`;
			return finalName;
		},
		goToImage(image) {
			window.open(image, '_blank');
		},
		isImgPdf(image) {
			return image.toLowerCase().endsWith('.pdf');
		},
	},
};
</script>

<style lang="scss" scoped>
.status {
	display: flex;
	align-items: center;
	p {
		margin: 0;
	}
}
.btn-link {
	color: map-get($colors, primary);
	font-weight: bold;
}
.block {
	display: block;
	font-size: 13px;
}

.btn-vertical {
	padding: 8px;
	min-width: auto;
}

.btn-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.btn-content span {
	margin-top: 4px;
	font-size: 10px;
	text-align: center;
	text-transform: lowercase;
}
</style>
