<template id="nabu-data-filter-default">
	<div class="nabu-data-filter-default" v-auto-close.filter="function() { showFilter = false }">
		<span v-if="showRefresh" class="n-icon n-icon-refresh" @click="$emit('refresh')"></span>
		<span class="n-icon n-icon-search" @click="showFilter = !showFilter" v-if="filters.length"></span>
		<n-form class="layout2 filter" v-if="showFilter">
			<n-dashboard-form-field v-for="field in filters" :key="field.name + '_value'" :field="field" 
				:value="state[field.name]"
				@input="function(newValue) { setFilter(field, newValue) }"/>
		</n-form>
	</div>
</template>