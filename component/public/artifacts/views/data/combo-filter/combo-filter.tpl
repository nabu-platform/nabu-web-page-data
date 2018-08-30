<template id="data-combo-filter">
	<div class="data-combo-filter">
		<div class="combo-filter n-input-combo n-component" v-if="filters.length">
			<div class="n-input-combo-label-container" v-auto-close="function() { showLabels = false }" v-if="filters">
				<div class="n-component-label n-input-combo-label" @click="showLabels = !showLabels">
					<span>{{ activeFilter.label ? activeFilter.label : activeFilter.name }}</span><span v-if="filters.length > 1" class="n-icon n-icon-arrow-down fa fa-chevron-down"></span>
				</div>
				
				<ul class="n-input-combo-dropdown n-input-combo-dropdown-labels" v-if="filters.length > 1 && showLabels">
					<li v-for="filter in filters" class="n-input-combo-dropdown-label" :class="{ 'active': filter == activeFilter }" @click="activeFilter = filter" auto-close>
						<slot name="label-dropdown" :label="single"><span>{{ filter.label ? filter.label : filter.name }}</span></slot>
					</li>
				</ul>
			</div>
			<page-form-field :key="activeFilter.name + '_value'" 
				class="combo-filter-field"
				:field="activeFilter" 
				:label="false"
				:value="state[activeFilter.name]"
				:page="page"
				:cell="cell"
				@input="function(newValue) { setFilter(activeFilter, newValue) }"/>
			<button class="primary" v-if="showRefresh" @click="$emit('refresh')"><span class="fa fa-sync"></span></button>
		</div>
	</div>
</template>