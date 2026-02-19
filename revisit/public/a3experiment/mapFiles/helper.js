// Turn 1D array into 2D with subarrays of size elementsPerSubArray
// https://stackoverflow.com/a/4492417/31040913
function listToMatrix(list, elementsPerSubArray) {
	let matrix = [], i, k;

	for (i = 0, k = -1; i < list.length; i++) {
		if (i % elementsPerSubArray === 0) {
			k++;
			matrix[k] = [];
		}
		matrix[k].push(list[i]);
	}
	return matrix;
}


// Function to easily round values
// https://stackoverflow.com/a/7343013/31040913
function round5(value) {
	return (value % 5) >= 2.5 ? Math.round(value / 5) * 5 + 5 : Math.round(value / 5) * 5;
}


// Function to easily round percentage values
function percentageRound(value, precision) {
	let multiplier = Math.pow(10, precision || 0);
	return Math.round(value * 100 * multiplier) / multiplier;
}


// Draw a spike on the spike map
// https://observablehq.com/@d3/spike-map/2
spike = (length, width = 7) => `M${-width / 2},0L0,${-length}L${width / 2},0`


// Generate two unique values within a range
function generateCompPair(maxVal) {
	let pairs = [Math.round(Math.random() * (maxVal-1))];

	let p = Math.round(Math.random() * (maxVal-1));
	while (p === pairs[0]) {
		console.log("-> ", p);
		p = Math.round(Math.random() * (maxVal-1));
	}

	pairs.push(p);

	return pairs;
}

// Generate two unique voronoi clusters that are completely enclosed within the polygon
function generateVoronoiCompPair(maxVal, polygon, voronoi) {
	let pairs = [];

	for (let i = 0; i < 2; i++) {
		let p = Math.round(Math.random() * (maxVal-1));
		while (pairs.indexOf(p) !== -1 || !voronoi.cellPolygon(p).map(v => d3.polygonContains(polygon, v)).every(Boolean)) {
			p = Math.round(Math.random() * (maxVal-1));
		}
		pairs.push(p);
	}

	return pairs;
}
