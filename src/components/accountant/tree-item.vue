<template>
	<v-flex xs12 class="background">
		<v-layout wrap align-center class="body-row" :class="{ 'body-row-color' : index % 2 }">
			<v-flex
				v-for="column in columns"
				:key="column.id"
				text-xs-left
				class="row-height border-right border-left"
				:class="{ 'bold': isOpen, 'px-4': column.value === 'actions', [column.class] : column.class }"
				:style="isFolder ? `padding-left: calc(${item.level} * 10px)` : `color: #0071d6; padding-left: 9px`"
				@click="toggle"
			>
				<span
					v-if="isFolder && column.icon"
					:class="{ 'pl-0': item.level === 1 }"
				>
					<v-btn icon class="ma-0 btn-action btn-auto">
						<v-icon color="primary" size="18">
							<template v-if="isOpen">
								remove_circle_outline
							</template>
							<template v-else>
								add_circle_outline
							</template>
						</v-icon>
					</v-btn>
				</span>
				<span
					v-if="column.edit"
					class="align-center"
					:style="`display: inline-block;`"
				>
					<template v-if="item.accountingAccountCode && item.level === 2">
						<app-input-text
							:model="column.value"
							:text="item[column.value]"
							type="number"
							@input="$emit('get-data', { item, info: $event })"
							@input-enter="$emit('save-balance', item)"
						></app-input-text>
					</template>
					<template v-else>
						{{ item[column.value] }}
					</template>
				</span>
				<span
					class="align-center"
					:class="{ 'pl-0': item.accountingAccountCode && !isFolder, 'ml-0' : column.value === 'accumulated' }"
					:style="!isFolder ? `margin-left: calc((${item.level} * 17px) + (10px * (${item.level} - 2)))` : `margin-left: 11px`"
					v-else-if="column.value !== 'actions'"
				>
					<template v-if="column.round">
						{{ item[column.value] | round }}
					</template>
					<template v-else-if="!createPlan && column.value === 'name'">
						<template v-if="item[column.value].length > 40">
							<v-tooltip top>
								<span slot="activator">{{ item[column.value] | limitTo(39) }}</span>
								<span>{{ item[column.value] }}</span>
							</v-tooltip>
						</template>
						<template v-else>
							{{ item[column.value] }}
						</template>
					</template>
					<template v-else-if="!createPlan && column.value === 'account' && isPeru && showNameCode">
						<template>
							{{ item.account }}
							<template>
								<span v-if="item.name.length < 15">{{ item.name }}</span>
								<v-tooltip top v-else>
									<span slot="activator">
										{{ item.name | limitTo(15) }}
									</span>
									<span>{{ item.name }}</span>
								</v-tooltip>
							</template>
						</template>
					</template>
					<template v-else-if="createPlan && column.value === 'name'">
						<template v-if="item.codeCreated">
							{{ item.codeCreated }} - {{ item[column.value] }}
						</template>
						<template v-else>
							{{ item[column.value] }}
						</template>
					</template>
					<template v-else>
						<template v-if="item[column.value]">
							<template v-if="item[column.value].length > 40">
								<v-tooltip top>
									<span slot="activator">{{ item[column.value] | limitTo(39) }}</span>
									<span>{{ item[column.value] }}</span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ item[column.value] }}
							</template>
						</template>
					</template>
				</span>
				<span v-else class="wrapper-action">
					<app-tooltip-button
						color="accent"
						:disabled="disabledCreate()"
						icon="add"
						text="Agregar"
						@click-icon="$emit('add-account', item)"
					/>
					<app-tooltip-button
						v-if="item.level > 1"
						color="success"
						:disabled="disabledEdit()"
						icon="edit"
						text="Editar"
						@click-icon="$emit('edit-account', item)"
					/>
					<app-tooltip-button
						v-if="item.level > 1"
						color="error"
						icon="delete"
						text="Eliminar"
						@click-icon="$emit('delete-account', item)"
					/>
				</span>
			</v-flex>
			<v-layout wrap v-show="isOpen" v-if="isFolder">
				<tree-item
					:columns="columns"
					:create-plan="createPlan"
					class="item"
					v-for="(child, index) in item.details"
					:key="index"
					:item="child"
					:open="child.open"
					@add-account="$emit('add-account', $event)"
					@add-item="$emit('add-item', $event)"
					@delete-account="$emit('delete-account', $event)"
					@get-data="$emit('get-data', $event)"
					@edit-account="$emit('edit-account', $event)"
					@make-folder="$emit('make-folder', $event)"
					@row-expanded="$emit('row-expanded', $event)"
					@save-balance="$emit('save-balance', $event)"
				></tree-item>
			</v-layout>
		</v-layout>
	</v-flex>
</template>
<script>
	import appTooltipButton from '@/components/shared/app-tooltip-button';

	function disabledCreate() {
		return this.createPlan && !this.item.codeCreated;
	}

	function disabledEdit() {
		return this.item.accountingAccountCode && this.createPlan && !this.item.codeCreated;
	}

	function isFolder() {
		return (this.item.flagParent && !this.item.details) ||
			(this.item.details && this.item.details.length > 0);
	}

	function toggle() {
		if (this.isFolder) {
			if (!this.item.details) {
				this.$emit('row-expanded', this.item);
			}
			this.isOpen = !this.isOpen;
		}
	}

	function open(val) {
		this.isOpen = val;
	}

	function data() {
		return {
			isOpen: false,
		};
	}

	export default {
		name: 'tree-item',
		components: {
			appTooltipButton,
		},
		computed: {
			isFolder,
		},
		data,
		methods: {
			disabledCreate,
			disabledEdit,
			toggle,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			createPlan: {
				default: false,
				type: Boolean,
			},
			index: [Number, String],
			item: Object,
			open: {
				default: false,
				type: Boolean,
			},
			showNameCode: {
				default: false,
				type: Boolean,
			},
		},
		watch: {
			open,
		},
	};
</script>

<style lang="scss" scoped>
	.body-row {
		background-color: color(white);
		color: #2c404a;
		font-family: font(open-regular);
		font-size: size(small11);

		&-color {
			background-color: #f4f6f8;
		}
	}

	.bold {
		font-family: font(open-bold);
	}

	.border-left {
		border-left: 1px solid #e0e5e8;
	}

	.border-right {
		border-right: 1px solid #e0e5e8;
	}

	.row-height {
		border-bottom: 1px solid #e0e5e8;
		height: 30px;
		line-height: 28px;

		.align-center {
			vertical-align: top;
		}
	}

	.wrapper-action {
		display: flex;
		justify-content: space-around;
		width: 100%;
	}
</style>