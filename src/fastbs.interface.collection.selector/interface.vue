<template>
	<v-select v-model="newValue" :items="collections" :disabled="disabled" :placeholder="placeholder"
		:showDeselect="true" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useStores } from '@directus/extensions-sdk';

const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
	collection: {
		type: String,
		required: true,
	},
	field: {
		type: String,
		required: true,
	},
	value: {
		type: String,
		required: true,
	},
	placeholder: {
		type: String,
		default: 'Выберите коллекцию',
	},
});

const emit = defineEmits(['input']);

console.log(">>> useStores():", useStores());
const { useCollectionsStore, useSettingsStore, useAppStore } = useStores();
const collectionsStore = useCollectionsStore();
console.log(">>> useSettingsStore():", useSettingsStore());
console.log(">>> useAppStore():", useAppStore());

let init = true;
const newValue = ref("");
const collections = ref(collectionsStore.allCollections.map(x => { return { "text": x.collection, value: x.collection }; }));

watch(() => props.value, (nv, pv) => {
	if (init) {
		console.log(">>> Field:", props.field, "  props.value new value: ", nv);
		newValue.value = nv;
	}
});

watch(() => newValue.value, (nv, pv) => {
	if (!init) {
		console.log(">>> Field:", props.field, "  emit:", nv);
		emit('input', nv);
	}
	init = false;
})

</script>
