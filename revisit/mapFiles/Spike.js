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



/************
*           *
* Spike Map *
*           *
*************/

const length = d3.scaleLinear([0, 100], [0, 100]);

// Draw points on the graph
let numSpikes = Math.round(Math.random() * 10 + 20);
let spikeValues = [...Array(numSpikes).keys()].map(_=> round5(Math.max(gaussianRandom(50, 25), 0)));
let labelledSpikes = generateCompPair(numSpikes).sort((a, b) => (spikeValues[a] - spikeValues[b]));

let answer = Math.round(Math.max(...labelledSpikes.map(i => spikeValues[i])) - Math.min(...labelledSpikes.map(i => spikeValues[i])))
Revisit.postAnswers({ groundTruth: answer });

for (let i = 0; i < numSpikes; i++) {
	let point = calcRandomPoint(selectRandomTriangle(triangles));

	svg.append("path")
		.attr("id", spikeValues[i])
		.attr("fill", "red")
		.attr("fill-opacity", 0.4)
		.attr("stroke", "red")
		.attr("stroke-width", 0.5)
		.attr("transform", _=> `translate(${point})`)
		.attr("d", _=> spike(length(spikeValues[i])))

	if (labelledSpikes.includes(i)) {
		svg.append("text")
			.attr("transform", d => `translate(${point})`)
			.attr("text-anchor", "middle")
			.style("font", "14px sans-serif")
			.style("font-weight", "bold")
			.attr("dy", "1em")
			.text(labelledSpikes[0] == i ? "B" : "A")
	}
}

// Draw noise on the graph
for (let i = 0; i < Math.round(Math.random() * 10 + 20); i++) {
	let point = calcRandomPoint(selectRandomTriangle(triangles));
	let value = round5(Math.max(gaussianRandom(25, 10), 0));
	svg.append("path")
		.attr("id", value)
		.attr("fill", "red")
		.attr("fill-opacity", 0.4)
		.attr("stroke", "red")
		.attr("stroke-width", 0.5)
		.attr("transform", d => `translate(${point})`)
		.attr("d", _=> spike(length(value)))
}

// Create map legend
const legend = svg.append("g")
		.attr("fill", "#777")
		.attr("transform", `translate(${width-100},${height-50})`)
		.attr("text-anchor", "middle")
		.style("font", "10px sans-serif")
	.selectAll()
		.data(length.ticks(5).slice(1))
	.join("g")
		.attr("transform", (d, i) => `translate(${20 * i},0)`);

legend.append("path")
	.attr("fill", "red")
	.attr("fill-opacity", 0.5)
	.attr("stroke", "red")
	.attr("stroke-width", 0.5)
	.attr("d", d => spike(length(d)));

legend.append("text")
	.attr("dy", "1em")
	.text(length.tickFormat(4, "s"));

container.append(svg.node());