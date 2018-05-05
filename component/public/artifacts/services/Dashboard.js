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
			var result = builder(data);
			if (result) {
				// add 10 pixels to prevent blinking
				div.setAttribute("style", "position:absolute;top:" + (y+10) + "px;left:" + (x+10) + "px");
				div.setAttribute("class", "d3-tooltip");
				document.body.appendChild(div);
				if (result.$mount) {
					console.log("mounting!", result);
					result.$mount().$appendTo(div);
				}
				else {
					div.innerHTML = builder(data);
				}
			}
		},
		removeStandardD3Tooltip: function() {
			var element = document.body.querySelector(".d3-tooltip");
			if (element) {
				element.parentNode.removeChild(element);
			}
		},
		extractValues: function(cell, records) {
			var zValues = [];
			var xValues = [];
			var yValues = [];
			var minY = 0;
			records.map(function(record, i) {
				if (cell.state.z) {
					var z = record[cell.state.z];
					if (zValues.indexOf(z) < 0) {
						zValues.push(z);
					}
				}
				if (cell.state.x) {
					var x = record[cell.state.x];
					if (xValues.indexOf(x) < 0) {
						xValues.push(x);
						yValues.push(0);
					}
				}
				else {
					xValues.push(i);
				}
				var y = record[cell.state.y];
				if (minY == null || y < minY) {
					minY = y;
				}
				if (cell.state.x) {
					yValues[xValues.indexOf(record[cell.state.x])] += y;
				}
				else {
					yValues.push(y);
				}
			});
			
			if (cell.state.sortBy) {
				var combined = xValues.map(function(x, i) {
					return {
						x: x,
						y: yValues[i]
					}
				});
				combined.sort(function(a, b) {
					var value1 = a[cell.state.sortBy == 'x' ? 'x' : 'y'];
					var value2 = b[cell.state.sortBy == 'x' ? 'x' : 'y'];
					var comparison;
					if (typeof(value1) == "string" && typeof(value2) == "string" && value1.match(/[0-9.-]+/) && value2.match(/[0-9.-]+/)) {
						comparison = parseFloat(value1) - parseFloat(value2);
					}
					else if (typeof(value1) == "string") {
						comparison = value1.localeCompare(value2);
					}
					else if (value1 instanceof Date) {
						comparison = value1.getTime() - value2.getTime();
					}
					else {
						comparison = value1 - value2;
					}
					if (cell.state.reverseSortBy) {
						comparison *= -1;
					}
					return comparison;
				});
				xValues = combined.map(function(a) { return a.x });
				yValues = combined.map(function(a) { return a.y });
			}
			
			// calculate the range of the Y-axis
			var maxY = d3.max(yValues);
			
			return {
				xValues: xValues,
				yValues: yValues,
				zValues: zValues,
				minY: minY,
				maxY: maxY
			};
		}
	}
}), { name: "nabu.services.Dashboard" });