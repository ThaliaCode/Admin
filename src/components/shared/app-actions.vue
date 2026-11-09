<template>
	<div class="app-actions" justify-end>
		<div v-show="isResponsive">
			<div @click="toogleViewActions" style="max-width: 50%" class="px-3">
				<app-tooltip-button
					text="Ver acciones"
					:icon="viewActions ? 'expand_more' : 'expand_less'"
					:height="30"
					color="primary"
					@click-icon="toogleViewActions"
				/>
				<label class="caption">Ver Acciones</label>
			</div>
			<div></div>
		</div>
		<div
			v-show="viewActions"
			v-if="this.actionComplete.length > 0"
			class="width-content"
			row
			align-center
			justify-end
		>
			<!-- ------------------ -->
			<div
				v-for="(item, index) in newActions"
				:key="index"
				class="container-btn-action border-right"
			>
				<button
					type="button"
					class="btn-app-actions"
					:class="{ disabled: item.disabled }"
					@click="openAction(item)"
					color="white"
				>
					<v-layout>
						<v-flex
							xs2
							class="content-images-action"
							:class="{ 'show-description': item.description.length > 0 }"
							py-2
							pl-2
						>
							<img
								v-if="item.pathIcon"
								src="/static/img/link-action.svg"
								:alt="item.name"
								height="16"
								width="13"
								class="img-resource mr-2"
								:class="{ disabled: item.disabled }"
							/>
							<img
								v-if="item.description.length > 0"
								src="/static/img/help-action.svg"
								alt="ayuda"
								height="15"
								class="img-resource-help"
								:class="[item.disabled ? 'img-gray' : 'img-white']"
							/>
							<div class="message-action" v-if="item.description.length > 0">
								<p class="mb-1 primary--text bold">{{ item.name }}</p>
								<p class="mb-0">{{ item.description }}</p>
							</div>
						</v-flex>
						<v-flex xs10 py-2 pr-2>
							<app-tooltip-button
								class="new-indicator"
								v-if="item.flagNew"
								color="info"
								height="10"
								icon="fiber_manual_record"
								:text="item.newTitle || 'Nuevo'"
							></app-tooltip-button>
							<v-tooltip top v-if="item.name.length > 14">
								<span slot="activator">{{ item.name | limitTo(14) }}</span>
								<span>{{ item.name }}</span>
							</v-tooltip>
							<span v-else>{{ item.name }}</span>
						</v-flex>
					</v-layout>
				</button>
			</div>
			<!-- ------------------ -->
			<div class="add-contends">
				<div class="content-action-vertical" v-if="this.actions.length > 0">
					<v-btn
						color="primary"
						@click="openActionVertical"
						fab
						small
						class="btn-help"
					>
						<v-tooltip top>
							<v-icon color="white" slot="activator" class="add-icon"
								>add</v-icon
							>
							<span>Mas opciones</span>
						</v-tooltip>
					</v-btn>
					<div
						class="content-list-action-vertical"
						:class="[showActionVertical ? 'open-action' : 'close-action']"
					>
						<div v-for="(item, index) in actions" :key="index">
							<button
								class="content-btn-vertical"
								:class="{ disabled: item.disabled }"
								@click="openAction(item)"
							>
								<div class="mr-2 content-image-message">
									<div>
										<img
											v-if="item.pathIcon"
											src="/static/img/link-action.svg"
											:alt="item.name"
											:class="{ disabled: item.disabled }"
											height="16"
											width="13"
											class="img-veritical"
										/>
										<img
											src="/static/img/help-action.svg"
											alt="ayuda"
											height="16"
											width="13"
											:class="{ 'img-gray': item.disabled }"
											class="img-resource-help-vertical"
										/>
									</div>
									<div
										v-if="item.description.length > 0"
										class="message-action-vertical"
									>
										<p class="mb-1 primary--text bold">{{ item.name }}</p>
										<p class="mb-0">{{ item.description }}</p>
									</div>
								</div>
								<div
									class="content-btn-vertical-text"
									:class="{ disabled: item.disabled }"
								>
									{{ item.name }}
								</div>
							</button>
						</div>
					</div>
				</div>
				<!-- --------------- -->
				<v-btn color="success" @click="openHelp" fab small class="btn-help">
					<img src="/static/icon/btn-help-center.svg" />
				</v-btn>
			</div>
		</div>
		<action-sidebar
			:help-actions="newActions"
			:title="action.title"
			:value="action.value"
			:width="action.width"
			@close-modal="cancelModal"
		>
			<help-component :helps="helps" />
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import helpComponent from '@/components/accounting/utils/help-component';

function created() {
	this.loadData();
}

function actionDisabled(values) {
	this.actions = this.actions.reduce((accum, act) => {
		const newAction = { ...act };
		const index = values.findIndex((v) => v.code === act.code);
		newAction.disabled = index > -1 && values[index].disabled;
		newAction.showMessage =
			index > -1 ? values[index].showMessage || false : false;
		newAction.message = index > -1 ? values[index].message : null;
		accum.push(newAction);
		return accum;
	}, []);
	this.newActions = this.newActions.reduce((accum, act) => {
		const newAction = { ...act };
		const index = values.findIndex((v) => v.code === act.code);
		newAction.disabled = index > -1 && values[index].disabled;
		newAction.showMessage =
			index > -1 ? values[index].showMessage || false : false;
		newAction.message = index > -1 ? values[index].message : null;
		accum.push(newAction);
		return accum;
	}, []);
}

async function loadData() {
	const appCode = process.env.APP_CODE;
	const uri = this.resourceUri;
	const params = {
		languages: 'es',
	};
	const headers = {
		Accept: 'application/vnd.apiacl.v2+json',
	};
	try {
		const { data: actions } = await this.$httpAcl.get(
			`sidebar/${appCode}/resource/${uri}`,
			{
				params,
				headers,
			}
		);
		this.actions = actions.data.map((actionSingle) => {
			const newAction = { ...actionSingle };
			const index = this.valueDisabled.findIndex(
				(val) => val.code === actionSingle.code
			);
			newAction.name = actionSingle.languages;
			newAction.disabled = index > -1 && this.valueDisabled[index].disabled;
			return newAction;
		});
		this.newActions = this.actions.splice(0, 4);
		this.actionComplete = actions.data;
	} catch (error) {
		this.showGenericError();
	}
}

function openAction(item) {
	if (!item.disabled) {
		if (item.code === 'HELP') {
			const helpIndex = this.actions.findIndex((act) => act.code === item.code);
			const newActions = Object.assign([], this.actions);
			newActions.splice(helpIndex, 1);
			const model = {
				code: item.code,
				actions: newActions,
			};
			this.$emit('open-help', model);
		} else {
			this.$emit('run-action', item);
		}
	}
}

function openHelp() {
	this.action = {
		title: this.$route.meta.title,
		code: 'H',
		open: true,
		value: true,
		width: 500,
	};
	this.helps = this.actionComplete;
}

function cancelModal() {
	this.action = {
		value: false,
		code: null,
		title: '',
	};
}

function openActionVertical() {
	this.showActionVertical = !this.showActionVertical;
}

function watchRoute(routeValue) {
	if (
		routeValue &&
		routeValue.name !== 'groups-edit' &&
		routeValue.name !== 'groups-delete'
	) {
		this.loadData();
	}
}

function data() {
	return {
		actions: [],
		helps: [],
		actionComplete: [],
		newActions: [],
		action: {
			value: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		showActionVertical: false,
		viewActions: window.innerWidth >= 800,
		isResponsive: window.innerWidth < 800,
	};
}

export default {
	name: 'app-actions',
	created,
	components: {
		actionSidebar,
		helpComponent,
	},
	methods: {
		cancelModal,
		loadData,
		openAction,
		openHelp,
		openActionVertical,
		toogleViewActions() {
			this.viewActions = !this.viewActions;
		},
	},
	data,
	props: {
		resourceUri: {
			required: true,
			type: String,
		},
		valueDisabled: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		valueDisabled: {
			deep: true,
			handler: actionDisabled,
		},
		$route: watchRoute,
	},
};
</script>

<style lang="scss" scoped>
.name-action {
	color: color(primary) !important;
	font-family: font(open-semibold);
	font-size: 13px;
}

.btn-add-actions {
	background-color: map-get($colors, selector-color);
	border: solid 1px map-get($colors, selector-color);
	border-radius: 50%;
	height: 25px;
	margin-left: 14px;
	width: 25px;
}

.add-icon {
	position: relative;
	top: 3px;
}

.app-actions {
	background-color: map-get($colors, background-action);
	// @media (max-width: 760px) {
	// 	display: none;
	// }
}

.border {
	border: 1px solid map-get($colors, background-card);
	height: 15px;
	margin: 0 0 0 15px;
}

.width-content {
	margin: 0 0 0 auto;
	display: flex;
	align-items: center;
	justify-content: end;
	// width: 89%;
	.add-contends {
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
@media (max-width: 800px) {
	.width-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		.container-btn-action {
			display: flex;
			justify-content: center;
			padding-top: 2px;
			padding-bottom: 2px;
		}
		.add-contends {
			display: flex;
			justify-content: center;
			align-items: center;
			.border-right::after {
				display: none;
			}
		}
	}
	.add-contends.border-right::after {
		display: none;
	}
}

.btn-add {
	height: 25px;
	width: 24px;
}

.btn-app-actions {
	background-color: map-get($colors, white);
	border: 1px solid map-get($colors, primary) !important;
	border-radius: 5px;
	box-shadow: none;
	color: color(primary);
	font-family: font(open-semibold);
	font-size: 12px;
	margin-left: 6px;
	position: relative;
	text-transform: uppercase;
	transition: all 0.5s ease-in-out 0s;
	width: 160px;

	&.disabled {
		border: 1px solid map-get($colors, action-disabled) !important;
		color: color(action-disabled);
		cursor: not-allowed;
	}

	&:not(.disabled) {
		&:hover {
			background-color: map-get($colors, primary);
			color: map-get($colors, white);

			.content-images-action {
				.img-resource {
					filter: brightness(0) invert(1);
					-webkit-filter: brightness(0) invert(1);
					-moz-filter: brightness(0) invert(1);
				}
			}
		}
	}
}

.message-action {
	background-color: color(white);
	border: 1px solid color(item-select);
	border-radius: 5px;
	box-shadow: 0 2px 4px 0 rgba(157, 157, 157, 0.5);
	color: color(brown-grey);
	display: none;
	font-size: 12px;
	left: -95px;
	padding: 15px;
	position: absolute;
	text-transform: none;
	top: 51px;
	transition: all 0.5s ease-in-out 0s;
	z-index: 2;
	width: 109%;

	&::before {
		background: color(white);
		border: 1px solid color(item-select);
		border-bottom-width: 0;
		border-right-width: 0;
		content: '';
		height: 15px;
		left: 60%;
		position: absolute;
		top: -9px;
		width: 15px;
		-webkit-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-o-transform: rotate(45deg);
		transform: rotate(45deg);
	}
}

.bold {
	font-family: font(open-semibold);
}

.message-action-list {
	color: color(brown-grey);
	font-size: 12px;
	position: absolute;
}

.img-resource {
	transition: all 0.5s ease-in-out 0s;

	&.disabled {
		filter: grayscale(100%);
		-webkit-filter: grayscale(100%);
		-moz-filter: grayscale(100%);
	}
}

.content-images-action {
	&.show-description {
		&:hover {
			.message-action {
				display: block;
			}

			.img-resource-help {
				display: block;
			}

			.img-resource {
				display: none;
			}
		}
	}
}

.img-gray {
	filter: grayscale(100%);
	-webkit-filter: grayscale(100%);
	-moz-filter: grayscale(100%);
}

.img-white {
	filter: brightness(0) invert(1);
	-webkit-filter: brightness(0) invert(1);
	-moz-filter: brightness(0) invert(1);
}

.img-resource-help {
	display: none;
}

.content-action-vertical {
	position: relative;
}

.content-list-action-vertical {
	background-color: white;
	border: solid 1px #ebebeb;
	border-radius: 5px;
	box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05);
	left: -135%;
	padding: 6px;
	position: absolute;
	top: 41px;
	width: 197px;
	z-index: 4;

	&.open-action {
		display: block;
	}

	&.close-action {
		display: none;
	}

	&::before {
		background: color(white);
		border: 1px solid #ebebeb;
		border-bottom-width: 0;
		border-right-width: 0;
		content: '';
		height: 15px;
		left: 41%;
		position: absolute;
		top: -9px;
		width: 15px;
		-webkit-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-o-transform: rotate(45deg);
		transform: rotate(45deg);
	}
}

.content-btn-vertical {
	padding: 8px 0;
	display: flex;

	&-text {
		color: color(primary);
		font-size: 12px;
		text-align: left;
		text-transform: uppercase;

		&.disabled {
			color: color(action-disabled);
		}
	}

	&.disabled {
		cursor: not-allowed;
	}
}

.img-veritical {
	&.disabled {
		filter: grayscale(100%);
		-webkit-filter: grayscale(100%);
		-moz-filter: grayscale(100%);
	}
}

.content-image-message {
	position: relative;

	&:hover {
		.message-action-vertical {
			display: block;
		}

		.img-veritical {
			display: none;
		}

		.img-resource-help-vertical {
			display: block;
		}
	}
}

.message-action-vertical {
	background-color: color(white);
	border: 1px solid color(item-select);
	border-radius: 5px;
	box-shadow: 0 2px 4px 0 rgba(157, 157, 157, 0.5);
	color: color(brown-grey);
	font-size: 12px;
	display: none;
	padding: 6px;
	position: absolute;
	right: 29px;
	top: -14px;
	width: 178px;

	&::before {
		background: color(white);
		border: 1px solid color(item-select);
		border-bottom-width: 0;
		border-left-width: 0;
		content: '';
		height: 15px;
		position: absolute;
		right: -8px;
		top: 11px;
		width: 15px;
		-webkit-transform: rotate(45deg);
		-moz-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		-o-transform: rotate(45deg);
		transform: rotate(45deg);
	}
}

.img-resource-help-vertical {
	display: none;
	height: 24px;
}

.new-indicator {
	right: 1px;
	position: absolute;
	top: 0.5px;
}
</style>
