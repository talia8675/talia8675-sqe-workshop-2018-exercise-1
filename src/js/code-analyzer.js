import * as esprima from 'esprima';

export {parseCode,itercode};
const parseCode = (codeToParse) => {//get string of code, ret jason
    return esprima.parseScript(codeToParse, {loc: true});
};

function rowInTable(line, type, name, condition, value) {
    return  {
        Line: line,
        Type: type,
        Name: name,
        Condition: condition,
        Value: value
    };
}

function itercode(codeJason) {
    let rows = [];
    return loopItercode(rows ,codeJason);
}

function loopItercode (rows, codeJason) {
    for (let i = 0; i < codeJason.body.length; i++) {
        handleByType(codeJason.body[i],rows);
    }
    return rows;
}

const funcByType ={
    'FunctionDeclaration': functionDeclaration,
    'VariableDeclaration' : variableDeclaration,
    'ExpressionStatement' : expressionStatement,
    'ReturnStatement' : returnStatement,
    'WhileStatement' : whileStatement,
    'IfStatement' : ifStatement,
    'ForStatement' : forStatement
    //'UpdateExpression'
    //'AssignmentExpression'
};

function handleByType(codeJasonBody, rows) {
    return funcByType[codeJasonBody.type](codeJasonBody, rows);
}

function functionDeclaration(codeJasonBody, rows) {
    rows.push(rowInTable(codeJasonBody.id.loc.start.line, 'function declaration', codeJasonBody.id.name, '', ''));
    for (let i=0 ; i<codeJasonBody.params.length; i++){
        rows.push(rowInTable(codeJasonBody.params[i].loc.start.line, 'variable declaration', codeJasonBody.params[i].name, '', ''));
    }
    loopItercode(rows, codeJasonBody.body);
}

function variableDeclaration(codeJasonBody, rows) {
    for (let i = 0; i < codeJasonBody.declarations.length; i++) {
        let variable = codeJasonBody.declarations[i];
        if(codeJasonBody.declarations[i].init == null)
            rows.push(rowInTable(variable.id.loc.start.line, 'variable declaration', variable.id.name, '', ''));
        else expByType[variable.init.type](rows, variable.init,variable.id.loc.start.line, 'variable declaration' ,variable.id.name);
    }
}

const expByType = {
    'Identifier' : identifierFunc,
    'Literal' : literalFunc,
    'BinaryExpression' : binaryExpressionFunc,
    //'LogicalExpression'
    'UnaryExpression' : unaryExpressionFunc,
    'MemberExpression' : memberExpressionFunc,
    'ArrayExpression' : arrayExpressionFunc
};

function expressionStatement(codeJasonBody, rows){
    let exp = codeJasonBody.expression;
    return expByType[exp.right.type](rows, exp.right , exp.left.loc.start.line ,'assignment expression',  exp.left.name);
}

function identifierFunc(rows, exp,line, type , name){
    rows.push(rowInTable(line, type, name, '', exp.name));
}
function literalFunc(rows, exp,line,type, name){
    rows.push(rowInTable(line, type, name, '', exp.value));
}
function binaryExpressionFunc(rows, exp,line,type, name){
    rows.push(rowInTable(line, type, name, '', binExp(exp)));
}
function unaryExpressionFunc(rows, exp,line, type, name){
    rows.push(rowInTable(line, type, name, '', unaryExp(exp)));
}
function memberExpressionFunc(rows, exp,line, type, name) {
    rows.push(rowInTable(line, type, name, '', memberExp(exp)));
}
function arrayExpressionFunc(rows, exp,line, type, name) {
    rows.push(rowInTable(line, type, name, '', arrExp(exp)));
}

function returnStatement(codeJasonBody, rows) {
    let arg = codeJasonBody.argument;
    return expByType[arg.type](rows, arg , arg.loc.start.line ,'return statement',  '');
}

function whileStatement(codeJasonBody, rows) {
    rows.push(rowInTable(codeJasonBody.test.left.loc.start.line, 'while statement', '', binExp(codeJasonBody.test), ''));
    loopItercode(rows, codeJasonBody.body);
}

function ifStatement(codeJasonBody, rows) {
    rows.push(rowInTable(codeJasonBody.test.left.loc.start.line, 'if statement', '', binExp(codeJasonBody.test), ''));
    if(codeJasonBody.consequent.type === 'BlockStatement')
        loopItercode(rows, codeJasonBody.consequent);
    else funcByType[codeJasonBody.consequent.type](codeJasonBody.consequent, rows);
    if (codeJasonBody.alternate != null && codeJasonBody.alternate.type === 'IfStatement')
        elseIfStatement(rows, codeJasonBody.alternate);
    else if(codeJasonBody.alternate != null)
        elseStatement(rows, codeJasonBody.alternate);
}

function elseIfStatement(rows, alt){
    rows.push(rowInTable(alt.test.left.loc.start.line, 'else if statement', '', binExp(alt.test), ''));
    if(alt.consequent.type === 'BlockStatement')
        loopItercode(rows, alt.consequent);
    else funcByType[alt.consequent.type](alt.consequent, rows);

    if (alt.alternate != null && alt.alternate.type === 'IfStatement')
        elseIfStatement(rows, alt.alternate);
    else //if(alt.alternate != null)
        elseStatement(rows, alt.alternate);
}

function elseStatement(rows, alt){
    if (alt.type === 'BlockStatement')
        loopItercode(rows, alt);
    else funcByType[alt.type](alt, rows);
}

function forStatement(codeJasonBody, rows) {
    let init, line;
    if(codeJasonBody.init.type === 'VariableDeclaration'){
        init = 'let ' + codeJasonBody.init.declarations[0].id.name + '=' + codeJasonBody.init.declarations[0].init.value;
        line = codeJasonBody.init.declarations[0].loc.start.line;
    }
    else {
        init = binLeftRight[codeJasonBody.init.left.type](codeJasonBody.init.left) + '=' + binLeftRight[codeJasonBody.init.right.type](codeJasonBody.init.right);
        line = codeJasonBody.init.left.loc.start.line;
    }
    let test = binExp(codeJasonBody.test);
    let update = updeteExp(codeJasonBody.update);
    let cond = '(' + init +'; ' + test + '; '+ update +')';
    rows.push(rowInTable(line, 'for statement', '',cond, ''));
    loopItercode(rows, codeJasonBody.body);
}

const binLeftRight = {
    'Literal': isLiteral,
    'Identifier' : isIdentifier,
    'BinaryExpression' : isBinaryExpression,
    'MemberExpression' : isMemberExpression
};

function isLiteral(exp){
    return exp.value;
}
function isIdentifier(exp){
    return exp.name;
}
function isBinaryExpression(exp){
    return '('+binExp(exp)+')';
}
function isMemberExpression(exp){
    return memberExp(exp);
}

function arrExp(exp){
    let arr = [];
    for(let i=0; i<exp.elements.length; i++){
        arr.push(binLeftRight[exp.elements[i].type](exp.elements[i]));
    }
    return '[' +arr +']';
}
function updeteExp(exp){
    return exp.argument.name + exp.operator;
}
function binExp(exp) {
    return binLeftRight[exp.left.type](exp.left) +' '+ exp.operator +' ' +binLeftRight[exp.right.type](exp.right);
}
function unaryExp(exp) {
    let op = exp.operator;
    let right= '';
    if (exp.argument.type === 'Literal')
        right = exp.argument.value;
    if (exp.argument.type === 'Identifier')
        right = exp.argument.name;
    return op+right;
}
function memberExp(exp){
    if(exp.property.type ==='Literal')
        return exp.object.name + '[' + exp.property.value + ']';
    else //if(exp.property.type =='Identifier')
        return exp.object.name + '[' + exp.property.name + ']';
}