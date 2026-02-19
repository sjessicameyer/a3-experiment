// Generate a star convex polygon
// https://stackoverflow.com/a/25276331/31040913
function randomPolygon(center, radius, irregularity, spikiness, num_vertices) {
	irregularity *= 2 * Math.PI / num_vertices;
	spikiness *= radius;
	let angle_steps = randomAngleSteps(num_vertices, irregularity);

	let points = [];
	let angle = Math.random() * (2 * Math.PI);
	for (let i = 0; i < num_vertices; i++) {
		let r = Math.min((2 * radius), Math.max(gaussianRandom(radius, spikiness), 0));
		let point = [center[0] + r * Math.cos(angle), center[1] + r * Math.sin(angle)];
		points.push(point);
		angle += angle_steps[i];
	}

	return points;
}

function randomAngleSteps(steps, irregularity) {
	let angles = [];
	let lower = (2 * Math.PI / steps) - irregularity;
  let upper = (2 * Math.PI / steps) + irregularity;
	let cumsum = 0;
	for (let i = 0; i < steps; i++) {
		let angle = Math.random() * (upper-lower) + lower;
		angles.push(angle);
		cumsum += angle;
	}

	// Normalize
	cumsum /= (2 * Math.PI);
	for (let i = 0; i < steps; i++) {
		angles[i] /= cumsum;
	}

	return angles;
}

// Normal Distribution generator
// https://stackoverflow.com/a/36481059/31040913
function gaussianRandom(mean, stdev) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}
