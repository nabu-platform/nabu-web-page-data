<template id="data-common">
	<div class="data-common">
		<n-sidebar @close="configuring = false" v-if="configuring" class="settings">
			<n-form class="layout2">
				<n-collapsible title="Dashboard Settings">
					<n-form-combo label="Operation" :value="cell.state.operation" 
						:filter="getDataOperations"
						@input="updateOperation"
						v-if="!cell.state.array && !cell.state.collect"/>
					<n-form-combo label="Array" :value="cell.state.array"
						:filter="function(value) { return $services.page.getAllArrays(page, cell.id) }"
						v-if="!cell.state.operation && !cell.state.collect"
						@input="updateArray"/>
					<n-form-combo label="Collect" :value="cell.state.collect"
						:filter="function(value) { return $services.page.getAllArrays(page, cell.id) }"
						v-if="false && !cell.state.operation && !cell.state.array"
						@input="updateCollect"/>
					<n-form-text v-model="cell.state.title" label="Title"/>
					<n-form-text v-if="cell.state.operation" v-model="cell.state.autoRefresh" label="Auto-refresh"/>
					<n-form-text v-model="cell.state.class" label="Class"/>
					<n-form-text v-model="cell.state.limit" v-if="hasLimit" label="Limit" :timeout="600" @input="load()"/>
					<n-form-switch v-if="multiselect" v-model="cell.state.multiselect" label="Allow Multiselect"/>
					<n-form-combo label="Filter Type" :filter="function(value) { return $window.nabu.page.providers('data-filter') }" v-model="cell.state.filterType"
						:formatter="function(x) { return x.name }"/>
					<n-form-text v-if="cell.state.filterType == 'combo'" v-model="cell.state.filterPlaceHolder" label="Combo placeholder"/>
					<n-form-combo label="Update Operation" :value="cell.state.updateOperation"
						v-if="updatable"
						:filter="getFormOperations"
						@input="updateFormOperation"/>
					<n-page-mapper v-if="cell.state.updateOperation"
						v-model="cell.state.updateBindings"
						:from="formAvailableParameters"
						:to="formInputParameters"/>
					<slot name="main-settings"></slot>
				</n-collapsible>
				<n-collapsible title="Refresh">
					<div class="list-actions">
						<button @click="cell.state.refreshOn.push(null)">Add Refresh Listener</button>
					</div>
					<div v-for="i in Object.keys(cell.state.refreshOn)" class="list-row">
						<n-form-combo v-model="cell.state.refreshOn[i]"
							:filter="getRefreshEvents"/>
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
					<n-collapsible class="list-item" :title="action.name ? action.name : 'Unnamed'" v-for="action in cell.state.actions">
						<n-form-text v-model="action.name" label="Name" @input="$emit('updatedEvents')"/>
						<n-form-combo v-model="action.class" :filter="$services.page.getSimpleClasses" label="Class"/>
						<n-form-switch v-model="action.global" label="Global" />
						<n-form-switch v-model="action.useSelection" v-if="action.global" label="Use Selection" />
						<n-form-text v-model="action.icon" label="Icon"/>
						<n-form-text v-model="action.label" label="Label"/>
						<n-form-text v-model="action.condition" label="Condition"/>
						<n-form-switch v-model="action.refresh" label="Reload"/>
						<n-form-switch v-model="action.close" label="Close"/>
						<n-form-combo v-model="action.type" v-if="action.global" :items="['button', 'link']" :nillable="false" label="Type"/>
						<div class="list-item-actions">
							<button @click="upAction(action)"><span class="fa fa-chevron-circle-up"></span></button>
							<button @click="downAction(action)"><span class="fa fa-chevron-circle-down"></span></button>
							<button @click="removeAction(action)"><span class="fa fa-trash"></span></button>
						</div>
					</n-collapsible>
				</n-collapsible>
				<page-form-configure title="Filters" v-if="cell.state.filters.length || filtersToAdd().length"
					:page="page"
					:cell="cell"
					:fields="cell.state.filters" 
					:possible-fields="filtersToAdd()"/>
				<page-fields-edit :cell="cell" :page="page" :keys="keys" :allow-editable="!!cell.state.updateOperation"/>
				<n-collapsible title="Formatters" class="list" v-if="false">
					<n-collapsible class="list-item" :title="cell.state.result[key].label ? cell.state.result[key].label : key" v-for="key in keys">
						<n-form-text v-model="cell.state.result[key].label" :label="'Label for ' + key" 
							v-if="cell.state.result[key].format != 'hidden'"/>
						<n-form-combo v-model="cell.state.result[key].format" :label="'Format ' + key + ' as'"
							:items="['hidden', 'link', 'date', 'dateTime', 'time', 'masterdata', 'custom']"/>
						<n-ace v-if="cell.state.result[key].format == 'custom'" mode="javascript" v-model="cell.state.result[key].custom"/>
					</n-collapsible>
				</n-collapsible>
				<n-collapsible title="Record Styling">
					<div class="list-actions">
						<button @click="addRecordStyle()">Add Style</button>
					</div>
					<n-form-section class="list-row" v-for="style in cell.state.styles">
						<n-form-text v-model="style.class" label="Class"/>
						<n-form-text v-model="style.condition" label="Condition"/>
						<button @click="cell.state.styles.splice(cell.state.styles.indexOf(style), 1)"><span class="fa fa-trash"></span></button>
					</n-form-section>
				</n-collapsible>
				<n-collapsible title="Column Styling" class="list" v-if="false">
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
		
		<component v-if="cell.state.filterType && !inactive" 
			:is="cell.state.filterType.component" 
			class="cell-actions"
			:page="page"
			:cell="cell"
			:show-refresh="cell.state.showRefresh"
			:filters="cell.state.filters"
			:formatters="cell.state.formatters"
			:orderable="orderable"
			@refresh="load(0)"
			@filter="setFilter"
			@sort="sort"/>
			
		<div class="content"><slot></slot></div>
		<div class="global-actions" v-if="globalActions.length">
			<component
				v-if="!action.condition || $services.page.isCondition(action.condition, state)"
				v-for="action in globalActions"
				:is="action.type == 'link' ? 'a' : 'button'"
				:disabled="action.useSelection && !lastTriggered"
				:class="[action.class, {'has-icon': action.icon}]"
				href="javascript:void(0)"
				v-action="function() { trigger(action) }"><span v-if="action.icon" class="fa" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></component>
		</div>
	</div>
</template>

