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

	}

	get circumcenter() {

		console.log("=== CIRCUMCENTER ===");

		// Copying the point thus making a new vector object independent of the original one
		// in other words any operation done on this copy won't have any effect on the original.
		// So I take that copy subtract from it the next point and get the edge.

		// edgeA = Vertex A → Vertex B, edgeB = Vertex B → Vertex C

		let edgeA = this.points[1].copy().sub(this.points[0]), edgeB = this.points[2].copy().sub(this.points[1]);

		console.log(`edgeA: (${edgeA.x}, ${edgeA.y})`);
		console.log(`edgeB: (${edgeB.x}, ${edgeB.y})`);

		// Finding the center of each edge

		let middleA = this.points[1].copy().add(this.points[0]).div(2), middleB = this.points[2].copy().add(this.points[1]).div(2);

		console.log(`middleA: (${middleA.x}, ${middleA.y})`);
		console.log(`middleB: (${middleB.x}, ${middleB.y})`);

		// Creating a normal vector to edgeA and edgeB and writing it to them
		// Rotate by 90° = (-y, x)

		edgeA = createVector(-edgeA.y, edgeA.x);
		edgeB = createVector(-edgeB.y, edgeB.x);		

		console.log(`normA: (${edgeA.x}, ${edgeA.y})`);
		console.log(`normB: (${edgeB.x}, ${edgeB.y})`);

		// scalar = 1/(m_x_1*-m_y_2 + m_x_2*m_y_1)*(b_x_1 - b_x_2)
		// m1 = edgeA, m2 = edgeB, b1 = middleA, b2 = middleB
		// 1 / (edgeA.x * edgeB.y - edgeB.x * edgeA.y) * (middleA.x * edgeB.y - middleB.x * edgeA.y);

		let scalar = ;

		console.log(`scalar: ${scalar}`);

		// and finally the point of interesection aka the circumcenter
		// the equation below is describing the line made by A

		return edgeA.mult(scalar).add(middleA);
	}

	subDivide() {

		

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

	let tstTriangle = new Triangle([createVector(-1, 0), createVector(0, 1), createVector(2, -1)], color(0, 0, 0));

	console.log(tstTriangle.circumcenter.toString());

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

			const minDistance = 50;

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

// Event functions \\

function triangulationHandler() {

	console.log("Triangulation...");

	// Loop through all of the points and find if any are laying on top of each other
	// The reason why this check is here and is not being done every time the user places a point
	// is because of preformance reasons.
	// In my opinion it's better to just do the points check when the user wants to do the triangulation
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