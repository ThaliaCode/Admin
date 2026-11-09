<template>
	<div>
		<v-layout row wrap pt-4 px-3 pb-5 mb-5>
			<v-flex xs12 d-flex align-center justify-start>
				<v-icon class="connection-state-icon" :color="connectionColor" :size="14">lens</v-icon>
				<span class="connection-state">{{ connectionLabel }}</span>
			</v-flex>
			<v-flex xs12 pt-3 v-if="connectionData.Location">
				<p class="message-counter mb-0">
					Escanea el código QR para conectarte a makichat.
				</p>
				<p class="message-counter mb-0">
					Recuerda que en <span class="message-counter-number">{{ counter }}</span>
					segundos será inválido.
				</p>
				<div class="qrcode-container" v-if="connectionData.Location">
					<img
						:src="connectionData.Location"
						alt="código qr makichat"
					/>
				</div>
			</v-flex>
			<v-flex xs12 pt-3 v-if="showNumber">
				<v-layout row wrap>
					<v-flex xs8 pr-2>
						<app-input-text
							label="Número de Teléfono"
							:text="connectionData.myNumber.result"
							readonly
						></app-input-text>
					</v-flex>
					<v-flex xs4 pl-2>
						<app-input-text
							label="Nivel de Batería"
							:text="`${connectionData.battery.result} %`"
							readonly
						></app-input-text>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				:hidden-save-btn="!!connectionData.Location || showMessage"
				:is-loading="showMessage"
				:success-text="actionSuccessText"
				@accept-button-clicked="$emit('action-success')"
				@cancel-button-clicked="$emit('action-cancel')"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function connectionColor() {
		return this.connectionData.myNumber ? 'success' : 'grey';
	}

	function connectionLabel() {
		return this.connectionData.myNumber ? 'En Línea' : 'Desconectado';
	}

	export default {
		name: 'connection-slide',
		components: {
			modalSidebarButton,
		},
		computed: {
			connectionColor,
			connectionLabel,
		},
		props: {
			actionSuccessText: String,
			counter: Number,
			connectionData: {
				default: () => {},
				type: Object,
			},
			showMessage: {
				default: false,
				type: Boolean,
			},
			showNumber: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.connection-state {
		color: color(map-cation);
		font-family: font(open-semibold);
		font-size: size(medium16);

		&-icon {
			max-width: 20px;
		}
	}

	.message-counter {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small13);

		&-number {
			color: color(primary);
			font-family: font(open-bold);
		}
	}

	.qrcode-container {
		align-items: center;
		border: 1px solid color(primary);
		border-radius: 16px;
		display: flex;
		justify-content: center;
		margin: 20px auto;
		max-width: fit-content;
		max-width: -moz-fit-content;
		padding: 30px;
		text-align: center;
	}
</style>