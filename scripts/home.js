$(document).ready(function() {
	// console.log("hello");
	$.get('/data/L_AIRPORT.csv-', function(data){
		var fromCsv = $.csv.toObjects(data);
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
			// var fromCsv = $.csv.toObjects(data);
			// var flightNode = {};
			// var nodesArray = [];
			// for(var i=0; i<fromCsv.length; i++) {
			// 	flightNode["description"] = fromCsv[i].Description;
			// 	flightNode["code"] = fromCsv[i].Code;
			// 	nodesArray.push(flightNode);
			// 	flightNode = {};
			// }
			// // console.log(nodesArray[0]);
			// // console.log(nodesArray[1]);
			// var result = {};
			// result["nodes"] = nodesArray;
			// var validJson = JSON.stringify(result);
			// //forceDirectedGraph(validJson);


		})
		.fail(function() {
			alert(' error departure airport');
		})
		.always(function() {
			// alert('cool');
		});
		
	$.get('/data/L_UNIQUE_CARRIERS.csv-', function(data){
		var fromCsv = $.csv.toObjects(data);
		var selectElement = $("#airFly");

		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			selectElement.append(new Option(descriptionValue, codeValue));
		};
		selectElement.html($("#airFly option").sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
		}));
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

	$.get('/data/L_AIRPORT.csv-', function(data){
		var fromCsv = $.csv.toObjects(data);
		var selectElement = $("#destAir");

		for(var i=0; i<fromCsv.length;i++) {
			var codeValue = fromCsv[i].Code;
			var descriptionValue = fromCsv[i].Description;
			selectElement.append(new Option(descriptionValue, codeValue));
		};
		selectElement.html($("#destAir option").sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
		}));
	})
		.done(function() {
			// alert('done ');
		})
		.fail(function() {
			alert(' error destination airport');
		})
		.always(function() {
			// alert('cool');
		});

	var allOriginDest = [];
	var formatData = [];
	$.get('/data/small.json', function(data) {
	//	console.log(data.length);
	//	console.log(typeof data);
		
		var dataJson = JSON.parse(data);
		// console.log(dataJson[0].origin);
		// console.log(dataJson[0].dest);
		var entry = [];
		var eachObject = {}
		for(var i=0; i<dataJson.length; i++) {
			entry.push(dataJson[i].origin);
			entry.push(dataJson[i].dest);
			//entry.push(dataJson[i].fl_date);
			allOriginDest.push(entry);
			entry = [];

			eachObject["source"] = dataJson[i].origin;
			eachObject["target"] = dataJson[i].dest;
			formatData.push(eachObject);
			eachObject = {};
		}
		
		//console.log(allOriginDest);
		var csvContent = "data:text/csv;charset=utf-8,";
		// donot give space between source,target,value
		csvContent += "source,target,value" + "\n";
		allOriginDest.forEach(function(infoArray, index){

   			dataString = infoArray.join(",");
   			csvContent += index < allOriginDest.length ? dataString+ "\n" : dataString;

		}); 

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "test_small.csv");

		//link.click(); // This will download the data file

	})
	.done(function() {
		//d3.csv("data/test_small.csv", function(error, links) {
			
			// // var links = [{source: "Microsoft", target: "Amazon", type: "licensing"},
   //           {source: "Microsoft", target: "Amazon", type: "suit"},
   //           {source: "Samsung", target: "Apple", type: "suit"},
   //           {source: "Microsoft", target: "Amazon", type: "resolved"}];
   			var links = formatData;

   			console.log(links[0]);
			console.log(links[1]);
			console.log(links);

			var color = d3.scale.category20();
			var numberOfLinks = [1,2,3,4,5,6,7,8,9];
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
			    .linkDistance(100)
			    .charge(-30)
			    .on("tick", tick)
			    .start();

			var svg = d3.select("body").append("svg:svg")
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
			    .attr("marker-end", function(d) { return "url(#" + d.linknum + ")"; });

			var circle = svg.append("svg:g").selectAll("circle")
			    .data(force.nodes())
			  .enter().append("svg:circle")
			    .attr("r", 6)
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
			        dr = 250/d.linknum;  //linknum is defined above
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
	});
			
	





// function forceDirectedGraph(dataIn) {
// 	// console.log("in fucntion call");
// 	// console.log(typeof dataIn);
// 	var dataJson = JSON.parse(dataIn);
// 	// console.log(typeof dataJson);
// 	// console.log(dataJson["nodes"].length);
// 	// console.log(dataJson["nodes"][0]);
// 	var width = 960,
// 		height = 500;

// 	var color = d3.scale.category20();

// 	var force = d3.layout.force()
//     	.charge(-120)
//     	.linkDistance(30)
//     	.size([width, height])
//     	.gravity(0.3);

// 	var svg = d3.select("#forceGraph").append("svg")
//     	.attr("width", width)
//     	.attr("height", height);

//     d3.json("scripts/miserables.json", function(error, graph) {
//     //	console.log("in d3.js");
//     	force
//       .nodes(graph.nodes)
//       //.links(graph.links)
//       .start();

//   var link = svg.selectAll(".link")
//       .data(graph.links)
//     .enter().append("line")
//       .attr("class", "link")
//       .style("stroke-width", function(d) { return Math.sqrt(d.value); });

//   var node = svg.selectAll(".node")
//       .data(graph.nodes)
//     .enter().append("circle")
//       .attr("class", "node")
//       .attr("r", 5)
//       .style("fill", function(d) { return color(d.group); })
//       .call(force.drag);

//   node.append("title")
//       .text(function(d) { return d.description; });

//   force.on("tick", function() {
//     link.attr("x1", function(d) { return d.source.x; })
//         .attr("y1", function(d) { return d.source.y; })
//         .attr("x2", function(d) { return d.target.x; })
//         .attr("y2", function(d) { return d.target.y; });

//     node.attr("cx", function(d) { return d.x; })
//         .attr("cy", function(d) { return d.y; });
//   });
//     });

// };

});