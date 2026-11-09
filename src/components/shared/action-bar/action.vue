<template>
	<div>
		<template v-if="hasHotKeys">
			<v-tooltip top>
				<template slot="activator">
					<v-btn
						class="btn-action-bar primary--text mx-0 my-1"
						small
						v-bind="$attrs"
						@click="openAction"
						v-shortkey="hotKeys"
						@shortkey="openAction"
					>
						<v-tooltip top
							class="new-indicator">
							<v-icon
								v-if="action.flagNew"
								color="info"
								size="10"
								slot="activator">
								fiber_manual_record
							</v-icon>
							<span>¡Nuevo!</span>
						</v-tooltip>
						<v-icon v-if="action.icon">
							{{ action.icon }}
						</v-icon>
						<img
							v-if="action.pathIcon"
							:src="action.pathIcon"
							:alt="action.name"
							height="19"
							width="25"
						/>
						<span class="action-name">{{ action.name }}</span>
					</v-btn>
				</template>
				<span v-if="hotKeys.length">
					<template v-for="(key, indexKey) in hotKeys">
						<span :key="indexKey">
							{{ key }}
							<span v-if="indexKey !== (hotKeys.length - 1)"> + </span>
						</span>
					</template>
				</span>
			</v-tooltip>
		</template>
		<template v-else-if="action.showMessage">
			<v-tooltip top>
				<template slot="activator">
					<v-btn
						class="btn-action-bar primary--text mx-0 my-1"
						small
						v-bind="$attrs"
						@click="openAction"
						v-shortkey="hotKeys"
						@shortkey="openAction"
					>
						<v-icon v-if="action.icon">
							{{ action.icon }}
						</v-icon>
						<img
							v-if="action.pathIcon"
							:src="action.pathIcon"
							:alt="action.name"
							height="19"
							width="25"
						/>
						<span class="action-name">{{ action.name }}</span>
					</v-btn>
				</template>
				<span v-html="action.message"></span>
			</v-tooltip>
		</template>
		<template v-else>
			<v-btn
				class="btn-action-bar primary--text mx-0 my-1"
				small
				v-bind="$attrs"
				@click="openAction"
			>
				<v-tooltip top
					class="new-indicator">
					<v-icon
						v-if="action.flagNew"
						color="info"
						size="10"
						slot="activator">
						fiber_manual_record
					</v-icon>
					<span>¡Nuevo!</span>
				</v-tooltip>
				<v-icon v-if="action.icon">
					{{ action.icon }}
				</v-icon>
				<img
					v-if="action.pathIcon"
					:src="action.pathIcon"
					:alt="action.name"
					height="19"
					width="25"
				/>
				<span class="action-name">{{ action.name }}</span>
			</v-btn>
		</template>
	</div>
</template>

<script>
	function hasHotKeys() {
		return this.hotKeys && this.hotKeys.length > 0;
	}

	function openAction() {
		this.$emit('open-action');
	}

	export default {
		name: 'action',
		computed: {
			hasHotKeys,
		},
		inheritAttrs: false,
		methods: {
			openAction,
		},
		props: {
			action: {
				required: true,
				type: Object,
			},
			hotKeys: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.btn-action-bar {
		background-color: white !important;
		border: 1px solid currentColor;
		border-radius: 4px;
		border-bottom-right-radius: 0px;
		border-top-right-radius: 0px;
		box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, .5);
		font-size: 9px;
		min-height: 40px;
		min-width: 35px;
		overflow: hidden;
		padding-left: 5px;
		position: relative;
		transform: translateX(-35px);
		transition: all .5s ease-in-out 0s;
		width: 113px;

		.action-name {
			display: inline-block;
			line-height: 1;
			max-width: 72px;
			padding: 1px 0px 0px 5px;
			text-align: left;
			text-transform: uppercase;
			vertical-align: middle;
			white-space: pre-line;
		}

		&:hover {
			transform: translateX(-112px);
		}
	}

	.new-indicator {
		left: 0.5px;
		position: absolute;
		top: 0px;
	}
</style>