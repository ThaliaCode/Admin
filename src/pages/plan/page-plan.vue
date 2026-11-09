<template>
	<div>
		<header-page
			caption-navigation="Perfil"
			title="MI CUENTA" />
		<v-layout wrap pa-4 v-if="getPlans">
			<v-flex xs12 mb-3 v-for="(value, index) in getPlans" :key="index">
				<section-plan :plan="value"/>
			</v-flex>
		</v-layout>	
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import sectionPlan from '@/components/plan/section-plan';

function getPlans() {
	if (this.$userInfo.company.plans) {
		if (Object.keys(this.$userInfo.company.plans).length) {
			const arrayPlans = Object.keys(this.$userInfo.company.plans.plans);
			const plans = arrayPlans.map((a) => {
				const newPlan = { ...this.$userInfo.company.plans.plans[a] };
				newPlan.code = a;
				return newPlan;
			}).sort((a, b) => a.order - b.order);
			return plans;
		}
		return null;
	}
	return null;
}

export default {
	name: 'page-plan',
	computed: {
		getPlans,
	},
	components: {
		headerPage,
		sectionPlan,
	},
};
</script>