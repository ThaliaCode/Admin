<template>
	<div class="action-mobile">
		<button @click="toogleAction" v-if="actions.length">
			<img src="/static/img/action-mobile.svg" alt=""  height="30px">
		</button>
		<div 
			class="action-mobile-wrapper"
			:class="{'open': open}">
			<div v-for="action in actions" :key="action.id" class="content-btn">
				<button 
					:disabled="action.disabled" 
					class="btn-action"
					@click="openAction(action)">
					<v-layout class="action-mobile-btn">
						<v-flex xs1>
							<img
								:class="{'disabled-img': action.disabled}"
								:src="action.pathIcon" :alt="action.name" height="12">
						</v-flex>
						<v-flex xs11 text-xs-left pl-2>
							<span
								:class="{'disabled-text': action.disabled}"
								class="text">
								{{ action.name }}
							</span>
						</v-flex>
					</v-layout>
				</button>
			</div>
		</div>
	</div>
</template>
<script>
function created() {
	this.loadData();
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
		const { data: actions } = await this.$httpAcl.get(`sidebar/${appCode}/resource/${uri}`,
			{ params, headers });
		this.actions = actions.data.map((a) => {
			const newAction = { ...a };
			const index = this.valueDisabled.findIndex(val => val.code === a.code);
			newAction.name = a.languages;
			newAction.disabled = index > -1 && this.valueDisabled[index].disabled;
			return newAction;
		});
	} catch (error) {
		this.showGenericError();
	}
}

function actionDisabled(values) {
	this.actions = this.actions.reduce((accum, act) => {
		const newAction = { ...act };
		const index = values.findIndex(v => v.code === act.code);
		newAction.disabled = index > -1 && values[index].disabled;
		accum.push(newAction);
		return accum;
	}, []);
}

function toogleAction() {
	this.open = !this.open;
}

function openAction(item) {
	if (!item.disabled) {
		if (item.code === 'HELP') {
			const helpIndex = this.actions.findIndex(act => act.code === item.code);
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

function data() {
	return {
		actions: [],
		open: false,
	};
}

export default {
	name: 'action-mobile',
	created,
	data,
	methods: {
		loadData,
		toogleAction,
		openAction,
	},
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
	},
};
</script>
<style lang="scss" scoped>
.action-mobile {
	display: none;
	position: relative;

	&-btn {
		.text {
			color: color(primary);
			font-size: 11px;
		}
	}

	&-wrapper {
		background-color: color(white);
		border-radius: 5px;
		box-shadow: 0 2px 4px 0 rgba(177, 177, 177, 0.5);
		display: none;
		padding: 8px 12px;
		width: 231px;
		position: absolute;
    top: 31px;
    right: 0px;
    z-index: 1;
	}

	.open {
		display: block;
	}

	.content-btn {
		border-bottom: 1px solid color(top-background);
		padding: 4px 0;

		&:last-child {
			border-bottom: none;
		}
	}

	.btn-action {
		width: 100% !important;
	}

	.disabled-img {
		filter: grayscale(100%);
		-webkit-filter: grayscale(100%);
		-moz-filter: grayscale(100%);
	}

	.disabled-text {
		color: color(action-disabled);
	}

	@media (max-width: 760px) {
		display: block;
	}
}
</style>