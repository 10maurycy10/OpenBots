"use strict";

function nodehash(node) {
	return node.toString();
}

// Breath first search pathfinder.
// TODO, use A*?
function path(start_node, aval_moves, is_passable, is_goal) {
	// All nodes, w/ dcost and parrent.
	var seen_nodes = new Map();
	var node_queue = [];
	function insert_node(node, parrent, dcost) {
		// cost value is unused.
		seen_nodes.set(nodehash(node), {dcost: dcost, parrent: parrent});
		node_queue.push(node);
	}
	insert_node(start_node);
	while (node_queue.length > 0) {
		var cnode = node_queue.shift();
		//console.log("PATHER, cnode ",cnode," queue size ", node_queue.length)
		//console.log(node_queue)
		//console.log(node_queue[node_queue.length -1])
		if (is_goal(cnode)) {
			console.log("pathing done!");
			// Traverse the path, backwards, saving steps into buffer.
			var path_buf = [cnode];
			while (cnode != start_node) {
				var pnode = seen_nodes.get(nodehash(cnode)).parrent;
				path_buf.unshift(pnode);
				cnode = pnode;
			}
			console.log(path_buf);
			return path_buf;
		} else {
			var moves = aval_moves(cnode).filter((node) => is_passable(node));
			for (var move of moves) {
				const in_queue = node_queue.some(
					(node) => node[0] == move[0] && node[1] == move[1]
				);
				if (!(seen_nodes.has(nodehash(move)) || in_queue)) {
					insert_node(move, cnode, 0); // keep cost at zero as it is unused.
				}
			}
		}
	}
	return null;
}

module.exports = path;
