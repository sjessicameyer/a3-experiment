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
let country = svg.append('polygon')
	.attr('points', points.map((pair) => {
		return pair[0] + ',' + pair[1] + ' ';
	}))
	.attr('fill', '#DDD')
	.attr('stroke', 'black')

// Generate bounding box
const x = Math.min(...points.map(p => p[0]));
const y = Math.min(...points.map(p => p[1]));
const widthX = Math.max(...points.map(p => p[0]));
const heightY = Math.max(...points.map(p => p[1]));



/*****************
*                *
* Choropleth Map *
*                *
******************/

// Create clipping mask
svg.append('clipPath')
	.attr('id', 'countryBorder')
	.append('polygon')
	.attr('points', points.map((pair) => {
		return pair[0] + ',' + pair[1] + ' ';
	}))

// Create "counties" within the map
const numCounties = 30;
const delaunay = d3.Delaunay.from([...Array(numCounties).keys()].map(_ => calcRandomPoint(selectRandomTriangle(triangles))));
let voronoi = delaunay.voronoi([x, y, widthX, heightY]);

// Generate random values for each county
const color = d3.scaleSequential([0, 100], d3.interpolateBlues)
let values = [...Array(numCounties).keys()].map(_ => Math.max(round5(gaussianRandom(50, 25)), 0));

svg.append("g").selectAll("path")
	.data(voronoi.cellPolygons())
	.enter()
	.append("path")
	.attr("id", (d) => values[d.index])
	.attr("d", (d) => { return d ? ("M" + d.join("L") + "Z") : null; })
	.attr("fill", (d) => color(values[d.index]))
	.attr("stroke", "white")
	.attr('clip-path', 'url(#countryBorder)')

// Label and collect data on two counties
let labelledCounties = generateVoronoiCompPair(numCounties, points, voronoi);
labelledCounties.sort((a, b) => values[a] - values[b]);

let answer = Math.round(values[labelledCounties[1]] - values[labelledCounties[0]]);
Revisit.postAnswers({ groundTruth: answer });

for (let i = 0; i < 2; i++) {
	let point = d3.polygonCentroid(voronoi.cellPolygon(labelledCounties[i]));
	svg.append("text")
		.attr("transform", _=> `translate(${point[0]}, ${point[1]-10})`)
		.attr("text-anchor", "middle")
		.style("font", "14px sans-serif")
		.style("font-weight", "bold")
		.attr("dy", "1em")
		.text(i == 0 ? "B" : "A")	
}

// Draw legend
svg.append("g")
	.attr("transform", `translate(${width-205},10)`)
	.append(() => Legend(d3.scaleSequential([0,100], d3.interpolateBlues), {width: 195, tickValues: [0,25,50,75,100]}))

container.append(svg.node());