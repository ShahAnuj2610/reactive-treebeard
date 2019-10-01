export function Tree() {
  this.root = null;
  // this function makes node root, if root is empty, otherwise delegate it to recursive function
  this.add = function(node) {
    if (this.root == null) this.root = new Node(node);
    // lets start our processing by considering root as parent
    else this.addChild(node, this.root);
  };

  this.addChild = function(node, parent) {
    console.log("add child", node, parent);
    // if the provided parent is actual parent, add the node to its children
    if (parent.name === node.parent) {
      parent.children.push(new Node(node));
    } else if (parent.children) {
      const parentData = parent.children.find(par => par.name === node.name);
      // if the provided parent children contains actual parent call addChild with that node
      if (parentData) this.addChild(node, parentData);
      else if (Object.keys(parent.children).length > 0) {
        // iterate over children and call addChild with each child to search for parent
        for (let p in parent.children) {
          this.addChild(node, parent.children[p]);
        }
      } else console.log("parent was not found");
    } else {
      console.log("parent was not found");
    }
  };
}

function Node(node) {
  this.name = node.name;
  this.parent = node.parent;
  this.children = [];
}
