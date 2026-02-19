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
	.attr('fill', 'white')
	.attr('stroke', 'black')



/*************
*            *
* Hexbin Map *
*            *
**************/

const x = Math.min(...points.map(p => p[0]));
const y = Math.min(...points.map(p => p[1]));
const widthX = Math.max(...points.map(p => p[0]));
const heightY = Math.max(...points.map(p => p[1]));

// Generate data
let numHexbins = Math.round(Math.random() * 50 + 150);
let hexbinValues = [...Array(numHexbins).keys()].map(_=> round5(Math.max(gaussianRandom(50, 25), 0)));

// Create the bins
const hexbin = d3.hexbin()
	.extent([[x, y], [widthX, heightY]])
	.radius(12.5)
	.x(d => d.xy[0])
	.y(d => d.xy[1]);
const bins = hexbin(hexbinValues.map(d => ({xy: calcRandomPoint(selectRandomTriangle(triangles)), value: d})))
	.map(d => (d.value = d3.median(d, d => d.value), d))
	.sort((a, b) => b.length - a.length)

// Draw hexbins on graph
const range = d3.extent(bins, d => round5(d.value));
const color = d3.scaleSequential(range, d3.interpolateSpectral);
const radius = d3.scaleSqrt([0, d3.max(bins, d => d.length)], [0, hexbin.radius() * Math.SQRT2]);

svg.append("g")
	.selectAll("path")
	.data(bins)
	.join("path")
		.attr("id", d => round5(d.value))
		.attr("transform", d => `translate(${d.x},${d.y})`)
		.attr("d", d => hexbin.hexagon(radius(d.length)))
		.attr("fill", d => color(round5(d.value)))
		.attr("stroke", d => d3.lab(color(round5(d.value))).darker())


// Label Hexbins on graph
let labelledHexbins = generateCompPair(bins.length).sort((a, b) => (bins[a].value - bins[b].value));

let answer = round5(Math.max(...labelledHexbins.map(i => bins[i].value)) - Math.min(...labelledHexbins.map(i => bins[i].value)));
Revisit.postAnswers({ groundTruth: answer });

labelledHexbins.forEach(label => {
	svg.append("text")
		.attr("transform", _=> `translate(${bins[label].x}, ${bins[label].y-9})`)
		.attr("text-anchor", "middle")
		.style("font", "14px sans-serif")
		.style("font-weight", "bold")
		.attr("dy", "1em")
		.text(labelledHexbins[0] === label ? "B" : "A")
})

// Create map legend
svg.append("g")
	.attr("transform", `translate(${width-205},10)`)
	.append(() => Legend(d3.scaleSequential(range, d3.interpolateSpectral), {
		title: "Average Population Value", 
		width: 195, 
		tickValues: [...range, round5(range[1] * 0.25), round5(range[1] * 0.5), round5(range[1] * 0.75)]
	}));

container.append(svg.node());