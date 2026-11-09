<template>
	<v-layout class="header-information">
		<v-flex xs3 mr-1 class="item-header-information border-blue">
			<p class="text-label">Punto de venta</p>
			<p class="text-blue">Punto de venta 4</p>
		</v-flex>
		<v-flex xs3 px-1 class="item-header-information border-blue">
			<v-layout>
				<v-flex xs6 mr-1>
					<p class="text-label">Serie</p>
					<p class="text-bold">7657</p>
				</v-flex>
				<v-flex xs6>
					<p class="text-label">Nro</p>
					<p class="text-bold">7657</p>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs1 mr-1 px-1 class="item-header-information border-blue">
			<p class="text-label">Tipo</p>
			<p class="text-blue">Elec.</p>
		</v-flex>
		<v-flex xs2 pt-1 class="item-header-information">
			<app-date-select
				:date-formatted="params.startDate"
				model="startDate"
				@input="setDate"
			/>
		</v-flex>
	</v-layout>
</template>
<script>
import { format } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function data() {
	return {
		params: {
			startDate: format(this.$today(), 'YYYY-MM-DD'),
		},
		startDate: null,
	};
}
export default {
	name: 'header-information',
	components: {
		appDateSelect,
	},
	data,
	methods: {
		setDate,
	},
};
</script>
<style lang="scss" scoped>
	.text-label {
		font-size: 10px;
		margin-bottom: 2px;
	}

	.header-information {
		justify-content: flex-end;
		
		p {
			margin-bottom: 0;
		}
	}

	.text-blue {
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: 14px;
	}

	.text-bold {
		font-family: font(open-bold);
	}

	.border-blue {
		position: relative;

		&::before {
			border: 0.5px solid color(background-sidebar);
			content: '';
			height: 20px;
			position: absolute;
			right: 0;
			top: 10px;
		}
	}
</style>