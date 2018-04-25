<template id="dashboard-form">
	<div class="dashboard-form">
		<n-sidebar @close="configuring = false" v-if="configuring">
			<n-form-combo slot="header" :value="operation" :filter="getOperations"
				@input="updateOperation"
				:formatter="function(x) { return x.id }"/>
			<n-form class="layout2">
				<n-form-text v-model="cell.state.class" label="Form Class"/>
				<n-form-text v-model="cell.state.cancel" label="Cancel Label"/>
				<n-form-text v-model="cell.state.ok" label="Ok Label"/>
				<n-form-text v-model="cell.state.event" label="Event"/>
				<n-page-mapper :to="Object.keys(cell.bindings)" :from="availableParameters" 
					v-model="cell.bindings"/>
				<n-form-section class="form">
					<h2>Form</h2>
					<button @click="addField" v-if="fieldsToAdd.length">Add Field</button>
					<n-form-section class="field" v-for="field in cell.state.fields">
						<n-form-combo v-model="field.name" label="Name" :items="fieldsToAdd"/>
						<n-form-text v-model="field.label" label="Label" />
						<n-form-text v-model="field.description" label="Description" />
						<n-form-combo v-model="field.type" label="Type" :items="['text', 'area', 'enumeration', 'enumerationOperation', 'date', 'number', 'fixed']"/>
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
					</n-form-section>
				</n-form-section>
			</n-form>
		</n-sidebar>
		<n-form :class="cell.state.class" ref="form">
			<n-form-section v-for="field in cell.state.fields" :key="field.name + '_section'">
				<n-form-section v-if="isList(field.name)">
					<button @click="function() { result[field.name].push(null) }">Add {{field.name}}</button>
					<n-form-section v-for="i in Object.keys(result[field.name])" :key="field.name + '_wrapper' + i">
						<n-dashboard-form-field :key="field.name + '_value' + i" :field="field" :schema="getSchemaFor(field.name)" v-model="result[field.name][i]"/>
						<button @click="result[field.name].splice(i, 1)">Remove</button>	
					</n-form-section>
				</n-form-section>
				<n-dashboard-form-field v-else :key="field.name + '_value'" :field="field" :schema="getSchemaFor(field.name)" :value="result[field.name]"
					@input="function(newValue) { $window.Vue.set(result, field.name, newValue) }"/>
			</n-form-section>
			<footer class="actions">
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
		<n-form-combo v-if="field.type == 'enumerationOperation'" :items="field.enumeration"
			@input="function(newValue) { $emit('input', newValue) }"
			:label="field.label ? field.label : field.name"
			:value="value"/>
	</n-form-section>
</template>