<template>
	<div>
		<v-layout wrap px-3 mt-3>
			<v-flex xs12 mb-2>
				<v-layout align-center>
					<v-flex
					:class="account.account.length > 10 ? 'xs4' : 'xs2'"
					pt-4 v-if="!edit">
						<span>{{ edit ? account.accountingAccountCode : account.account }}</span>
					</v-flex>
					<v-flex
					:class="account.account.length > 10 ? 'xs8' : 'xs10'">
						<app-input-text
							label="Cuenta Contable"
							model="account"
							:text="accountNew.account"
							@input="setData"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 mb-2>
				<app-input-text
					label="Nombre"
					model="name"
					:text="accountNew.name"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs12>
				<app-input-text
					label="Descripción"
					model="description"
					:text="accountNew.description"
					@input="setData"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="false"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="$emit('save', accountNew)"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.accountFather = this.account.name;
	if (this.edit) {
		this.accountNew = {
			description: this.account.description,
			name: this.account.name,
		};
		if (this.account.accountingAccountCode) {
			const index = this.account.account.indexOf(this.account.accountingAccountCode);
			const arrayAccount = this.account.account.split('');
			arrayAccount.splice(index, 2);
			// const indexPoint = arrayAccount.indexOf('.');
			// arrayAccount.splice(indexPoint, 1);
			this.accountNew.account = arrayAccount.join('');
		} else {
			this.accountNew.account = this.account.account;
		}
	}
}

function setData({ model, value }) {
	this.accountNew[model] = value;
}

function data() {
	return {
		accountNew: {},
		accountFather: null,
	};
}
export default {
	name: 'create-item-account',
	data,
	components: {
		modalSidebarButton,
	},
	methods: {
		setData,
	},
	created,
	props: {
		account: {
			type: Object,
			default: () => {},
		},
		edit: Boolean,
	},
};
</script>