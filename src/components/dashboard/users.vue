<template>
	<div>
		<v-layout mt-5 px-3>
			<v-flex xs12 px-4>
				<label>Usuarios</label>
				<v-select
					chips
					clearable
					solo
					multiple
					autocomplete
					hide-details
					color="primary"
					item-text="name"
					item-value="id"
					label="Usuarios"
					:items="customers"
					v-model="employeesId"
				>
					<template slot="selection" slot-scope="data">
						<v-chip
							color="primary"
							outline
							:selected="data.selected"
							close
							@input="remove(data.item)"
						>
							<strong>{{ data.item.name }}</strong>&nbsp;
						</v-chip>
					</template>
				</v-select>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendUsers"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.employeesId = this.users.map(u => u.id);
}

async function sendUsers() {
	const body = { employeesId: this.employeesId };
	try {
		await this.$httpSales.patch(`terminals-assignment/${this.idPoint}`, body);
		this.showNotification('Se configuró correctamente los usuarios');
		this.$emit('update');
	} catch (error) {
		this.showGenericError();
	}
}

function remove(item) {
	const index = this.employeesId.indexOf(item.id);
	if (index > -1) {
		this.employeesId.splice(index, 1);
	}
}

function data() {
	return {
		employeesId: [],
	};
}

export default {
	name: 'users',
	data,
	components: {
		modalSidebarButton,
	},
	created,
	methods: {
		sendUsers,
		remove,
	},
	props: {
		customers: {
			type: Array,
			default: () => [],
		},
		users: {
			type: Array,
			default: () => [],
		},
		idPoint: [String, Number],
	},
};
</script>