<template>
	<private-view v-if="!isAdmin" title="401: Unauthorized">
		<v-info icon="block" title="Unauthorized Access" type="danger">
			You do not have permission to access this page
		</v-info>
	</private-view>

	<private-view v-else :title="page_title">
		<template v-if="breadcrumb" #headline>
			<v-breadcrumb :items="breadcrumb" />
		</template>

		<template #navigation>
			<page-navigation :current="page" :pages="all_pages" />
		</template>

		<div class="lp-container">
			<div class="lp-banner" v-if="page_banner">
				<img :src="page_banner" alt="" />
			</div>
			<div class="lp-cards" v-if="page_cards">
				<div class="lp-card" v-for="card in page_cards.filter(item => (item.uri != page))" :key="card.uri"
					:style="`background-color: ${card.color}`" @click="change_page(card.to)">
					<v-icon :name="card.icon" />
					<span class="lp-card-title">{{ card.label }}</span>
				</div>
			</div>
			<div class="lp-body" v-if="page_body" v-html="page_body"></div>
		</div>

		<router-view name="landing-page" :page="page" />
	</private-view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';
import { useRouter } from 'vue-router';

import PageNavigation from './components/navigation.vue';
import useDirectusToken from './use-directus-token';
import { log } from 'console';
import type { PageDto } from "./dto/types.dto"

const { usePermissionsStore, useUserStore, useSettingsStore } = useStores();
/*
useAppStore: function a(u, P)​
useCollectionsStore: function a(u, P)​
useFieldsStore: function a(u, P)​
useFlowsStore: function a(u, P)​
useInsightsStore: function a(u, P)​
useLatencyStore: function a(u, P)​
useNotificationsStore: function a(u, P)​
usePermissionsStore: function a(u, P)​
usePresetsStore: function a(u, P)​
useRelationsStore: function a(u, P)​
useRequestsStore: function a(u, P)​
useServerStore: function a(u, P)​
useSettingsStore: function a(u, P)​
useUserStore: function a(u, P)
*/

console.log("useStores(): ", useStores());
console.log("usePermissionsStore(): ", usePermissionsStore());
console.log("useUserStore(): ", useUserStore());
console.log("useSettingsStore(): ", useSettingsStore());

const props = defineProps({
	page: {
		type: String,
		default: 'home',
	},
});


const router = useRouter();
const api = useApi();
const { addTokenToURL } = useDirectusToken(api);
const isAdmin = ref(<boolean>useUserStore().isAdmin);
console.log("isAdmin:", isAdmin.value);
const page_title = ref('');
const page_banner = ref('');
const page_cards = ref<PageDto[]>([]);
const page_body = ref('');
const breadcrumb = ref([
	{
		name: 'Home',
		to: `/landing-page`,
	},
]);
const all_pages = ref<PageDto[]>([]);

watch(
	() => props.page,
	() => {
		render_page(props.page);
	}
);

const change_page = (to) => {
	const next = router.resolve(`${to}`);
	router.push(next);
};


const render_page = (page) => {
	if (page === null) {
		page_title.value = '500: Internal Server Error';
		breadcrumb.value.splice(1, 1);
		page_banner.value = '';
		page_cards.value = [];
		page_body.value = '';
	} else {
		switch (page) {
			case 'home':
				page_title.value = 'Home';
				page_banner.value = addTokenToURL('/assets/83BD365C-C3CE-4015-B2AD-63EDA9E52A69?width=2000&height=563&fit=cover');
				page_cards.value = all_pages.value;
				page_body.value = '<p>Lorem ipsum dolor sit amet.</p>';
				break;
			case 'hello-world':
				page_title.value = 'Hello World';
				page_banner.value = addTokenToURL('/assets/853B243D-A1BF-6051-B1BF-23EDA8E32A09?width=2000&height=563&fit=cover');
				page_cards.value = all_pages.value;
				page_body.value = '<p>Lorem ipsum dolor sit amet.</p>';
				break;
			case 'contact':
				page_title.value = 'Contact Us';
				page_banner.value = addTokenToURL('/assets/91CE173D-A1AD-4104-A1EC-74FCB8F41B58?width=2000&height=563&fit=cover');
				page_cards.value = [];
				page_body.value = '<p>Lorem ipsum dolor sit amet.</p>';
				break;
			default:
				page_title.value = '404: Not Found';
		}

		if (page === 'home') {
			breadcrumb.value.splice(1, 1);
		} else {
			breadcrumb.value[1] = {
				name: page_title.value,
				to: `/fastbs.module/${page}`,
			};
		}
	}
};

const fetch_all_pages = () => {
	all_pages.value = [
		{
			label: 'Home',
			uri: 'fastbs.module',
			to: '/fastbs.module',
			icon: 'home',
			color: '#6644FF',
		},
		{
			label: 'Hello World',
			uri: 'hello-world',
			to: '/fastbs.module/hello-world',
			icon: 'public',
			color: '#2ECDA7',
		},
		{
			label: 'Contact Us',
			uri: 'contact',
			to: '/fastbs.module/contact',
			icon: 'phone',
			color: '#3399FF',
		},
	];
	console.log(all_pages.value);
};

render_page(props.page);
fetch_all_pages();

</script>

<style lang="scss">
.lp-container {
	padding: var(--content-padding);
	padding-top: 0;
	width: 100%;
	max-width: 1024px;

	&>div {
		margin-bottom: var(--content-padding);
	}
}

.lp-banner {
	border-radius: var(--border-radius);
	overflow: hidden;

	img {
		display: block;
		width: 100%;
	}
}

.lp-cards {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	column-gap: var(--input-padding);
	row-gap: var(--input-padding);

	.lp-card {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
		border-radius: var(--border-radius);
		padding: var(--input-padding);
		color: white;

		.v-icon {
			width: 100%;
			height: 50px;
			margin-bottom: 6px;

			i {
				font-size: 50px;
				color: white;
			}
		}

		.lp-card-title {
			display: block;
			font-weight: bold;
			font-size: 1.4em;
			line-height: 1.2;
		}
	}
}
</style>