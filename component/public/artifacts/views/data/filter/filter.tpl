<template id="page-data-filter-default">
	<div class="page-data-filter-default" v-auto-close.filter="function() { showFilter = false }">
		<span v-if="showRefresh" class="fa fa-refresh" @click="$emit('refresh')"></span>
		<span class="fa fa-search" @click="showFilter = !showFilter" v-if="filters.length"></span>
		<n-form class="layout2 filter" v-if="showFilter">
			<page-form-field v-for="field in filters" :key="field.name + '_value'" :field="field" 
				:value="state[field.name]"
				@input="function(newValue) { setFilter(field, newValue) }"/>
		</n-form>
	</div>
</template>