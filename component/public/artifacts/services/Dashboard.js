nabu.services.VueService(Vue.extend({
	services: ["swagger"],
	methods: {
		getOperations: function(accept) {
			var result = [];
			var operations = this.$services.swagger.operations;
			Object.keys(operations).map(function(operationId) {
				if (accept(operations[operationId])) {
					result.push(operations[operationId]);
				}
			});
			result.sort(function(a, b) {
				return a.id.localeCompare(b.id);
			});
			return result;
		},
		getDataOperations: function() {
			var self = this;
			return this.getOperations(function(operation) {
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
		}
	}
}), { name: "nabu.services.Dashboard" });