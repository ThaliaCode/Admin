<template>
	<div>
		<v-navigation-drawer
			:width="localWidth"
			right
			temporary
			v-model="value"
			fixed
			:stateless="true"
		>
			<section class="header-modal" :style="`background-color: ${headerColor}`">
				<header class="header-title">
					<h2>
						<v-tooltip bottom>
							<span slot="activator" class="title-sidebar">{{ title | limitTo(limitText) }}</span>
							<span class="title-sidebar">{{ title }}</span>
						</v-tooltip>
						<slot name="title-icon"></slot>
					</h2>
					<slot name="right"></slot>
					<v-btn
						v-if="backBtn"
						@click="closeDrawer"
						icon
						:disabled="isLoading">
						<img v-if="imgSrc" :src="imgSrc" alt="">
						<v-icon v-else>arrow_forward</v-icon>
					</v-btn>
				</header>
			</section>
			<section class="content-modal">
				<v-layout row v-if="codeAction === 'HELP'" pa-4>
					<v-flex xs12>
						<div
							v-for="(helpAction, indexHelp) in helpActions"
							:key="indexHelp"
						>
							<h3 class="pb-1">
								<img :src="helpAction.pathIcon" :alt="helpAction.name">
								<span>{{getActionName(helpAction)}}</span>
							</h3>
							<v-divider></v-divider>
							<section class="pt-3 pb-4">
								<h3 class="pb-2">Descripción</h3>
								<p class="description-style">{{helpAction.description}}</p>
								<p>Tutorial:
									<a :href="helpAction.link">{{helpAction.link}}</a>
								</p>
								<p>Manuales:
									<ul>
										<li
											v-for="(man, indexMan) in helpAction.manuals"
											:key="indexMan"
										>
											<a
												:href="man.file"
												target="_blank"
											>{{man.file}}</a>
										</li>
									</ul>
								</p>
							</section>
						</div>
					</v-flex>
				</v-layout>
				<v-layout xs12 px-5 mt-2 justify-end v-if="title === 'Productos'">
					<v-slider
							v-if="showSize"
							v-model="localWidth"
							:max="1200"
							:min="500"
							:step="10"
							class="small pa-0 mr-3"
							@input="updateWidth"
							style="max-width: 100px; width: 100%;"
							:thumb-label="false"
							hide-details
						></v-slider>
						<span class="text--size mr-2">
							Ajustar tamaño
						</span>
						<app-tooltip-button
							color="primary"
							height="17"
							icon="open_in_full"
							text="Ajustar tamaño"
							@click-icon="editSize"
						/>
				</v-layout>
				<slot></slot>
			</section>
		</v-navigation-drawer>
	</div>
</template>

<script>
function closeDrawer() {
	this.$emit('close-modal', false);
}

function getActionName({ name }) {
	return name.toUpperCase();
}

export default {
	name: 'action-sidebar',
	data() {
		return {
			localWidth: this.width,
			showSize: false,
		};
	},
	methods: {
		closeDrawer,
		getActionName,
		updateWidth(e) {
			this.localWidth = e;
		},
		editSize() {
			this.showSize = !this.showSize;
		}
	},
	model: {
		prop: 'value',
		event: 'close-modal',
	},
	props: {
		backBtn: {
			default: true,
			type: Boolean,
		},
		limitText: {
			default: 37,
			type: Number,
		},
		title: {
			type: String,
			required: true,
		},
		value: {
			type: Boolean,
			required: true,
		},
		width: {
			default: 350,
			type: Number,
		},
		codeAction: {
			type: String,
			required: false,
		},
		imgSrc: {
			type: String,
		},
		headerColor: {
			type: String,
			default: 'white',
		},
		contentModal: {
			type: String,
			default: '',
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
		helpActions: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		width(val) {
			this.localWidth = val;
		}
	}
};
</script>

<style lang="scss" scoped>
.text--size {
	font-size: 13px;
	margin-top: 2px;
}
.navigation-drawer{
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0;
}
	.header-modal {
		border: 1px solid map-get($colors, grey);
		min-height: 39px;
		padding-left: 30px;

		.header-title {
			@include flex-between;
			color: map-get($colors, sidebar);

			h2 {
				color: map-get($colors, paginationText);
				font-family: map-get($fonts, open-semibold);
				font-size: map-get($sizes, medium20);
				overflow: hidden;
				text-transform: uppercase;
				white-space: nowrap;
			}

			.btn {
				margin: 0;
			}
		}
	}
	.content-modal {
		flex-grow: 1;

		overflow: auto;
		padding-bottom: 90px;
		background: #FBFBFB;
	}

	.description-style {
		color: map-get($colors, background-card-black);
		font-family: map-get($fonts, open-light);
	}
</style>
