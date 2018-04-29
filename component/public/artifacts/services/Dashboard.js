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
		},
		buildStandardD3Tooltip: function(data, i, builder) {
			var x = d3.event.pageX;
			var y = d3.event.pageY;
			var div = document.createElement("div");
			div.innerHTML = builder(data);
			// add 10 pixels to prevent blinking
			div.setAttribute("style", "position:absolute;top:" + (y+10) + "px;left:" + (x+10) + "px");
			div.setAttribute("class", "d3-tooltip");
			document.body.appendChild(div);
		},
		removeStandardD3Tooltip: function() {
			var element = document.body.querySelector(".d3-tooltip");
			if (element) {
				element.parentNode.removeChild(element);
			}
		}
	}
}), { name: "nabu.services.Dashboard" });