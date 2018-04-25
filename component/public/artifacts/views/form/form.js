if (!nabu) { var nabu = {} };
if (!nabu.views) { nabu.views = {} };
if (!nabu.views.dashboard) { nabu.views.dashboard = {} };

/*
TODO:

- can add support for bound input for enumerations, for example could pass in a contextual id to further limit relevant choices
	- then we have to choose the field you use to bind "q" input to as there are multiple inputs

*/

nabu.views.dashboard.Form = Vue.extend({
	template: "#dashboard-form",
	props: {
		page: {
			type: Object,
			required: true
		},
		parameters: {
			type: Object,
			required: false
		},
		cell: {
			type: Object,
			required: true
		},
		edit: {
			type: Boolean,
			required: true
		}
	},
	data: function() {
		return {
			configuring: false,
			result: {}
		}
	},
	computed: {
		operation: function() {
			return this.cell.state.operation ? this.$services.swagger.operations[this.cell.state.operation] : null;
		},
		availableParameters: function() {
			var parameters = this.$services.page.instances[this.page.name].availableParameters;
			var result = {};
			result.page = parameters.page;
			if (this.cell.on) {
				result[this.cell.on] = parameters[this.cell.on];
			}
			return result;
		},
		fieldsToAdd: function() {
			var fields = [];
			var self = this;
			Object.keys(this.cell.bindings).map(function(key) {
				if (!self.cell.bindings[key]) {
					fields.push(key);
				}
			});
			return fields;
		}
	},
	created: function() {
		this.normalize(this.cell.state);
	},
	methods: {
		configure: function() {
			this.configuring = true;	
		},
		normalize: function(state) {
			if (!state.fields) {
				Vue.set(state, "fields", []);
			}
			if (!state.class) {
				Vue.set(state, "class", "layout2");
			}
			if (!state.ok) {
				Vue.set(state, "ok", "Ok");
			}
			if (!state.cancel) {
				Vue.set(state, "cancel", "Cancel");
			}
			if (!state.event) {
				Vue.set(state, "event", null);
			}
		},
		getOperations: function() {
			var self = this;
			return this.$services.dashboard.getOperations(function(operation) {
				// must be a put or post
				return (operation.method.toLowerCase() == "put" || operation.method.toLowerCase() == "post")
					// and contain the name fragment (if any)
					&& (!name || operation.id.toLowerCase().indexOf(name.toLowerCase()) >= 0);
			});
		},
		updateOperation: function(operation) {
			this.cell.state.operation = operation.id;
			var bindings = {};
			if (operation.parameters) {
				var self = this;
				operation.parameters.map(function(parameter) {
					if (parameter.in == "body") {
						var type = self.$services.swagger.resolve(parameter);
						if (type.schema.properties) {
							Object.keys(type.schema.properties).map(function(key) {
								bindings[key] = self.cell.bindings && self.cell.bindings[key]
									? self.cell.bindings[key]
									: null;
							});
						}
					}
					else {
						bindings[parameter.name] = self.cell.bindings && self.cell.bindings[parameter.name]
							? self.cell.bindings[parameter.name]
							: null;
					}
				});
			}
			// TODO: is it OK that we simply remove all bindings?
			// is the table the only one who sets bindings here?
			Vue.set(this.cell, "bindings", bindings);
		},
		getSchemaFor: function(field) {
			var operation = this.$services.swagger.operations[this.cell.state.operation];
			var result = null;
			if (operation) {
				var self = this;
				for (var i = 0; i < operation.parameters.length; i++) {
					var parameter = operation.parameters[i];
					if (parameter.in == "body") {
						var type = self.$services.swagger.resolve(parameter);
						if (type.schema.properties) {
							if (type.schema.properties[field]) {
								result = type.schema.properties[field];
								result.required = type.schema.required.indexOf(field) >= 0;
							}
						}
					}
					else if (parameter.name == field) {
						result = parameter;
					}
				};
			}
			return result;
		},
		isList: function(field) {
			var field = this.getSchemaFor(field);
			return field && field.type == "array";
		},
		// copy/pasted from the table getOperations
		getEnumerationServices: function() {
			var self = this;
			return this.$services.dashboard.getOperations(function(operation) {
				// must be a get
				var isAllowed = operation.method.toLowerCase() == "get"
					// and contain the name fragment (if any)
					&& (!name || operation.id.toLowerCase().indexOf(name.toLowerCase()) >= 0)
					// must have _a_ response
					&& operation.responses["200"];
				// we also need at least _a_ complex array in the results
				if (isAllowed) {
					var schema = operation.responses["200"].schema;
					var definition = self.$services.swagger.definition(schema["$ref"]);
					// now we need a child in the definition that is a record array
					// TODO: we currently don't actually check for a complex array, just any array, could be an array of strings...
					isAllowed = false;
					if (definition.properties) {
						Object.keys(definition.properties).map(function(field) {
							if (definition.properties[field].type == "array") {
								isAllowed = true;
							}
						});
					}
				}
				return isAllowed;
			});	
		},
		getEnumerationFields: function(operationId) {
			var fields = [];
			var resolved = this.$services.swagger.resolve(this.$services.swagger.operations[operationId].responses["200"]);
			Object.keys(resolved.schema.properties).map(function(property) {
				if (resolved.schema.properties[property].type == "array") {
					nabu.utils.arrays.merge(fields, Object.keys(resolved.schema.properties[property].items.properties));
				}
			});
			return fields;
		},
		getEnumerationParameters: function(operationId) {
			var parameters = this.$services.swagger.operations[operationId].parameters;
			return parameters ? parameters.map(function(x) { return x.name }) : [];
		},
		addField: function() {
			this.cell.state.fields.push({
				name: null,
				label: null,
				description: null,
				type: 'text',
				enumerations: [],
				value: null,
				enumerationOperation: null,
				enumerationOperationLabel: null,
				enumerationOperationValue: null,
				enumerationOperationQuery: null
			})
		},
		doIt: function() {
			var messages = this.$refs.form.validate();
			if (!messages.length) {
				// commit the form
				// refresh things that are necessary
				// send out event! > can use this to refresh stuff!
				// globale parameters that we can pass along
				
				// the result contains a mixture of body input parameters and other parameters
				// the swagger client will do the proper transformation to make sure the data is clean
				this.result.body = this.result;
				var self = this;
				this.$services.swagger.execute(this.cell.state.operation, this.result).then(function(result) {
					if (self.cell.state.event) {
						var pageInstance = self.$services.page.instances[self.page.name];
						pageInstance.emit(self.cell.state.event, result);
					}
					self.$emit("close");
				}, function(error) {
					self.error = "Form submission failed";
				});
			}
		}
	}
});

Vue.component("n-dashboard-form-field", {
	template: "#dashboard-form-field",
	props: {
		schema: {
			type: Object,
			required: true
		},
		field: {
			type: Object,
			required: true
		},
		value: {
			required: true
		}
	},
	created: function() {
		// if it is a fixed field, just emit the value
		if (this.field.fixed) {
			this.$emit("input", this.field.value);
		}
	},
	// copy paste from form-section
	data: function() {
		return {
			labels: []
		}
	},
	computed: {
		definition: function() {
			return nabu.utils.vue.form.definition(this);
		},
		mandatory: function() {
			return nabu.utils.vue.form.mandatory(this);
		}
	},
	methods: {
		validate: function(soft) {
			var messages = nabu.utils.vue.form.validateChildren(this, soft);
			if (this.validator) {
				var additional = this.validator(this.value);
				if (additional && additional.length) {
					for (var i = 0; i < additional.length; i++) {
						additional[i].component = this;
						if (typeof(additional[i].context) == "undefined") {
							additional[i].context = [];
						}
						messages.push(additional[i]);
					}
				}
			}
			return messages;
		}
	},
	events: {
		'$vue.child.added': function(child) {
			if (child.label) {
				// we pass in the entire component because we are interested in the "hide" property it may have
				// if we simply pass in the hide, it doesn't work...
				this.labels.push({ 
					name: child.label,
					component: child
				});
			}
			else if (!this.labels.length && child.labels) {
				nabu.utils.arrays.merge(this.labels, child.labels);
			}
			else {
				this.labels.push(null);
			}
		}
	}
});