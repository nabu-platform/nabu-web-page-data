window.addEventListener("load", function() {
	application.bootstrap(function($services) {
		
		var accept = function(type, value) {
			if (type == "operation") {
				return $services.dataUtils.getDataOperations().map(function(x) { return x.id }).indexOf(value) >= 0;
			}
		};
		var initialize = function(type, value, component, cell, row, page, rowGenerator, cellGenerator) {
			component.updateOperation(value);
			var name = $services.page.guessNameFromOperation(value);
			if (rowGenerator) {
				// generate a new cell to hold everything
				var newCell = cellGenerator(row);
				newCell.name = name ? name : "Cell wrapper";
				var index = row.cells.indexOf(newCell);
				row.cells.splice(index, 1);
				index = row.cells.indexOf(cell);
				row.cells.splice(index, 1, newCell);
				
				// create a new row
				var row = rowGenerator(newCell);
				row.name = "Row rapper";

				// make sure we rotate the row				
				if ($services.page.useAris) {
					$services.page.normalizeAris(page, row, "row");
					row.aris.components["page-row"].options.push("direction_vertical");
				}
				
				var titleCell = cellGenerator(row);
				titleCell.name = "Title"
				titleCell.alias = "typography-h1";
				if (name) {
					titleCell.state.content = $services.page.prettify(name);
				}
				row.cells.push(cell);
				cell.state.filterType = "data-default-filter";
				cell.state.comboFilter = {
					useTags: true
				};
				
				var actionsCell = cellGenerator(row);
				actionsCell.alias = "page-actions";
				actionsCell.name = "Global actions";
				
				return cell;
			}
			else {
				// we no longer use the inline title?
				//if (name != null) {
					//cell.state.title = $services.page.prettify(name);
				//}
				cell.state.filterType = "data-combo-filter";
				cell.state.comboFilter = {
					useTags: true
				}
				
				return cell;
			}
		};

		$services.router.register({
			alias: "data-table",
			icon: "page/data/images/table.svg",
			description: "A tabular view of data",
			name: "Table",
			category: "Data",
			accept: accept,
			initialize: function(type, value, component, cell, row, page, rowGenerator, cellGenerator) {
				// do general initialize
				var contentCell = initialize(type, value, component, cell, row, page, rowGenerator, cellGenerator);	
				// use native table by default, it deals better with lots of data (which is the default usecase often)
				contentCell.state.useNativeTable = true;
			},
			enter: function(parameters) {
				return new nabu.page.views.data.Table({propsData:parameters});
			},
			slow: true
		});
		
		
		$services.router.register({
			alias: "data-card",
			icon: "page/data/images/card.svg",
			description: "Display a list of data records as separate cards",
			category: "Data",
			name: "Card",
			accept: accept,
			initialize: function(type, value, component, cell, row, page, rowGenerator, cellGenerator) {
				initialize(type, value, component, cell, row, page, rowGenerator, cellGenerator);
				// default show labels
				cell.state.showLabels = true;
				// default we want row view, note that this may no be available in all themes
				// we might remove this in the future, but for now it makes things easier..
				cell.state.class = "row";
			},
			enter: function(parameters) {
				return new nabu.page.views.data.Card({propsData:parameters});
			},
			slow: true
		});
		
		// form list providers
		nabu.page.provide("page-form-list-input", { 
			component: "data-multi-select", 
			configure: "data-multi-select-configure", 
			name: "multi-select",
			namespace: "nabu.page"
		});
	
		return $services.$register({
			dataUtils: nabu.services.DataUtils
		});	
	});
	
	// register data filter provider
	nabu.page.provide("data-filter", { component: "data-filter-default", name: "Default Filter", configure: "data-default-filter-configure" });
	nabu.page.provide("data-filter", { component: "data-combo-filter", name: "Combo Filter", configure: "data-combo-filter-configure" });
});