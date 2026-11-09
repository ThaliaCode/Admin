<template>
	<v-layout wrap class="group-notification">
		<v-flex
			xs12 class="notifications"
			:class="{ 'selected' : notification.flagActive }"
			v-for="(notification, indexNotification) in notifications" 
			:key="notification.indexNotification"
		>
			<v-checkbox
				color="success"
				hide-details
				:label="notification.name"
				v-model="notification.flagActive"
				@change="$emit('on-change')"
			></v-checkbox>
			<div 
				class="wrapper-template mt-2" 
				v-if="notification.flagActive"
			>
				<v-layout 
					wrap class="item-template"
					:class="{ 'select' : template.flagActive }"
					v-for="(template, indexTemplate) in notification.templates"
					:key="indexTemplate"
				>
					<v-flex xs5>
						<span>{{ template.name }}</span>
					</v-flex>
					<v-flex xs7>
						<div 
							v-if="!template.flagActive" 
							class="text-xs-right"
						>
							<button 
								class="btn-notification btn-green"
								:disabled="isDisabled(indexNotification)"
								@click="$emit('assign-template', { indexNotification, indexTemplate, value: true })"
							>
								Asignar
							</button>
						</div>
						<div v-else>
							<div class="layout">
								<div class="layout">
									<v-icon color="primary" class="pt-1">check_circle_outline</v-icon>
									<span class="text-green pt-2 ml-1">asignado</span>
								</div>
								<div>
									<button 
										class="btn-notification btn-red"
										@click="$emit('assign-template', { indexNotification, indexTemplate, value: false } )"
									>
										Desasignar
									</button>
								</div>
							</div>
						</div>
					</v-flex>
				</v-layout>
			</div>
		</v-flex>
	</v-layout>
</template>
<script>
function isDisabled(indexNotification) {
	return this.notifications[indexNotification].templates.some(t => t.flagActive);
}

function data() {
	return {
		selectedNotifications: [],
	};
}

export default {
	name: 'group-notification',
	data,
	methods: {
		isDisabled,
	},
	props: {
		notifications: {
			default: () => [],
			type: Array,
		},
	},
};
</script>
<style lang="scss">
	.group-notification {
		label {
			color: color(primary) !important;
			font-weight: 600;
		}

		.notifications {
			background: color(white);
			padding: 20px;

			&:nth-child(odd) {
				background: color(group);
			}

			&.selected {
				border: 1px solid color(primary);
			}
		}

		.wrapper-template {
			padding-left: 32px;
		}

		.item-template {
			border-top: 1px solid color(btn-toggle-text);
			padding: 10px;

			&.select {
				background: color(item-select);
			}
		}

		.btn-notification {
			border-radius: 5px;
			font-size: size(small11);
			padding: 8px 16px;

			&.btn-green {
				border: 1px solid color(primary);
				color: color(primary);
			}

			&.btn-red {
				border: 1px solid color(error);
				color: color(error);
			}
		}

		.text-green {
			color: color(primary);
			font-size: size(small11);
		}
	}
</style>