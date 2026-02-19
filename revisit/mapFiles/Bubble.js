// SVG Constants
const height = 600;
const width = 600;

// Add an SVG
const svg = d3.create("svg")
	.attr("height", height)
	.attr("width", width);

// Generate "country" polygon
const center = [width/2, height/2];
const avg_radius = 200;
const num_lines = 30;

let points = randomPolygon(center, avg_radius, 0.7, 0.1, num_lines);
let triangles = listToMatrix(earcut.default(points.flat()).map(i => points[i]), 3);

// Draw randomly generated polygon
svg.append('polygon')
	.attr('points', points.map((pair) => {
		return pair[0] + ',' + pair[1] + ' ';
	}))
	.attr('fill', '#DDD')
	.attr('stroke', 'black')



/*************
*            *
* Bubble Map *
*            *
**************/

const radius = d3.scaleSqrt([0, 100], [5, 30]);

// Draw points on the graph
let numBubbles = Math.round(Math.random() * 10 + 20);
let bubbleValues = [...Array(numBubbles).keys()].map(_=> round5(Math.max(gaussianRandom(50, 25), 0)));
let labelledBubbles = generateCompPair(numBubbles).sort((a, b) => (bubbleValues[a] - bubbleValues[b]));

let answer = Math.round(Math.max(...labelledBubbles.map(i => bubbleValues[i])) - Math.min(...labelledBubbles.map(i => bubbleValues[i])))
Revisit.postAnswers({ groundTruth: answer });

for (let i = 0; i < numBubbles; i++) {
	let point = calcRandomPoint(selectRandomTriangle(triangles));

	svg.append("circle")
		.attr("id", bubbleValues[i])
		.attr("fill", "red")
		.attr("fill-opacity", 0.5)
		.attr("stroke", "white")
		.attr("stroke-width", 0.5)
		.attr("transform", _=> `translate(${point})`)
		.attr("r", _=> radius(bubbleValues[i]))

	if (labelledBubbles.includes(i)) {
		svg.append("text")
			.attr("transform", _=> `translate(${point[0]}, ${point[1]-9})`)
			.attr("text-anchor", "middle")
			.style("font", "14px sans-serif")
			.style("font-weight", "bold")
			.attr("dy", "1em")
			.text(labelledBubbles[0] == i ? "B" : "A")
	}
}

// Create map legend
const legend = svg.append("g")
		.attr("fill", "#777")
		.attr("transform", `translate(${width-100},${height-50})`)
		.attr("text-anchor", "middle")
		.style("font", "10px sans-serif")
	.selectAll()
		.data(radius.ticks(2))
	.join("g")
//		.attr("transform", (d, i) => `translate(${20 * i},0)`);

legend.append("circle")
	.attr("fill", "none")
	.attr("stroke", "#ccc")
	.attr("cy", d => -radius(d))
	.attr("r", radius);

legend.append("text")
	.attr("y", d => -2 * radius(d))
	.attr("dy", "1em")
	.text(radius.tickFormat(4, "s"));

container.append(svg.node());