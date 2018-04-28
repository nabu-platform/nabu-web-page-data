if (!nabu) { var nabu = {} };
if (!nabu.views) { nabu.views = {} };
if (!nabu.views.dashboard) { nabu.views.dashboard = {} };

nabu.views.dashboard.Bar = Vue.extend({
	template: "#dashboard-bar",
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
			records: [],
			loaded: false
		}
	},
	created: function() {
		this.normalize(this.cell.state);
	},
	computed: {
		events: function() {
			return this.$refs.data ? this.$refs.data.events : {};
		},
		fromColor: function() {
			return this.cell.state.fromColor ? this.cell.state.fromColor : "darkred";
		},
		toColor: function() {
			return this.cell.state.toColor ? this.cell.state.toColor : "darkolivegreen";
		}
	},
	ready: function() {
		this.draw();		
	},
	methods: {
		// based heavily on: https://bl.ocks.org/mbostock/3886208
		draw: function() {
			var self = this;
			if (this.cell.state.y && this.$refs.svg && self.cell.state.y) {
				var records = this.records.filter(function(record) {
					return !!record[self.cell.state.y];
				});
				
				var zValues = [];
				var xValues = [];
				var yValues = [];
				records.map(function(record, i) {
					if (self.cell.state.z) {
						var z = record[self.cell.state.z];
						if (zValues.indexOf(z) < 0) {
							zValues.push(z);
						}
					}
					if (self.cell.state.x) {
						var x = record[self.cell.state.x];
						if (xValues.indexOf(x) < 0) {
							xValues.push(x);
							yValues.push(0);
						}
					}
					else {
						xValues.push(i);
					}
					var y = record[self.cell.state.y];
					if (self.cell.state.x) {
						yValues[xValues.indexOf(record[self.cell.state.x])] += y;
					}
					else {
						yValues.push(y);
					}
				});
				
				console.log("values", xValues, yValues, zValues);
				// calculate the range of the Y-axis
				var maxY = d3.max(yValues);
				var minY = d3.min(yValues);
				
				var margin = {top: 10, right: 10, bottom: 50, left: 50};
				
				// remove previous drawing (if any)
				nabu.utils.elements.clear(this.$refs.svg);
				
				var svg = d3.select(this.$refs.svg),
					width = this.$el.offsetWidth - margin.right - margin.left,
					// reserve some space for title etc
					height = this.$el.offsetHeight - (self.cell.state.title ? 80 : 30);
					
				svg.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom);
					
				var x = d3.scaleBand()
					.rangeRound([0, width])
					.domain(xValues)
					.paddingInner(0.05)
					.align(0.1);
				
				console.log("y", minY, maxY);
				var y = d3.scaleLinear()
					.rangeRound([height, 0])
					.domain([minY, maxY])
					//.domain(yValues)
					.nice();
				
				var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				if (zValues.length) {
					var z = d3.scaleLinear()
						.domain([0, zValues.length])
						.range([this.fromColor, this.toColor])
						.interpolate(d3.interpolateHcl);
						
					
					g.append("g")
						.selectAll("g")
						.data(d3.stack().keys(zValues)(records))
						//.data(records)
						.enter().append("g")
						.attr("fill", function(d) { return z(self.cell.state.z ? d.data[self.cell.state.z] : zValues[0]) })
						.selectAll("rect")
						.data(function(d) { console.log("data d is", d); return d; })
						.enter().append("rect")
						.attr("x", function(d, i) { console.log("entry", d, i); return self.cell.state.x ? x(d.data[self.cell.state.x]) : i; })
						.attr("y", function(d) { console.log("y d is", d); return y(d[1]); })
						.attr("height", function(d) { return y(d[0]) - y(d[1]); })
						.attr("width", x.bandwidth());
					
					g.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(0," + height + ")")
						.call(d3.axisBottom(x));
					
					g.append("g")
						.attr("class", "axis")
						.call(d3.axisLeft(y).ticks(null, "s"))
						.append("text")
						.attr("x", 2)
						.attr("y", y(y.ticks().pop()) + 0.5)
						.attr("dy", "0.32em")
						.attr("fill", "#000")
						.attr("font-weight", "bold")
						.attr("text-anchor", "start")
						.text("Population");
				}
				else {
					g.append("g")
						.attr("class", "axis axis--x")
						.attr("transform", "translate(0," + height + ")")
						.call(d3.axisBottom(x));
					
					g.append("g")
						.attr("class", "axis axis--y")
						.call(d3.axisLeft(y).ticks(10))
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", "0.71em")
						.attr("text-anchor", "end")
						.text("Frequency");
					
					console.log("bandwidth", x.bandwidth());
					g.selectAll(".bar")
						.data(records)
						.enter().append("rect")
						.attr("fill", this.fromColor)
						.attr("class", "bar")
						.attr("x", function(d, i) { return self.cell.state.x ? x(d[self.cell.state.x]) : x(i) })
						.attr("y", function(d) { return y(d[self.cell.state.y]); })
						.attr("width", x.bandwidth())
						.attr("height", function(d) { return height - y(d[self.cell.state.y]); });
				}
			}
		},
		normalize: function(state) {
			if (!state.x) {
				Vue.set(state, "x", null);
			}
			if (!state.y) {
				Vue.set(state, "y", null);
			}
			if (!state.z) {
				Vue.set(state, "z", null);
			}
			if (!state.unit) {
				Vue.set(state, "unit", null);
			}
			if (!state.fromColor) {
				Vue.set(state, "fromColor", null);
			}
			if (!state.toColor) {
				Vue.set(state, "toColor", null);
			}
			if (!state.arcWidth) {
				Vue.set(state, "arcWidth", 30);
			}
		},
		// standard methods!
		configure: function() {
			this.$refs.data.configuring = true;	
		},
		refresh: function() {
			this.$refs.data.load();
		}
	},
	watch: {
		records: function(newValue) {
			if (this.loaded) {
				this.draw();
			}
		}
	}
});