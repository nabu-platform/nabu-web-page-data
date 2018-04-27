<template id="dashboard-form">
	<div class="dashboard-cell dashboard-form">
		<n-sidebar @close="configuring = false" v-if="configuring" class="settings">
			<n-form class="layout2">
				<n-collapsible title="Form Settings">
					<n-form-combo label="Operation" :value="operation" :filter="getOperations"
						@input="updateOperation"
						:formatter="function(x) { return x.id }"/>
					<n-form-text v-model="cell.state.title" label="Title"/>
					<n-form-text v-model="cell.state.class" label="Form Class"/>
					<n-form-text v-model="cell.state.cancel" label="Cancel Label"/>
					<n-form-text v-model="cell.state.ok" label="Ok Label"/>
					<n-form-text v-model="cell.state.event" label="Success Event"/>
				</n-collapsible>
				<n-collapsible title="Value Binding">
					<n-page-mapper :to="Object.keys(cell.bindings)" :from="availableParameters" 
						v-model="cell.bindings"/>
				</n-collapsible>
				<n-collapsible class="list" title="Fields">
					<div class="list-actions">
						<button @click="addField" v-if="fieldsToAdd.length">Add Field</button>
					</div>
					<n-collapsible class="field list-item" v-for="field in cell.state.fields" :title="field.label ? field.label : field.name">
						<n-form-combo v-model="field.name" label="Name" :items="fieldsToAdd"/>
						<n-form-text v-model="field.label" label="Label" />
						<n-form-text v-model="field.description" label="Description" />
						<n-form-combo v-model="field.type" v-if="!isList(field.name)" label="Type" :items="['text', 'area', 'enumeration', 'enumerationOperation', 'date', 'number', 'fixed']"/>
						<button v-if="field.type == 'enumeration'" @click="field.enumerations.push('')">Add enumeration</button>
						<n-form-section class="enumeration" v-if="field.type == 'enumeration'" v-for="i in Object.keys(field.enumerations)" :key="field.name + 'enumeration_' + i">
							<n-form-text v-model="field.enumerations[i]"/>
							<button @click="field.enumerations.splice(i, 1)">Remove Enumeration</button>
						</n-form-section>
						<n-form-text v-model="field.value" v-if="field.type == 'fixed'" label="Fixed Value"/>
						<n-form-section class="enumeration" v-if="field.type == 'enumerationOperation'">
							<n-form-combo :value="field.enumerationOperation ? $services.swagger.operations[field.enumerationOperation] : null"
								label="Enumeration Operation"
								@input="function(newValue) { field.enumerationOperation = newValue.id }"
								:formatter="function(x) { return x.id }"
								:filter="getEnumerationServices"/>
							<n-form-combo v-if="field.enumerationOperation" v-model="field.enumerationOperationLabel" label="Enumeration Label"
								:filter="function() { return getEnumerationFields(field.enumerationOperation) }"/>
							<n-form-combo v-if="field.enumerationOperation" v-model="field.enumerationOperationValue" label="Enumeration Value"
								:filter="function() { return getEnumerationFields(field.enumerationOperation) }"/>
							<n-form-combo v-if="field.enumerationOperation" v-model="field.enumerationOperationQuery" label="Enumeration Query"
								:filter="function() { return getEnumerationParameters(field.enumerationOperation) }"/>
						</n-form-section>
						<div class="list-item-actions">
							<button @click="up(field)"><span class="n-icon n-icon-chevron-circle-up"></span></button>
							<button @click="down(field)"><span class="n-icon n-icon-chevron-circle-down"></span></button>
							<button @click="cell.state.fields.splice(cell.state.fields.indexOf(field), 1)">Remove Field</button>
						</div>
					</n-collapsible>
				</n-collapsible>
			</n-form>
		</n-sidebar>
		<h2 v-if="cell.state.title">{{cell.state.title}}</h2>
		<n-form :class="cell.state.class" ref="form">
			<n-form-section v-for="field in cell.state.fields" :key="field.name + '_section'" v-if="!isPartOfList(field.name)">
				<n-form-section v-if="isList(field.name)">
					<button @click="addInstanceOfField(field)">Add {{field.label ? field.label : field.name}}</button>
					<n-form-section v-if="result[field.name]">
						<n-form-section v-for="i in Object.keys(result[field.name])" :key="field.name + '_wrapper' + i">
							<n-form-section v-for="key in Object.keys(result[field.name][i])" :key="field.name + '_wrapper' + i + '_wrapper'"
									v-if="getField(field.name + '.' + key)">
								<n-dashboard-form-field :key="field.name + '_value' + i + '_' + key" :field="getField(field.name + '.' + key)" 
									:schema="getSchemaFor(field.name + '.' + key)" v-model="result[field.name][i][key]"/>
							</n-form-section>
							<button @click="result[field.name].splice(i, 1)">Remove {{field.label ? field.label : field.name}}</button>	
						</n-form-section>
					</n-form-section>
				</n-form-section>
				<n-dashboard-form-field v-else :key="field.name + '_value'" :field="field" :schema="getSchemaFor(field.name)" :value="result[field.name]"
					@input="function(newValue) { $window.Vue.set(result, field.name, newValue) }"/>
			</n-form-section>
			<footer class="global-actions">
				<a href="javascript:void(0)" @click="$emit('close')" v-if="cell.state.cancel">{{cell.state.cancel}}</a>
				<button @click="doIt" v-if="cell.state.ok">{{cell.state.ok}}</button>
			</footer>
		</n-form>
	</div>
</template>

<template id="dashboard-form-field">
	<n-form-section class="dashboard-form-field">
		<n-form-text v-if="field.type == 'text' || field.type == 'number' || field.type == 'area'" :type="field.type"
			:schema="schema"
			@input="function(newValue) { $emit('input', newValue) }"
			:label="field.label ? field.label : field.name"
			:value="value"/>
		<n-form-date v-if="field.type == 'date'"
			@input="function(newValue) { $emit('input', newValue) }"
			:label="field.label ? field.label : field.name"
			:value="value"/>
		<n-form-combo v-if="field.type == 'enumeration'" :items="field.enumeration"
			@input="function(newValue) { $emit('input', newValue) }"
			:label="field.label ? field.label : field.name"
			:value="value"/>
		<n-form-combo v-if="field.type == 'enumerationOperation'" :filter="filterEnumeration"
			:formatter="function(x) { return field.enumerationOperationLabel ? x[field.enumerationOperationLabel] : x }"
			v-model="currentEnumerationValue"
			:label="field.label ? field.label : field.name"/>
	</n-form-section>
</template>