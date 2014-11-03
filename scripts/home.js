$(document).ready(function() {
	// console.log("hello");
	// $.get('/data/L_AIRPORT.csv-', function(data){
	// 	var fromCsv = $.csv.toObjects(data);
	// 	var selectElement = $("#depAir");

	// 	for(var i=0; i<fromCsv.length;i++) {
	// 		var codeValue = fromCsv[i].Code;
	// 		var descriptionValue = fromCsv[i].Description;
	// 		selectElement.append(new Option(descriptionValue, codeValue));
	// 	};
		
	// 	})
	// 	.done(function(data) {
	// 		// alert('done ');
	// 		var fromCsv = $.csv.toObjects(data);
	// 		var flightNode = {};
	// 		var nodesArray = [];
	// 		for(var i=0; i<fromCsv.length; i++) {
	// 			flightNode["description"] = fromCsv[i].Description;
	// 			flightNode["code"] = fromCsv[i].Code;
	// 			nodesArray.push(flightNode);
	// 			flightNode = {};
	// 		}
	// 		// console.log(nodesArray[0]);
	// 		// console.log(nodesArray[1]);
	// 		var result = {};
	// 		result["nodes"] = nodesArray;
	// 		var validJson = JSON.stringify(result);
	// 		forceDirectedGraph(validJson);


	// 	})
	// 	.fail(function() {
	// 		alert(' error departure airport');
	// 	})
	// 	.always(function() {
	// 		// alert('cool');
	// 	});
		
	// $.get('/data/L_UNIQUE_CARRIERS.csv-', function(data){
	// 	var fromCsv = $.csv.toObjects(data);
	// 	var selectElement = $("#airFly");

	// 	for(var i=0; i<fromCsv.length;i++) {
	// 		var codeValue = fromCsv[i].Code;
	// 		var descriptionValue = fromCsv[i].Description;
	// 		selectElement.append(new Option(descriptionValue, codeValue));
	// 	};
		
	// 	})
	// 	.done(function() {
	// 		// alert('done ');
	// 	})
	// 	.fail(function() {
	// 		alert(' error airline to fly');
	// 	})
	// 	.always(function() {
	// 		// alert('cool');
	// 	});

	// $.get('/data/L_AIRPORT.csv-', function(data){
	// 	var fromCsv = $.csv.toObjects(data);
	// 	var selectElement = $("#destAir");

	// 	for(var i=0; i<fromCsv.length;i++) {
	// 		var codeValue = fromCsv[i].Code;
	// 		var descriptionValue = fromCsv[i].Description;
	// 		selectElement.append(new Option(descriptionValue, codeValue));
	// 	};
		
	// 	})
	// 	.done(function() {
	// 		// alert('done ');
	// 	})
	// 	.fail(function() {
	// 		alert(' error destination airport');
	// 	})
	// 	.always(function() {
	// 		// alert('cool');
	// 	});


	$.get('/data/sample.json', function(data) {
	//	console.log(data.length);
	//	console.log(typeof data);
		
		var dataJson = JSON.parse(data);
		// console.log(dataJson[0].origin);
		// console.log(dataJson[0].dest);
		var entry = [];
		var allOriginDest = [];
		for(var i=0; i<dataJson.length; i++) {
			entry.push(dataJson[i].origin);
			entry.push(dataJson[i].dest);
			entry.push(dataJson[i].distance/500);
			allOriginDest.push(entry);
			entry = [];
		}
		
		//console.log(allOriginDest);
		var csvContent = "data:text/csv;charset=utf-8,";
		csvContent += "source, target, value" + "\n";
		allOriginDest.forEach(function(infoArray, index){

   			dataString = infoArray.join(",");
   			csvContent += index < allOriginDest.length ? dataString+ "\n" : dataString;

		}); 

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "origin_dest.csv");

		link.click(); // This will download the data file named "my_data.csv".

	})
	.done(function() {
		d3.csv("data/origin_dest.csv", function(error, links) {

		var nodes = {};

		// Compute the distinct nodes from the links.
		links.forEach(function(link) {
		    link.source = nodes[link.source] || 
		        (nodes[link.source] = {name: link.source});
		    link.target = nodes[link.target] || 
		        (nodes[link.target] = {name: link.target});
		    link.value = +link.value;
		});

		var width = 960,
		    height = 500;

		var force = d3.layout.force()
		    .nodes(d3.values(nodes))
		    .links(links)
		    .size([width, height])
		    .linkDistance(30)
		    .charge(-100)
		    .on("tick", tick)
		    .start();

		var svg = d3.select("body").append("svg")
		    .attr("width", width)
		    .attr("height", height);

		// build the arrow.
		svg.append("svg:defs").selectAll("marker")
		    .data(["end"])      // Different link/path types can be defined here
		  .enter().append("svg:marker")    // This section adds in the arrows
		    .attr("id", String)
		    .attr("viewBox", "0 -5 10 10")
		    .attr("refX", 15)
		    .attr("refY", -1.5)
		    .attr("markerWidth", 6)
		    .attr("markerHeight", 6)
		    .attr("orient", "auto")
		  .append("svg:path")
		    .attr("d", "M0,-5L10,0L0,5");

		// add the links and the arrows
		var path = svg.append("svg:g").selectAll("path")
		    .data(force.links())
		  .enter().append("svg:path")
		//    .attr("class", function(d) { return "link " + d.type; })
		    .attr("class", "link")
		    .attr("marker-end", "url(#end)");

		// define the nodes
		var node = svg.selectAll(".node")
		    .data(force.nodes())
		  .enter().append("g")
		    .attr("class", "node")
		    .call(force.drag);

		// add the nodes
		node.append("circle")
		    .attr("r", 5);

		// add the text 
		node.append("text")
		    .attr("x", 12)
		    .attr("dy", ".35em")
		    .text(function(d) { return d.name; });

		// add the curvy lines
		function tick() {
		    path.attr("d", function(d) {
		        var dx = d.target.x - d.source.x,
		            dy = d.target.y - d.source.y,
		            dr = Math.sqrt(dx * dx + dy * dy);
		        return "M" + 
		            d.source.x + "," + 
		            d.source.y + "A" + 
		            dr + "," + dr + " 0 0,1 " + 
		            d.target.x + "," + 
		            d.target.y;
		    });

		    node
		        .attr("transform", function(d) { 
		  	    return "translate(" + d.x + "," + d.y + ")"; });
		}

		});
	});




function forceDirectedGraph(dataIn) {
	// console.log("in fucntion call");
	// console.log(typeof dataIn);
	var dataJson = JSON.parse(dataIn);
	// console.log(typeof dataJson);
	// console.log(dataJson["nodes"].length);
	// console.log(dataJson["nodes"][0]);
	var width = 960,
		height = 500;

	var color = d3.scale.category20();

	var force = d3.layout.force()
    	.charge(-120)
    	.linkDistance(30)
    	.size([width, height])
    	.gravity(0.3);

	var svg = d3.select("#forceGraph").append("svg")
    	.attr("width", width)
    	.attr("height", height);

    d3.json("scripts/miserables.json", function(error, graph) {
    //	console.log("in d3.js");
    	force
      .nodes(graph.nodes)
      //.links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.description; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
    });

};

});