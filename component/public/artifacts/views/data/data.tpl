<template id="dashboard-data">
	<div class="dashboard-data">
		<n-sidebar @close="configuring = false" v-if="configuring" class="settings">
			<n-form class="layout2">
				<n-collapsible title="Dashboard Settings">
					<n-form-combo label="Operation" :value="operation" :filter="$services.dashboard.getDataOperations"
						@input="updateOperation"
						:formatter="function(x) { return x.id }"/>
					<n-form-text v-model="cell.state.title" label="Title"/>
					<n-form-text v-model="cell.state.limit" v-if="hasLimit" label="Limit" :timeout="600" @input="load()"/>
					<n-form-combo label="Filter Type" :items="$window.nabu.page.providers('data-filter')" v-model="cell.state.filterType"
						:formatter="function(x) { return x.name }"/>
					<n-form-text v-if="cell.state.filterType == 'combo'" v-model="cell.state.filterPlaceHolder" label="Combo placeholder"/>
					<slot name="main-settings"></slot>
				</n-collapsible>
				<n-collapsible title="Refresh">
					<div class="list-actions">
						<button @click="cell.state.refreshOn.push(null)">Add Refresh Listener</button>
					</div>
					<div v-for="i in Object.keys(cell.state.refreshOn)" class="list-row">
						<n-form-combo v-model="cell.state.refreshOn[i]"
							:items="$services.page.instances[page.name].getAvailableEvents()"/>
						<button @click="cell.state.refreshOn.splice(i, 1)"><span class="fa fa-trash"></span></button>
					</div>
					<n-form-switch v-model="cell.state.showRefresh" label="Show Refresh Option"/>
				</n-collapsible>
				<n-collapsible title="Mapping" class="mapping" v-if="Object.keys(inputParameters.properties).length">
					<n-page-mapper :to="inputParameters" :from="availableParameters" 
						v-model="cell.bindings"/>
				</n-collapsible>
				<n-collapsible title="Events" class="list">
					<div class="list-actions">
						<button @click="addAction">Add Event</button>
					</div>
					<n-collapsible class="list-item" :title="action.name" v-for="action in cell.state.actions">
						<n-form-text v-model="action.name" label="Name" :required="true"/>
						<n-form-combo v-model="action.class" :filter="$services.page.getSimpleClasses" label="Class"/>
						<n-form-switch v-model="action.global" label="Global" />
						<n-form-switch v-model="action.useSelection" v-if="action.global" label="Use Selection" />
						<n-form-text v-model="action.icon" v-if="!action.global" label="Icon"/>
						<n-form-text v-model="action.label" v-else label="Label"/>
						<n-form-text v-model="action.condition" label="Condition"/>
						<n-form-switch v-model="action.refresh" label="Reload"/>
						<div class="list-item-actions">
							<button @click="removeAction(action)"><span class="fa fa-trash"></span></button>
						</div>
					</n-collapsible>
				</n-collapsible>
				<nabu-form-configure title="Filters" v-if="cell.state.filters.length || filtersToAdd().length"
					:fields="cell.state.filters" 
					:possible-fields="filtersToAdd()"/>
				<nabu-page-fields-edit :cell="cell" :page="page" :keys="keys"/>
				<n-collapsible title="Formatters" class="list" v-if="false">
					<n-collapsible class="list-item" :title="cell.state.result[key].label ? cell.state.result[key].label : key" v-for="key in keys">
						<n-form-text v-model="cell.state.result[key].label" :label="'Label for ' + key" 
							v-if="cell.state.result[key].format != 'hidden'"/>
						<n-form-combo v-model="cell.state.result[key].format" :label="'Format ' + key + ' as'"
							:items="['hidden', 'link', 'date', 'dateTime', 'time', 'masterdata', 'custom']"/>
						<n-ace v-if="cell.state.result[key].format == 'custom'" mode="javascript" v-model="cell.state.result[key].custom"/>
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
							<button @click="cell.state.result[key].styles.splice(cell.state.result[key].styles.indexOf(style), 1)"><span class="fa fa-trash"></span></button>
						</n-form-section>
					</n-collapsible>
				</n-collapsible>
				<n-collapsible title="Advanced" v-if="false" comment="currently disabled, transforming data is tricky because we lose definition">
					<n-ace :timeout="600" v-model="cell.state.transform" mode="javascript"/>
				</n-collapsible>
				<slot name="settings"></slot>
			</n-form>
		</n-sidebar>
		<h2 v-if="cell.state.title">{{cell.state.title}}</h2>
		
		<component v-if="cell.state.filterType" :is="cell.state.filterType.component" 
			class="cell-actions"
			:show-refresh="cell.state.showRefresh"
			:filters="cell.state.filters"
			:formatters="cell.state.formatters"
			:orderable="orderable"
			@refresh="load(0)"
			@filter="setFilter"
			@sort="sort"/>
			
		<slot></slot>
		<div class="global-actions" v-if="globalActions.length">
			<button :disabled="action.useSelection && !lastTriggered" v-for="action in globalActions"
				:class="action.class"
				@click="trigger(action, action.useSelection ? lastTriggered : (cell.on ? $services.page.instances[page.name].variables[cell.on] : {}))">{{action.label}}</button>
		</div>
	</div>
</template>

