<template>
	<v-layout wrap class="graphic-card">
		<v-flex xs12 class="graphic-header">
			<v-layout row wrap align-center>
				<v-flex xs8 class="title-space">
					<p class="title-typography ma-0">
						{{ title }}
						<span v-if="category" class="title-underline">{{ category }}</span>
					</p>
				</v-flex>
				<v-flex xs4>
					<v-layout row wrap align-center>
						<v-flex xs9 v-if="showSlot">
							<slot name="header"></slot>
						</v-flex>
						<v-flex xs3 v-if="draggable">
							<app-tooltip-button
								color="opacity-list-price"
								icon="drag_indicator"
								text="Haz clic y arrastra para cambiar el orden de los gráficos"
							></app-tooltip-button>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-divider v-if="divider" class="card-divider"></v-divider>
		</v-flex>
		<v-flex xs12 pa-3 class="graphic-content">
			<slot name="content"></slot>
		</v-flex>
	</v-layout>
</template>

<script>
	export default {
		name: 'graphic-card',
		props: {
			category: '',
			divider: {
				default: true,
				type: Boolean,
			},
			draggable: {
				default: true,
				type: Boolean,
			},
			showSlot: {
				default: false,
				type: Boolean,
			},
			title: '',
		},
	};
</script>

<style lang="scss" scoped>
	.graphic-card {
		background-color: color(white);
		border: 1px solid color(maki-grey);
		border-radius: 4px;
		min-height: 377px;
	}

	.graphic-header {
		height: 55px;
	}

	.graphic-content {
		height: calc(377px - 55px);
	}

	.title {
		&-space {
			padding-bottom: 16px;
			padding-left: 8%;
			padding-top: 16px;
		}

		&-typography {
			color: color(background-sidebar-selected);
			font-family: font(open-semibold);
			font-size: size(medium18);
		}

		&-underline {
			text-decoration: underline;
		}
	}
</style>