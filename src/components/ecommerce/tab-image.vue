<template>
	<div class="tab-image">
		<div v-if="!image">
			<div class="wrapper-upload-image">
				<label ref="label" for="upload-file-tab" class="w-100">
					<vue-six-four 
						id="upload-file-tab" 
						class="input-upload"
						@vue-six-four="getFileUpdate"
					/>
				</label>
				<div class="wrapper-btn-upload">
					<v-layout wrap row align-center justify-center>
						<v-flex	xs12 class="text-center">
							<v-icon
								color="grey lighten-2"
								size="99"
							>
								image
							</v-icon>
						</v-flex>
						<v-flex	wrap xs12 >
							<v-layout wrap row align-center justify-center>
								<v-flex xs12 v-if="false">
									<p class="text-center">Tamaño máximo de imagen: <br>({{imageSize}})</p>
								</v-flex>
								<v-flex xs12 v-if="suggestion && false">
									<p class="text-center">Se sugiere que las imagenes sean de tamaño {{imageSize}} <br> o proporcionales a ella</p>
								</v-flex>
								<v-flex xs12 px-5>
									<p class="text-center">
										<ul class="li-message">
											<li>Banner header en micrositio: 697px ancho x 217px</li>
										</ul>
									</p>	
								</v-flex>
								<v-flex xs12>
									<p class="text-center text-gray">Arrastrar Imagen</p>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</div>
				<div class="wrapper-button">
					<v-btn
						@click="showDialog"
						color="success"
						class="btn-action">
						Cargar Imagen
					</v-btn>
				</div>
			</div>
		</div>
		<div 
			v-else
			class="wrapper-image">
			<img 
				:src="image" 
				:alt="image"
				height="301"
				class="image-tab"
			/>
		</div>
		<div class="wrapper-delete">
			<app-tooltip-button
				v-if="image"
				color="primary"
				icon="image_search"
				text="Ver imagen en tamaño real"
				@click-icon="$emit('see-real-image', image)"
			></app-tooltip-button>
			<app-tooltip-button
				v-if="image"
				color="error"
				icon="delete"
				text="Eliminar imagen"
				@click-icon="$emit('upload')"
			></app-tooltip-button>
		</div>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';

function data() {
	return {
		allowedFiles: [
			'jpg',
			'JPG',
			'jpeg',
			'JPEG',
			'png',
			'PNG',
		],
	};
}

function showDialog() {
	this.$refs.label.click();
}

async function getFileUpdate(fileInfo) {
	const textRandom = Math.floor(Math.random() * 10000) + 1;
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		words.splice(lastItem - 1, 1).join();
		const nameOnRandom = `${words}${textRandom}.${extension}`;
		newFile.name = nameOnRandom;
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post('upload-files', newFile);
			this.$emit('upload', file.Location);
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	}
}

export default {
	name: 'tab-image',
	data,
	components: {
		VueSixFour,
	},
	methods: {
		showDialog,
		getFileUpdate,
	},
	props: {
		image: String,
		imageSize: {
			default: '',
			type: String,
		},
		suggestion: {
			default: false,
			type: Boolean,
		},
	},
};

</script>
<style lang="scss" scoped>

	.tab-image {
		background: map-get($colors, white);
		height: 500px;

		.text-center {
			text-align: center;
		}

		.input-image {
			background: white;
			height: 463px;
			width: 100%;
		}

		.input-upload {
			background: white;
			display: block;
			height: 463px;
			opacity: 0;
			position: absolute;
			width: 100%;
			z-index: 2;
		}

		.wrapper-upload-image {
			height: 463px;
			position: relative;
		}

		.wrapper-btn-upload {
			bottom: 50%;
			position: absolute;
    	transform: translateY(40%);
    	width: 100%;
			z-index: 1;
		}

		.wrapper-button {
			bottom: 50%;
			left: 50%;
			margin: auto;
			position: absolute;
			transform: translate(-50%, 100px);
			width: 97px;
			z-index: 3;
		}

		.wrapper-image {
			padding: 0 10px;
    	position: relative;
    	top: 50%;
    	transform: translateY(-50%);
		}

		.image-tab {
			display: block;
    	margin: auto;
			max-width: 98%;
		}

		.wrapper-delete {
			align-items: center;
			background: #EEEEEE;
			bottom: 0;
			display: flex;
			height: 42px;
			justify-content: center;
			position: absolute;
			width: 100%;
		}

		.text-gray {
			color: map-get($colors, text-gray);
			font-size: 12px;
		}

		.li-message {
			list-style: none;
		}
	}
</style>

