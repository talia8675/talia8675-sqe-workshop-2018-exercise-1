import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

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
        else rows.push(rowInTable(variable.id.loc.start.line,'variable declaration' ,variable.id.name,'', escodegen.generate(variable.init)));
    }
}

function expressionStatement(codeJasonBody, rows){
    let exp = codeJasonBody.expression;
    return rows.push(rowInTable(exp.left.loc.start.line ,'assignment expression',  exp.left.name ,'',  escodegen.generate(exp.right)) );
}

function returnStatement(codeJasonBody, rows) {
    let arg = codeJasonBody.argument;
    rows.push(rowInTable(arg.loc.start.line ,'return statement','','', escodegen.generate(arg)));
}

function whileStatement(codeJasonBody, rows) {
    rows.push(rowInTable(codeJasonBody.test.left.loc.start.line, 'while statement', '', escodegen.generate(codeJasonBody.test), ''));
    loopItercode(rows, codeJasonBody.body);
}

function ifStatement(codeJasonBody, rows) {
    rows.push(rowInTable(codeJasonBody.test.left.loc.start.line, 'if statement', '', escodegen.generate(codeJasonBody.test), ''));
    if(codeJasonBody.consequent.type === 'BlockStatement')
        loopItercode(rows, codeJasonBody.consequent);
    else funcByType[codeJasonBody.consequent.type](codeJasonBody.consequent, rows);
    if (codeJasonBody.alternate != null && codeJasonBody.alternate.type === 'IfStatement')
        elseIfStatement(rows, codeJasonBody.alternate);
    else if(codeJasonBody.alternate != null)
        elseStatement(rows, codeJasonBody.alternate);
}

function elseIfStatement(rows, alt){
    rows.push(rowInTable(alt.test.left.loc.start.line, 'else if statement', '', escodegen.generate(alt.test), ''));
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
    let line = codeJasonBody.loc.start.line;
    let init=escodegen.generate(codeJasonBody.init);
    if(init.substr(init.length-1)===';')
        init = init.substr(0,init.length-1);
    let test = escodegen.generate(codeJasonBody.test);
    let update = escodegen.generate(codeJasonBody.update);
    let cond = '(' + init +'; ' + test + '; '+ update +')';
    rows.push(rowInTable(line, 'for statement', '',cond, ''));

    if(codeJasonBody.body.type === 'BlockStatement')
        loopItercode(rows, codeJasonBody.body);
    else funcByType[codeJasonBody.body.type](codeJasonBody.body, rows);


}
