// Variables \\

let mainCanvas;

let closestPoint;

let points = [];

// Classes \\

class Triangle {

	constructor(points, triangleColor) {

		// Sort the points in an ascending order according to their x coordinate

		points.sort((a, b) => { return a.x - b.x; });

		this.points = points;
		this.triangleColor = triangleColor;

		// CIRCUMCENTER

		// btw I am using the p5.Vector due to preformance reasons since I believe it's better
		// to use a function (that for example adds 2 vectors together) that takes it's arguments
		// by reference and does some operation on them and returns the final vector
		// Rather than to make a copy of some vector (so copy the ENTIRE vector) and the do the operation
		// on it

		// edgeA = Vertex A → Vertex B, edgeB = Vertex B → Vertex C

		let edgeA = p5.Vector.sub(this.points[1], this.points[0]), edgeB = p5.Vector.sub(this.points[2], this.points[1]);

		// Finding the center of each edge

		let middleA = p5.Vector.add(this.points[0], this.points[1]).div(2), middleB = p5.Vector.add(this.points[1], this.points[2]).div(2);

		// Creating a normal vector to edgeA and edgeB and writing it to them
		// Rotate by 90° = (-y, x)

		edgeA = createVector(-edgeA.y, edgeA.x);
		edgeB = createVector(-edgeB.y, edgeB.x);

		let scalar = (edgeB.x*(middleB.y - middleA.y) - edgeB.y*(middleB.x - middleA.x))/(edgeB.x*edgeA.y - edgeB.y*edgeA.x);

		// and finally the point of interesection aka the circumcenter
		// the equation below is describing the line made by edgeA (the perpendicular version)

		this.circumcenter = edgeA.mult(scalar).add(middleA);

		// The radius is squared due to optimatization reasons

		this.circumradiusSq = p5.Vector.sub(this.points[0], this.circumcenter).magSq();

	}

	get edges() {

		// The edges are recorded in the following order
		// VertexA → VertexB, VertexB → VertexC, VertexA → VertexC

		return [

			[this.points[0], this.points[1]],
			[this.points[1], this.points[2]],
			[this.points[0], this.points[2]]

		];
	}

	subDivide() {

		// This function will "sub divide" the triangle
		// aka it will turn the triangle into 3 smaller ones
		// that make up the original one

		

	}

}

// Code \\

/*

TODO:

• Triangulate function
• Make it possible for the triangulation to be shown step by step
• Make it possible for the points to be deleted
• Add a more optimatizated version of the Nearest Neighboar Search

• Save function (make a download dialogue window pop up)

*/

function setup() {

	// The canvas is in a variable since I would like the mouseClicked event to be only fired when the user clicks on the canvas
	// If I would only use the mouseClicked function alone then the event would be fired every time the user clicks

	mainCanvas = createCanvas(400, 400);

	mainCanvas.doubleClicked(() => {

		// Double click == delete selected point

		console.log("DELETE REQUEST");

	});

	mainCanvas.mouseClicked(() => {

		// If closestPoint exists than it means that we have a selected point we want to move
		// Once we click this points will turn black and will stay on the current position
		// of the mouse and then the variable closestPoint will be set to null since
		// we placed the point and we have no other point selected

		if (closestPoint) {

			closestPoint.color = color(0);
			closestPoint.position = createVector(mouseX, mouseY);

			closestPoint = null;

			return; // We placed the point and we don't want to do anything else
		}

		// This part of the code checks for the closest point to the mouse

		{

			let mousePosition = createVector(mouseX, mouseY);

			let currentPoint;
			let currentSmallestDistance = Number.MAX_SAFE_INTEGER, currentDistance;

			const minDistance = 25;

			// Check for the nearest point that is both closest to the mouse
			// and also the distance is smaller than minLength		

			// This is kinda of a brute force way of solving the NNS (Nearest Neighboar Search)
			// Will optimaze later

			for (let i = 0; i < points.length; i++) {

				currentPoint = points[i];

				currentDistance = mousePosition.dist(currentPoint.position);

				/*console.log("=== DEBUG ===");
				console.log(`currentPoint   : { color: ${currentPoint.color}, position: ${currentPoint.position} }`);
				console.log(`currentDistance: ${currentDistance}`);
				console.log(`currentDistance >= minDistance => ${currentDistance >= minDistance}`);
				console.log(`currentDistance >= currentSmallestDistance => ${currentDistance >= currentSmallestDistance}`);
				console.log(`currentDistance >= minDistance || currentDistance >= currentSmallestDistance => ${currentDistance >= minDistance || currentDistance >= currentSmallestDistance}`);*/

				// This checks if the point is closer than minDistance and if the distance
				// is smaller than the current smallest distance. The current smallest distance
				// check is there since the point may satisfy the minDistance check however it may still be 
				// further away than the current best option.
				// This expression is however negated and if neither one or the other is satisfied
				// the loop moves (continues) onto the next point.
				// currentDistance < minDistance && currentDistance < currentSmallestDistance
				// This is the expression described in the first paragraph and it's negated form
				// is listed below

				if (currentDistance >= minDistance || currentDistance >= currentSmallestDistance) continue;

				currentSmallestDistance = currentDistance;

				closestPoint = currentPoint;

			}
		}

		if (closestPoint) { closestPoint.color = color(255, 0, 0); return; }

		// This part of the code creates a new point and pushes it onto the stack

		points.push({color: color(0, 0, 0), position: createVector(mouseX, mouseY)});

	});

	// Button used to create the Delaunay Triangulation

	createButton("Triangulovat")
	.attribute('type', 'button')
	.mousePressed(triangulationHandler);

	// Button used for saving

	createButton("Uložit")
	.attribute('type', 'button')
	.mousePressed(saveHandler);

	// Button used for resseting the canvas (deleting the points and triangulation)

	createButton("Smazat")
	.attribute('type', 'button')
	.mousePressed(deleteHandler);

}

function draw() {

	// This function is very important
	// Each time the draw function is called this function changes the background colour to 255 (white)
	// and "CLEARS" the canvas
	// If this functions wouldn't be here than the canvas would be spammed with overlapping points
	// and could result in preformance issues over time
	// So don't delete plz thx

	background(255);

	// This part of the code makes the selected point follow the mouse

	if (closestPoint) closestPoint.position = createVector(mouseX, mouseY);

	// Rendering the points

	for (let i = 0; i < points.length; i++) {

		// Why is it called canvasPoint and not point? Since point is a reserved variable by p5.js

		let canvasPoint = points[i].position;

		noStroke();

		fill(points[i].color);

		circle(canvasPoint.x, canvasPoint.y, 5);

	}
}

// Button functions \\

function triangulationHandler() {

	console.log("Triangulation...");

	// Loop through all of the points and find if any are laying on top of each other
	// The reason why this check is here and is not being done every time the user places a point
	// is because of preformance reasons.
	// In my opinion it's better to just do the points overlap check when the user wants to do the triangulation
	// Rather than going through the entire "points" array and check if some of the points are overlapping
	// every time the user places a point

	// It's also in it's own scope so there are no variable name collisions
	// And so that the variables are freed from the memory once the program is out of the scope

	{

		let previousPosition, currentPosition;

		for (let i = 1; i < points.length; i++) {

			previousPosition = points[i - 1].position;
			currentPosition = points[i].position;

			if (previousPosition.x == currentPosition.x && previousPosition.y == currentPosition.y) {

				console.log("=== OVERLAP ===");

				console.log(`currentPosition: (${currentPosition.x}, ${currentPosition.y})`);
				console.log(`previousPosition: (${previousPosition.x}, ${previousPosition.y})`);

				points.splice(i, i);

				i--;

			}
		}
	}

	// Check if there are at least 3 points

	if (points.length < 3) { alert("Počet bodů musí být větší než 3"); console.log(`Number of points: ${points.length}`); return; }

	// Sort the points depending on their x coordinate in an ascending order

	points.sort((a, b) => { return a.position.x - b.position.x; });

	// Initialize the incomplete triangles array with the "Super triangle"

	let incompleteTriangles = [

		new Triangle(

			[

				createVector(-10000, 10000),
				createVector(mainCanvas.width/2, -10000),
				createVector(10000, 10000)

			],

			color(0, 0, 0)

		)
	];

	let edges = [], flaggedTriangles = [];

	let currentPoint, currentTriangle, edgesToDelete;

	// edgesToDelete, even though it's not mentioned in the
	// paper I've found out that the amount of triangles
	// that interesect a point corresponds to the amount
	// of duplicate edges that will have to be deleted 
	// minus 1

	// For each point we would loop through the incomplete
	// triangles array and do the necessary operations

	for (let i = 0; i < points.length; i++) {

		currentPoint = points[i].position;

		for (let j = 0; j < incompleteTriangles; j++) {

			currentTriangle = incompleteTriangles[j];

			// D^2 > R^2 basically if the distance from the circumcenter
			// of the current triangle to the current point is greater than
			// the radius of the circumcircle than this point doesn't interesect
			// the circumcircle of the current triangle
			// Thus this triangle's circumcircle cannot intersect any other
			// point and won't be sub divided

			if (p5.Vector.sub(currentTriangle.circumcenter, currentPoint).magSq() > currentTriangle.circumradiusSq) continue;

			flaggedTriangles.push(currentTriangle);

		}

		// Now the flagged triangles will be subdivided
		// Once completed the new set of triangles will be
		// used to replace the old incompelteTriangles

		// Now why is it dones this way? Why don't I simply
		// delete and subdivide the triangle once I find out
		// that it intersects a point
		// Simple if I did the length of the array would change
		// and the for loop would be skipping some triangles

	}
}

function saveHandler() {

	console.log("Saving...");

	let fileName = prompt("Název souboru");

	if (fileName == null) return; // The user clicked on cancle

	saveCanvas(fileName || "BezNazvu", "png"); // If there is no file name that means the user wants to save
						   // However they didn't input any name for the file

}

function deleteHandler() {

	console.log("Deleting...");

	points.length = 0;

	closestPoint = null;

}

// DEBUG \\

/*function keyPressed() {

	// 68 == "D"

	if (keyCode == 68) {

		

	}
}*/