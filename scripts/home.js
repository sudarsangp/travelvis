$(document).ready(function() {
	// console.log("hello");
	var airportCsv = [];
	var carrierCsv = [];
	$.get('/data/L_AIRPORT.csv-', function(data){
		var fromCsv = $.csv.toObjects(data);
		airportCsv = fromCsv;
		var selectElement = $("#depAir");

		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			selectElement.append(new Option(descriptionValue, codeValue));
		};
		selectElement.html($("#depAir option").sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
		}));
	})
		.done(function(data) {
			// alert('done ');
		})
		.fail(function() {
			alert(' error departure airport');
		})
		.always(function() {
			// alert('cool');
		});
		
	$.get('/data/L_UNIQUE_CARRIERS.csv-', function(data){
		var fromCsv = $.csv.toObjects(data);
		carrierCsv = fromCsv;
		
	})
		.done(function() {
			// alert('done ');
		})
		.fail(function() {
			alert(' error airline to fly');
		})
		.always(function() {
			// alert('cool');
		});

	var formatData = [];
	var dataJson;
	function iterateTestData(deptCode, arrCode, carrierCode) {
		$.get('/data/ontime_data_test.json', function(data) {
		
			dataJson = JSON.parse(data);

			var allCarrierDestinationCodes = getCarrierDestinationCodesForDeparture(dataJson, deptCode)
			var deptCarrierCodes = allCarrierDestinationCodes.carrierCodes;
			var destAirportCodes = allCarrierDestinationCodes.destAirCodes;

			populateCarriers(deptCarrierCodes);
			populateDestinationAirport(destAirportCodes);
			var minDelay = getMinimumTotalDelay(dataJson, deptCode, arrCode, carrierCode);
			generateDataForGraph(dataJson, deptCode, arrCode, carrierCode, minDelay);
			
		})
		.done(function() {
			renderGraph();
		})
		.fail(function() {
			alert(' error getting json data from file');
		});
	};
	
	// for testing purposes remove them finally
	//iterateTestData("JFK", "LAX", "AA");
	
	function generateDataForGraph(dataJson, deptCode, arrCode, carrierCode, minDelay) {
		var eachObject = {}
			for(var i=0; i<dataJson.length; i++) {
				if(dataJson[i].origin === deptCode && dataJson[i].dest === arrCode && dataJson[i].unique_carrier === carrierCode && dataJson[i].cancelled === "0") {

					if(minDelay === parseInt(dataJson[i].dep_delay, 10) + parseInt(dataJson[i].arr_delay, 10)) {
						eachObject["source"] = dataJson[i].origin;
						eachObject["target"] = dataJson[i].dest;
						eachObject["carrier"] = dataJson[i].unique_carrier;
						eachObject["totaldelay"] = parseInt(dataJson[i].dep_delay, 10) + parseInt(dataJson[i].arr_delay, 10);

						formatData.push(eachObject);
						eachObject = {};
					}
				}
				
			}
	};

	function getCarrierDestinationCodesForDeparture(dataJson, deptCode) {
		var deptCarrierCodes = [];
		var destAirportCodes = [];
		for(var i=0; i<dataJson.length; i++) {
				if(dataJson[i].origin === deptCode && dataJson[i].cancelled === "0") {
					deptCarrierCodes.push(dataJson[i].unique_carrier);
					destAirportCodes.push(dataJson[i].dest);
				}
			}
		return {
			carrierCodes: deptCarrierCodes,
			destAirCodes: destAirportCodes
		};
	};

	function getMinimumTotalDelay(dataJson, deptCode, arrCode, carrierCode) {
		var min =  Number.MAX_SAFE_INTEGER;

			for(var i=0; i<dataJson.length; i++) {
				if(dataJson[i].origin === deptCode && dataJson[i].dest === arrCode && dataJson[i].unique_carrier === carrierCode && dataJson[i].cancelled === "0") {
					var totaldelay = parseInt(dataJson[i].dep_delay, 10) + parseInt(dataJson[i].arr_delay, 10);
					if(min > totaldelay){
						min = totaldelay;
					}
				}
			}
		return min;
	};
	
	function populateDestinationAirport(destAirportCodes) {
		var selectElementDestination = $("#destAir");
		selectElementDestination.find("option").remove();
			var fromCsvDest = airportCsv;
			for(var i=0; i<fromCsvDest.length;i++) {
				var codeValue = fromCsvDest[i].Code;
				var descriptionValue = fromCsvDest[i].Description;
				for(var j=0; j<destAirportCodes.length;j++){
					if(destAirportCodes[j] === codeValue) {
						selectElementDestination.append(new Option(descriptionValue, codeValue));
						break;
					}
				}
			};
			selectElementDestination.html($("#destAir option").sort(function(a, b) {
				return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
			}));
	};

	function populateCarriers(deptCarrierCodes) {
		var selectElementCarrier = $("#airFly");
		selectElementCarrier.find("option").remove();
		var fromCsv = carrierCsv;
		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			for(var j=0; j<deptCarrierCodes.length;j++){
				if(deptCarrierCodes[j] === codeValue) {
					selectElementCarrier.append(new Option(descriptionValue, codeValue));
					break;
				}
			}
			
		};
		selectElementCarrier.html($("#airFly option").sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
			}));
	};

	$("#depAir").change(function() {
		var selectedOption = "";
		var departureCode = "";
		
		selectedOption = $(this).val();

		var fromCsv = airportCsv;
		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			
			if(selectedOption === codeValue) {
				departureCode = codeValue;
				break;
			}
		};

		var arrivalCode = $("#destAir").val();
		var carrierCode = $("#airFly").val();
		iterateTestData(departureCode, arrivalCode, carrierCode);
	});

	$("#destAir").change(function() {
		var selectedOption = "";
		var arrivalCode = "";
		
		selectedOption = $(this).val();

		var fromCsv = airportCsv;
		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			
			if(selectedOption === codeValue) {
				arrivalCode = codeValue;
				break;
			}
		};
		var departureCode = $("#depAir").val();
		var carrierCode = $("#airFly").val();

		var minDelay = getMinimumTotalDelay(dataJson, departureCode, arrivalCode, carrierCode);
		generateDataForGraph(dataJson, departureCode, arrivalCode, carrierCode, minDelay);
		renderGraph();
	});


	$("#airFly").change(function() {
		var selectedOption = "";
		var carrierCode = "";
		selectedOption = $(this).val();

		var fromCsv = carrierCsv;
		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			
			if(selectedOption === codeValue) {
				carrierCode = codeValue;
				break;
			}
		};
		var departureCode = $("#depAir").val();
		var arrivalCode = $("#destAir").val();

		var minDelay = getMinimumTotalDelay(dataJson, departureCode, arrivalCode, carrierCode);
		generateDataForGraph(dataJson, departureCode, arrivalCode, carrierCode, minDelay);
		renderGraph();
	});

	function renderGraph() {
		$("svg").remove();
		var links = formatData;

		var color = d3.scale.category20();
		var numberOfLinks = [];
		for(var x=1; x<100;x++){
			numberOfLinks.push(x);
		}
		
		links.sort(function(a,b) {
		    if (a.source > b.source) {return 1;}
		    else if (a.source < b.source) {return -1;}
		    else {
		        if (a.target > b.target) {return 1;}
		        if (a.target < b.target) {return -1;}
		        else {return 0;}
		    }
		});
		//any links with duplicate source and target get an incremented 'linknum'
		for (var i=0; i<links.length; i++) {
		    if (i != 0 &&
		        links[i].source == links[i-1].source &&
		        links[i].target == links[i-1].target) {
		            links[i].linknum = links[i-1].linknum + 1;
		        }
		    else {links[i].linknum = 1;};
		};

		var nodes = {};

		// Compute the distinct nodes from the links.
		links.forEach(function(link) {
		  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
		  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});

		var w = 1000,
		    h = 600;

		var force = d3.layout.force()
		    .nodes(d3.values(nodes))
		    .links(links)
		    .size([w, h])
		    .linkDistance(200)
		    .charge(-150)
		    .on("tick", tick)
		    .start();

		var svg = d3.select("#forceGraph").append("svg:svg")
		    .attr("width", w)
		    .attr("height", h);

		// Per-type markers, as they don't inherit styles.
		svg.append("svg:defs").selectAll("marker")
		    .data(numberOfLinks)
		  .enter().append("svg:marker")
		    .attr("id", String)
		    .attr("viewBox", "0 -5 10 10")
		    .attr("refX", 15)
		    .attr("refY", -1.5)
		    .attr("markerWidth", 6)
		    .attr("markerHeight", 6)
		    .attr("orient", "auto")
		  .append("svg:path")
		    .attr("d", "M0,-5L10,0L0,5");

		var path = svg.append("svg:g").selectAll("path")
		    .data(force.links())
		  .enter().append("svg:path")
		    .attr("class", function(d) { return "link " + d.linknum; })
		    .attr("id",function(d,i) { return "linkId_" + i; })
		    .attr("marker-end", function(d) { return "url(#" + d.linknum + ")"; });

		     var linktext = svg.append("svg:g").selectAll("g.linklabelholder").data(force.links());
	
		    linktext.enter().append("g").attr("class", "linklabelholder")
		     .append("text")
		     .attr("class", "linklabel")
		    	 .style("font-size", "13px")
		     .attr("x", "20")
		    	 .attr("y", "-20")
		     .attr("text-anchor", "start")
		    	   .style("fill","#000")
		    	 .append("textPath")
		    .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
		     .text(function(d) { 
		    	 return d.carrier; 
		    	 });
	 

		var circle = svg.append("svg:g").selectAll("circle")
		    .data(force.nodes())
		  .enter().append("svg:circle")
		    .attr("r", 5)
		    .style("fill", function(d){ return color(d.linknum);})
		    .call(force.drag);

		var text = svg.append("svg:g").selectAll("g")
		    .data(force.nodes())
		  .enter().append("svg:g");

		// A copy of the text with a thick white stroke for legibility.
		text.append("svg:text")
		    .attr("x", 8)
		    .attr("y", ".31em")
		    .attr("class", "shadow")
		    .text(function(d) { return d.name; });

		text.append("svg:text")
		    .attr("x", 8)
		    .attr("y", ".31em")
		    .text(function(d) { return d.name; });

		// Use elliptical arc path segments to doubly-encode directionality.
		function tick() {
		  path.attr("d", function(d) {
		    var dx = d.target.x - d.source.x,
		        dy = d.target.y - d.source.y,
		        dr = 150/d.linknum;  //linknum is defined above
		    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		  });

		  circle.attr("transform", function(d) {
		    return "translate(" + d.x + "," + d.y + ")";
		  });

		  text.attr("transform", function(d) {
		    return "translate(" + d.x + "," + d.y + ")";
		  });
		};
		//});
		formatData.length = 0;
	};

});