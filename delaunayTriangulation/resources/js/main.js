// Variables \\

let mainCanvas;

let closestPoint;

let points = [];

let triangles= [];

/*

s - size of the array

y = s/f(x) - gives j

i = j

7 - 1 = 0, 7 = 1, 12 = 2, 16 = 3, 19 = 4
6 - 
5 - 
4 - 
3 - 
2 - 

[a, b, c, d, e, f, g] 21
[a, b, c, d, e, f]    15
[a, b, c, d, e]       10
[a, b, c, d]          6
[a, b, c]             3
[a, b]                1

(7, 21)
(6, 15)
(5, 10)
(4, 6)
(3, 3)
(2, 1)

f(x) = 1/2*x^2 - 1/2*x - tells us how many times will the array be accesed

visual representation of how the comparasion process works
the elements in brackets are the elements which are
being compared. i is the leftmost bracket j is the
rightmost bracket.


f(5) = 1/2*5^2 - 1/2*5 = 10 - the array will be accesed 10 times

[(a), (b), c, d, e] 1  - i = 0, j = 1
[(a), b, (c), d, e] 2  - i = 0, j = 2
[(a), b, c, (d), e] 3  - i = 0, j = 3
[(a), b, c, d, (e)] 4  - i = 0, j = 4
[a, (b), (c), d, e] 5  - i = 1, j = 2
[a, (b), c, (d), e] 6  - i = 1, j = 3
[a, (b), c, d, (e)] 7  - i = 1, j = 4
[a, b, (c), (d), e] 8  - i = 2, j = 3
[a, b, (c), d, (e)] 9  - i = 2, j = 4
[a, b, c, (d), (e)] 10 - i = 3, j = 4

f(3) = 1/2*3^2 - 1/2*3 = 3 - the array will be accesed 3 times

[(a), (b), c] - i = 0, j = 1
[(a), b, (c)] - i = 0, j = 2
[a, (b), (c)] - i = 1, j = 2

*/

// Classes \\

class Triangle {

	constructor(points, triangleColor = color(0, 0, 0)) {

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

	contains(elements) {

		let currentElement;

		for (let i = 0; i < elements.length; i++) {

			currentElement = elements[i];

			// ik what you are thinking but screw it idc

			if (currentElement === this.points[0] || currentElement === this.points[1] || currentElement === this.points[2]) { return true; }

		}

		return false;
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
}

// Code \\

/*

TODO:

• Triangulate function
• Create edge class?
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

	let A = createVector(-10000, 10000), B = createVector(mainCanvas.width/2, -10000), C = createVector(10000, 10000);

	let incompleteTriangles = [

		new Triangle(

			[

				A,
				B,
				C

			]
		)
	];

	let completeTriangles = [], edges = [], flaggedTriangles = [];

	let currentPoint, currentTriangle, edgesToDelete;

	// edgesToDelete, even though it's not mentioned in the
	// paper I've found out that the amount of triangles
	// that interesect a point corresponds to the amount
	// of duplicate edges that will have to be deleted 
	// minus 1

	// For each point we would loop through the incomplete
	// triangles array and do the necessary operations

	for (let i = 0; i < points.length; i++) {

		edges.length = 0;
		flaggedTriangles.length = 0;

		edgesToDelete = 0;

		currentPoint = points[i].position;

		for (let j = 0; j < incompleteTriangles.length; j++) {

			currentTriangle = incompleteTriangles[j];

			// D^2 > R^2 basically if the distance from the circumcenter
			// of the current triangle to the current point is greater than
			// the radius of the circumcircle than this point doesn't interesect
			// the circumcircle of the current triangle
			// Thus this triangle's circumcircle cannot intersect any other
			// point and won't be sub divided

			if (p5.Vector.sub(currentTriangle.circumcenter, currentPoint).magSq() > currentTriangle.circumradiusSq) { completeTriangles.push(currentTriangle); continue; }

			edgesToDelete++;

			flaggedTriangles.push(currentTriangle);

			// The ... are used to "unpack" the array
			// that the get edges function returns

			edges.push(...currentTriangle.edges);

		}

		edgesToDelete--;

		// Before we move onto the subdivide stage we first have
		// to delete duplicate edges
		// The edgesToDelete variable tells us how many duplicate
		// edges there are present

		// If edgesToDelete == 0 that means that there is only
		// one triangle that we have to subdivide, one triangle
		// means that there are no duplicate edges
		// Thus we can skip this step and head straight to the
		// subdivision step

		if (edgesToDelete != 0) {

			let deletedDuplicates = 0;
			let size = edges.length;

			let loops = 1/2*size*size - 1/2*size;
			let lastIndex = size - 1;

			let floor = Math.floor;

			let flagged = [];

			let i = 0, j = 0; // this might conflict with the enclosing loop's i

			for (let k = 0; k < loops; k++) {

				// If the amount of edges that have been deleted == to the amount
				// of edges that we have to delete.
				// That means that all of the duplicate edges have been deleted
				// and we can break out of this loop and continue to the next step

				if (deletedDuplicates == edgesToDelete) break;

				i += floor(j/lastIndex);

				j = j%lastIndex + floor(j/lastIndex)*i + 1;

				// bro this is terrible do an edge class

				if (edges[i][0] != edges[j][0] || edges[i][1] != edges[j][1]) continue;

				flagged.push([i, j]);

				deletedDuplicates++;

			}

			// All of the duplicate edges have been flagged
			// now we just have to delete them. You may be
			// wondering why do I flag them and not just
			// delete them when I find them. This is because
			// if I would delete them the entire array would
			// shift thus the i and j calculations would
			// no longer be valid since they would be offseted
			// and none the stuff would no longer work.

			// [(a), b, c, (a), e, f] i = 0, j = 3 - delete duplicates
			// [(b), c, e, (f)]	  i = 0, j = 3 - j in this case has been shifted
			//					 this lead to it skipping e and
			//					 since the size changed i and j
			//					 will go out of bounds later
			//					 in the loop

			// Whenever I delete something in the array the elements will be shifted
			// by 1 to the left this k will help with correcting this issue.

			for (let k = 0; k < flagged.length; k++) {

				// The removal of the second edge has to come before
				// the removal of the first edge. This is because if
				// I would delete the first edge then the position
				// of the second edge in the array would shift to
				// the left. If I delete the second edge first
				// the first edge stays at the same index.

				//   0   1  2   3   4  5
				// [(a), b, c, (a), e, f] - remove the second duplicate
				//
				//   0   1  2  3  4
				// [(a), b, c, e, f] - see? e and f index changed however
				//		       a, b and c index remains the same

				edges.splice(flagged[k][1] - k, 0);
				edges.splice(flagged[k][0] - k, 0);

			}
		}

		// Now that we have looped through every incomplete triangle
		// and every single duplicate edge has been deleted
		// we will now create a new set of triangles out of
		// these remaning edges
		// Which will be placed into the incomplete triangles array
		// We will repeate these steps until the set of points
		// to be triangulated is exhausted

		let currentEdge;

		incompleteTriangles.length = 0;

		for (let j = 0; j < edges.length; j++) {

			currentEdge = edges[i];

			incompleteTriangles.push(new Triangle(

				currentEdge[0],
				currentEdge[1],
				points[i]

			));

		}
	}

	// Now that we have looped through all of the points
	// we now have to delete every triangle that shares
	// one of it's vertices with the super triangle

	// I start from the end and work my wait towards
	// the begging to avoid the index shifitng issue
	// if I would go from the front this would happen
	//
	// the elements in brackets are those to be deleted
	//   0   1  2  3   4   5
	// [(a), b, c, d, (e), f] - delete a
	//
	//  0  1  2   3   4
	// [b, c, d, (e), f]	  - the whole array shifted
	//			    b is no longer at index
	//			    1 c no longer at 2 d no
	//			    longer at 3 etc.
	//			    to resolve such issue 
	//			    we would need a variable
	//			    that would tell us by how
	//			    much the array is shifted
	//
	// Or we can do start from the end.
	// Let's take into consideration our previous example.
	//
	//   0   1  2  3   4   5
	// [(a), b, c, d, (e), f] - now instead of deleting a
	//			    we will start from the end
	//			    and delete e
	//   0   1  2  3  4
	// [(a), b, c, d, f]	  - and look at that only f
	//			    has been shifted but we
	//			    don't care about that
	//			    why? Because we know that
	//			    we don't want to delete f
	//			    in other words we don't
	//			    care about f. The only thing
	//			    of interest to us is that
	//			    the part of the array that
	//			    is yet to be accesed by the
	//			    program didn't shift so we can
	//			    continue as normal and we don't
	//			    need a variable to tell us the
	//			    amount of shift present.

	let toCompare = [A, B, C];

	for (let i = completeTriangles.length - 1; i => 0; i--) {

		if (!completeTriangles[i].contains(toCompare)) continue;

		completeTriangles.splice(i, 0);

	}

	triangles = completeTriangles;

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
	triangles.length = 0;

	closestPoint = null;

}

// DEBUG \\

/*function keyPressed() {

	// 68 == "D"

	if (keyCode == 68) {

		

	}
}*/