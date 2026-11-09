<template>
	<div
		class="action-bar-container"
		:style="`height: calc(48px * ${actions.length})`"
	>
		<action
			v-for="action in actions"
			:key="action.id"
			:action="action"
			:disabled="action.disabled"
			:hot-keys="action.hotKeys"
			@open-action="openAction(action)"
		/>
	</div>
</template>

<script>
	import action from './action';

	function created() {
		this.loadData();
	}

	function actionDisabled(values) {
		this.actions = this.actions.reduce((accum, act) => {
			const newAction = { ...act };
			const index = values.findIndex(v => v.code === act.code);
			newAction.disabled = index > -1 && values[index].disabled;
			newAction.showMessage = index > -1 ? values[index].showMessage || false : false;
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
			const { data: actions } = await this.$httpAcl.get(`sidebar/${appCode}/resource/${uri}`,
				{ params, headers });
			// const actionHelp = {
			// 	id: actions.length + 1,
			// 	code: 'HELP',
			// 	icon: 'help',
			// 	name: 'Necesitas Ayuda?',
			// };
			this.actions = actions.data.map((actionSingle) => {
				const newAction = { ...actionSingle };
				const index = this.valueDisabled.findIndex(val => val.code === actionSingle.code);
				newAction.name = actionSingle.languages;
				newAction.disabled = index > -1 && this.valueDisabled[index].disabled;
				return newAction;
			});
			// this.actions.push(actionHelp);
		} catch (err) {
			this.showGenericError();
		}
	}

	function openAction(item) {
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

	function data() {
		return {
			actions: [],
		};
	}

	export default {
		name: 'action-bar',
		components: {
			action,
		},
		created,
		data,
		methods: {
			loadData,
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
	.action-bar-container {
		bottom: 0;
		margin: auto 0;
		position: fixed;
		right: 0;
		text-align: right;
		top: 0;
		width: 0px;
	}
</style>