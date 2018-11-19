import $ from 'jquery';
import {parseCode,itercode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let rows = itercode(parsedCode);
        let tableBody = document.getElementById('tbody');
        tableBody.innerHTML = '';
        tableBody.innerHTML += firstRow();
        for(let i=0; i<rows.length; i++)
            tableBody.innerHTML += makeRow(rows[i]);
    });
});

function makeRow(row) {
    let fullRow = '<tr>\n'+
        '<td>'+row.Line+'</td>\n'+
        '<td>'+row.Type+'</td>\n';
    if(row.Name!=null)
        fullRow = fullRow +'<td>'+row.Name+'</td>\n';
    else fullRow = fullRow + '<td></td>\n';
    if(row.Condition!=null)
        fullRow = fullRow +'<td>'+row.Condition+'</td>\n';
    else fullRow = fullRow + '<td></td>\n';
    if(row.Value!=null)
        fullRow = fullRow +'<td>'+row.Value+'</td>\n';
    else fullRow = fullRow + '<td></td>\n';

    return fullRow + '</tr>';
}

function firstRow() {
    return '<tr>\n'+
        '<th>Line</th>\n'+
        '<th>Type</th>\n'+
        '<th>Name</th>\n'+
        '<th>Condition</th>\n'+
        '<th>Value</th>\n'+
        '</tr>';
}
