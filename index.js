var acorn = require("acorn");

const ops = {
    ADD: '+',
    SUB: '-',
    MUL: '*',
    DIV: '/'
}

let globalScope = new Map();
class Visitor {
    visitVariableDeclaration(node) {
        const nodeKind = node.kind
        return this.visitNodes(node.declarations)
    }
    visitVariableDeclarator(node) {
        const id = this.visitNode(node.id)
        const init = this.visitNode(node.init)
        globalScope.set(id, init)
        return init
    }
    visitIdentifier(node) {
        const name = node.name
        if (globalScope.get(name))
            return globalScope.get(name)
        else
            return name
    }
    visitLiteral(node) {
        return node.raw
    }
    visitBinaryExpression(node) {
        const leftNode = this.visitNode(node.left)
        const operator = node.operator
        const rightNode = this.visitNode(node.right)
        switch (operator) {
            case ops.ADD:
                return leftNode + rightNode
            case ops.SUB:
                return leftNode - rightNode
            case ops.DIV:
                return leftNode / rightNode
            case ops.MUL:
                return leftNode * rightNode
        }
    }

    evalArgs(nodeArgs) {
        let g = []
        for (const nodeArg of nodeArgs) {
            g.push(this.visitNode(nodeArg))
        }
        return g
    }

    visitCallExpression(node) {
        const callee = this.visitIdentifier(node.callee)
        const _arguments = this.evalArgs(node.arguments)
        if (callee == "print") {
            console.log(..._arguments)
        }
    }

    visitExpressionStatement(node) {
        this.visitCallExpression(node.expression);
    }

    visitNodes(nodes) {
        for (const node of nodes) {
            this.visitNode(node)
        }
    }

    visitProgram(node) { 
        return this.visitNodes(node.body);
    }

    visitNode(node) {
        switch (node.type) {
            case 'Program': 
                return this.visitProgram(node);
            case 'VariableDeclaration':
                return this.visitVariableDeclaration(node)
            case 'VariableDeclarator':
                return this.visitVariableDeclarator(node)
            case 'Literal':
                return this.visitLiteral(node)
            case 'Identifier':
                return this.visitIdentifier(node)
            case 'BinaryExpression':
                return this.visitBinaryExpression(node)
            case "CallExpression":
                return this.visitCallExpression(node)
            case "ExpressionStatement":
                return this.visitExpressionStatement(node)
        }
    }

    run(ast) {
        return this.visitNode(ast);
    }
}

class Interpreter {
    constructor(visitor) {
        this.visitor = visitor
    }

    interpret(ast) {
        return this.visitor.run(ast)
    }
}

// class Visitor {
//     /* Deal with nodes in an array */
//     visitNodes(nodes) { 
//         for (const node of nodes) {
//             this.visitNode(node); 
//         }
//     }
//     /* Dispatch each type of node to a function */
//     visitNode(node) {
//         switch (node.type) {
//             case 'Program': return this.visitProgram(node);
//             case 'VariableDeclaration': return this.visitVariableDeclaration(node);
//             case 'VariableDeclarator': return this.visitVariableDeclarator(node);
//             case 'Identifier': return this.visitIdentifier(node);
//             case 'Literal': return this.visitLiteral(node);
//         }
//     }
//     /* Functions to deal with each type of node */
//     visitProgram(node) { 
//         return this.visitNodes(node.body);
//     }
//     visitVariableDeclaration(node) { 
//         return this.visitNodes(node.declarations); 
//     }
//     visitVariableDeclarator(node) {
//         this.visitNode(node.id);
//         return this.visitNode(node.init);
//     }
//     visitIdentifier(node) { 
//         return node.name; 
//     }
//     visitLiteral(node) { 
//         return node.value; 
//     }
// }

// var visitor = new Visitor();
// visitor.visitNode(ast);

const ast = acorn.parse(`
let a = 90;
const b = "nnamdi";
const c = a*5;
print(a);
print(b);
print(c);
`, { ecmaVersion: 2020 });

new Interpreter(new Visitor()).interpret(ast)