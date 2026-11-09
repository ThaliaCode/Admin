<template>
	<div class="mt-3">
		<label class="label">Tarjetas de crédito</label>
		<v-expansion-panel>
			<v-expansion-panel-content
				class="expansion-credit-card"
				v-for="(cc, index) in items"
				:key="index"
			>
				<div slot="header" class="header-expansion">
					<h4>{{cc.name}}</h4>
					<v-switch
						hide-details
						class="credit-card-activator"
						:color="cc.active ? 'success' : 'error'"
						@click.stop
						v-model="cc.active"
					></v-switch>
				</div>
				<div class="expansion-credit-card-content py-2 px-4">
					<app-select
						chips
						multiple
						item-text="name"
						item-value="id"
						label="Bancos"
						model="creditCards"
						:items="cc.options"
						:item="cc.bankIds"
						:return-object="true"
						@input="sendValue($event, cc)"
					/>
				</div>
			</v-expansion-panel-content>
		</v-expansion-panel>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@accept-button-clicked="$emit('accept-action')"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function sendValue(ev, cc) {
	const { model, value } = ev;
	const newCc = cc;
	newCc.bankIds = [].concat(value);
	newCc.active = !!(newCc.bankIds && newCc.bankIds.length > 0);
	this.$emit('input', { model, value, creditCard: newCc });
}

function data() {
	return {
		disabled: true,
	};
}

export default {
	name: 'DataFastCreditCardComponent',
	components: {
		modalSidebarButton,
	},
	data,
	methods: {
		sendValue,
	},
	props: {
		items: {
			required: true,
			type: Array,
		},
	},
};
</script>
<style lang="scss">
.expansion-credit-card {
	background-color: color(primary-lightest) !important;
	.header-expansion {
		display: flex;
		h4 {
			color: color(primary);
			flex: 1 1 70%;
		}
		.switch {
			flex: 0 0 30%;

			label {
				font-size: size(small);
			}

			.input-group--selection-controls__toggle {
				opacity: 0.5 !important;
			}
		}
	}
	.expansion-credit-card-content {
		background-color: color(silver-detail);
	}
}

.credit-card-activator {
	margin: 0 1rem;
}
</style>