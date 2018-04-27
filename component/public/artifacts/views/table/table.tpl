<template id="dashboard-table">
	<div class="dashboard-cell dashboard-table">
		<n-sidebar @close="configuring = false" v-if="configuring" class="settings">
			<n-form class="layout2">
				<n-collapsible title="Table Settings">
					<n-form-combo label="Operation" :value="operation" :filter="getOperations"
						@input="updateOperation"
						:formatter="function(x) { return x.id }"/>
					<n-form-text v-model="cell.state.title" label="Title"/>
					<n-form-text v-model="cell.state.limit" label="Limit" :timeout="600" @input="load()"/>
				</n-collapsible>
				<n-collapsible title="Refresh">
					<div class="list-actions">
						<button @click="cell.state.refreshOn.push(null)">Add Refresh Listener</button>
					</div>
					<div v-for="i in Object.keys(cell.state.refreshOn)" class="list-row">
						<n-form-combo v-model="cell.state.refreshOn[i]"
							:items="$services.page.instances[page.name].getAvailableEvents()"/>
						<button @click="cell.state.refreshOn.splice(i, 1)"><span class="n-icon n-icon-trash"></span></button>
					</div>
					<n-form-switch v-model="cell.state.showRefresh" label="Show Refresh Option"/>
				</n-collapsible>
				<n-collapsible title="Mapping" class="mapping" v-if="parameters.length">
					<n-page-mapper :to="parameters" :from="availableParameters" 
						v-model="cell.bindings"/>
				</n-collapsible>
				<n-collapsible title="Events" class="list">
					<div class="list-actions">
						<button @click="addAction">Add Event</button>
					</div>
					<n-collapsible class="list-item" :title="action.name" v-for="action in cell.state.actions">
						<n-form-text v-model="action.name" label="Name" :required="true"/>
						<n-form-switch v-model="action.global" label="Global" />
						<n-form-switch v-model="action.useSelection" v-if="action.global" label="Use Selection" />
						<n-form-text v-model="action.icon" v-if="!action.global" label="Icon"/>
						<n-form-text v-model="action.label" v-else label="Label"/>
						<n-form-text v-model="action.condition" label="Condition"/>
						<n-form-switch v-model="action.refresh" label="Reload"/>
						<div class="list-item-actions">
							<button @click="removeAction(action)"><span class="n-icon n-icon-trash"></span></button>
						</div>
					</n-collapsible>
				</n-collapsible>
				<n-collapsible title="Filters" v-if="cell.state.filters.length || filtersToAdd().length" class="list">
					<div class="list-actions">
						<button @click="addFilter" v-if="filtersToAdd().length">Add Filter</button>
					</div>
					<n-collapsible class="list-item" :title="filter.label ? filter.label : filter.field" v-for="filter in cell.state.filters">
						<n-form-combo v-model="filter.field" label="Field" :items="filtersToAdd(true)"/>
						<n-form-text v-model="filter.label" label="Label" />
						<n-form-combo v-model="filter.type" label="Type" :items="['text', 'enumeration', 'date', 'number', 'fixed']"/>
						<div class="list-actions">
							<button v-if="filter.type == 'enumeration'" @click="filter.enumerations.push('')">Add enumeration</button>
						</div>
						<n-form-section class="list-row" v-if="filter.type == 'enumeration'" v-for="i in Object.keys(filter.enumerations)">
							<n-form-text v-model="filter.enumerations[i]"/>
							<button @click="filter.enumerations.splice(i, 1)"><span class="n-icon n-icon-trash"></span></button>
						</n-form-section>
						<n-form-text v-model="filter.value" v-if="filter.type == 'fixed'" label="Fixed Value"/>
					</n-collapsible>
				</n-collapsible>
				<n-collapsible title="Formatters" class="list">
					<n-collapsible class="list-item" :title="cell.state.result[key].label ? cell.state.result[key].label : key" v-for="key in keys">
						<n-form-combo v-model="cell.state.result[key].format" :label="'Format ' + key + ' as'"
							:items="['hidden', 'link', 'date', 'dateTime', 'time']"/>
						<n-form-text v-model="cell.state.result[key].label" :label="'Label for ' + key" 
							v-if="cell.state.result[key].format != 'hidden'"/>
					</n-collapsible>
				</n-collapsible>
				<n-collapsible title="Styling" class="list">
					<n-collapsible class="list-item" :title="key" v-for="key in keys">
						<div class="list-item-actions">
							<button @click="addStyle(key)">Add Style for {{key}}</button>
						</div>
						<n-form-section class="list-row" v-for="style in cell.state.result[key].styles">
							<n-form-text v-model="style.class" label="Class"/>
							<n-form-text v-model="style.condition" label="Condition"/>
							<button @click="cell.state.result[key].styles.splice(cell.state.result[key].styles.indexOf(style), 1)"><span class="n-icon n-icon-trash"></span></button>
						</n-form-section>
					</n-collapsible>
				</n-collapsible>
			</n-form>
		</n-sidebar>
		<h2 v-if="cell.state.title">{{cell.state.title}}</h2>
		<div class="cell-actions" v-auto-close.filter="function() { showFilter = false }">
			<span v-if="cell.state.showRefresh" class="n-icon n-icon-refresh" @click="load(0)"></span>
			<span class="n-icon n-icon-search" @click="showFilter = !showFilter" v-if="filterable"></span>
			<n-form class="layout2 filter" v-if="showFilter">
				<div v-for="filter in cell.state.filters.filter(function(x) { return x.type != 'fixed' })">
					<n-form-combo :label="filter.label ? filter.label : filter.field" v-if="filter.type == 'enumeration'" :items="filter.enumerations"
						:value="filters[filter.field]" @input="function(newValue) { setFilter(filter, newValue) }"/>
					<n-form-text v-else-if="filter.type == 'text'" :label="filter.label ? filter.label : filter.field" :value="filters[filter.field]"
						@input="function(newValue) { setFilter(filter, newValue) }"
						:timeout="600"/>
				</div>
			</n-form>
		</div>
		<table class="classic dashboard" cellspacing="0" cellpadding="0" :class="tableClass">
			<thead>
				<tr>
					<td @click="sort(key)" 
							v-for="key in keys" v-if="!isHidden(key)"><span>{{ cell.state.result[key].label ? cell.state.result[key].label : key }}</span>
						<span class="n-icon n-icon-sort-asc" v-if="cell.state.orderBy.indexOf(key) >= 0"></span>
						<span class="n-icon n-icon-sort-desc" v-if="cell.state.orderBy.indexOf(key + ' desc') >= 0"></span>
					</td>
					<td v-if="actions.length"></td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="record in records" @click="trigger(null, record)" :class="{'selected': lastTriggered == record}">
					<td :class="getDynamicClasses(key, record)" v-for="key in keys" v-if="!isHidden(key)" v-html="interpret(key, record[key])"></td>
					<td class="actions" v-if="actions.length" @mouseover="actionHovering = true" @mouseout="actionHovering = false">
						<button v-if="!action.condition || isCondition(action.condition, record)" v-for="action in actions" @click="trigger(action, record)"><span class="n-icon" :class="'n-icon-' + action.icon"></span></button>
					</td>
				</tr>
			</tbody>
		</table>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false"/>
		<div class="global-actions" v-if="globalActions">
			<button :disabled="action.useSelection && !lastTriggered" v-for="action in globalActions" 
				@click="trigger(action, action.useSelection ? lastTriggered : (cell.on ? $services.page.instances[page.name].variables[cell.on] : {}))">{{action.label}}</button>
		</div>
	</div>
</template>