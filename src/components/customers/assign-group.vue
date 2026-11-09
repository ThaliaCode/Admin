<template>
	<div>
		<v-layout wrap align-center px-4 py-3>
			<v-flex xs12 md12>
				<v-layout>
					<v-flex xs11 mb-3>
						<template v-if="multiSelect">
							<v-checkbox
								v-for="(item, index) in groups"
								:key="index"
								color="primary"
								:label="item.name"
								:value="item.id"
								v-model="selectedGroups"
								style="margin-bottom: -20px;"
							></v-checkbox>
						</template>
						<template v-else>
							<v-radio-group v-model="groupId">
								<v-radio
									v-for="(item, index) in groups"
									:key="index"
									color="primary"
									class="mb-3"
									:label="item.name"
									:value="item.id"
								></v-radio>
							</v-radio-group>
						</template>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="assignGroup"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typeEntityId from '@/shared/type-entity';

function created() {
	this.loadGroups();
}

async function loadGroups() {
	const params = { typeEntityId: this.showCustomer ?
		typeEntityId.Customer : typeEntityId.Distributor };
	if (this.isGeneralIdTwo) {
		params.typeGeneralId = 2;
	}
	({ data: this.groups } = await this.$httpSalesRead.get('group', { params }));
}

function closeModal() {
	this.$emit('close-modal');
}

function assignGroup() {
	this.$emit('assign-group', this.multiSelect ? this.selectedGroups : this.groupId);
}

function data() {
	return {
		groupId: null,
		selectedGroups: [],
	};
}

export default {
	name: 'assign-group',
	created,
	data,
	components: {
		modalSidebarButton,
	},
	methods: {
		assignGroup,
		closeModal,
		loadGroups,
	},
	props: {
		isGeneralIdTwo: {
			default: false,
			type: Boolean,
		},
		groups: {
			default: () => [],
			type: Array,
		},
		showCustomer: {
			default: false,
			type: Boolean,
		},
		multiSelect: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.content-list-prices {
	background-color: map-get($colors, title-table);
	margin-bottom: 3px;
	padding: 11px 19px;
}
</style>