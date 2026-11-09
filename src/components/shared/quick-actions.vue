<template>
	<div class="actions">
		<div class="actions-bar">
			<div class="action-content">
				<button
					class="action"
					type="button"
					v-for="(action, index) in actions"
					:class="{ active: action.active }"
					:style="setBorder(action)"
					@click="actionToDo(action)"
					:key="index"
				>
					<img
						:src="action.img"
						:alt="action.text"
						class="action-logo"
						height="35"
					/>
					<p class="action-txt" :style="setMaxWidth(action)">
						{{ action.text }}
					</p>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
function actionToDo(item) {
	const action = item.link || {
		width: item.width ? item.width : 0,
		title: item.text,
		code: item.code,
		active: item.active,
		open: true,
	};
	const eventEmit = item.link ? 'to-link' : 'open-modal';
	this.$emit(eventEmit, action);
}

function setBorder(item) {
	const color = item.color === undefined ? 'color(success)' : item.color;
	return `border-bottom: 4px solid ${color}`;
}

function setMaxWidth(item) {
	const maxWidth = item.maxWidth ? `${item.maxWidth}px` : 'min-content';
	return `max-width: ${maxWidth}`;
}

export default {
	name: 'quick-actions',
	methods: {
		actionToDo,
		setBorder,
		setMaxWidth,
	},
	props: {
		actions: Array,
	},
};
</script>

<style lang="scss" scoped>
.actions {
	background: white;
	bottom: 0px;
	left: 0px;
	margin: 0px auto;
	position: fixed;
	right: 0px;
	width: fit-content;

	.actions-bar {
		border: 1px solid map-get($colors, success);
		border-radius: 5px 5px 0 0;
		padding: 0px;
		.action-content {
			@include flex-end;
			height: 50px;
			.action {
				@include flex-center;
				height: 40px;
				margin: 0 5px;
				opacity: 0.3;
				padding: 0px;
				text-align: center;
				transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
				transition-duration: 500ms;
				width: 135px;
				.action-txt {
					@include txt-config(open-regular, small10);
					margin: 0px 0px 0px 5px;
					text-align: left;
				}
			}
			.action:hover {
				margin-top: -20px;
				transform: scale(1.1) translateY(-7px);
			}
			.active {
				opacity: 1;
			}
		}
	}
}
</style>
