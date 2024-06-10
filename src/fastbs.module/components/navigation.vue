<template>
	<v-list nav v-if="pages">
		<v-list-item v-for="navItem in pages" :key="navItem.to" :active="navItem.uri == current" :to="navItem.to">
			<v-list-item-icon><v-icon :name="navItem.icon" :color="navItem.color" /></v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="navItem.label" />
			</v-list-item-content>
		</v-list-item>
	</v-list>
</template>


<script lang="ts" setup>
import { PageDto } from '../dto/types.dto';

/* const props = defineProps({
	current: {
		type: String,
		default: null,
	},
	pages: {
		type: <PageDto[]>[],
		default: [],
	}
}); */

const props = defineProps<{
	current: string;
	pages: PageDto[];
}>()

defineOptions({
	name: 'PageNavigation',
	inheritAttrs: false
});

</script>