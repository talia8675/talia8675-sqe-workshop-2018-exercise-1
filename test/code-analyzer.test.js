import assert from 'assert';
import {itercode,parseCode} from '../src/js/code-analyzer';

describe('empty function test', () => {
    it('is parsing an empty function correctly', () => {
        assert.deepEqual(
            itercode(parseCode('')),
            []
        );
    });
});

describe('variable declaration tests', () => {
    it('is parsing a simple variable declaration correctly', () => {
        assert.deepEqual(
            itercode(parseCode('let a;')),
            [{Line: 1, Type: 'variable declaration', Name:'a', Condition: '',Value:''}]);
        assert.deepEqual(
            itercode(parseCode('let a = 1;')),
            [{Line: 1, Type: 'variable declaration', Name:'a', Condition: '',Value:'1'}]);
        assert.deepEqual(
            itercode(parseCode('let arr = [1];')),
            [{Line: 1, Type: 'variable declaration', Name:'arr', Condition: '',Value:'[1]'}]);
        assert.deepEqual(
            itercode(parseCode('let arr = -7;')),
            [{Line: 1, Type: 'variable declaration', Name:'arr', Condition: '',Value:'-7'}]);
        assert.deepEqual(
            itercode(parseCode('let arr = -h;')),
            [{Line: 1, Type: 'variable declaration', Name:'arr', Condition: '',Value:'-h'}]);
    });
});

describe('function declaration tests', () => {
    it('function', () => {
        assert.deepEqual(
            itercode(parseCode('function binarySearch(){}')),
            [{Line: 1, Type: 'function declaration', Name:'binarySearch', Condition: '', Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('function binarySearch(x){}')),
            [{Line: 1, Type: 'function declaration', Name:'binarySearch', Condition: '', Value:''},
                {Line: 1, Type: 'variable declaration', Name:'x', Condition: '', Value:''}]
        );
    });
});

describe('assignment expression tests', () => {
    it('assignment', () => {
        assert.deepEqual(
            itercode(parseCode('d=7;')),
            [{Line: 1, Type: 'assignment expression', Name:'d', Condition: '',Value:'7'}]
        );
        assert.deepEqual(
            itercode(parseCode('d=h;')),
            [{Line: 1, Type: 'assignment expression', Name:'d', Condition: '',Value:'h'}]
        );
        assert.deepEqual(
            itercode(parseCode('mid = (low + high)/2;')),
            [{Line: 1, Type: 'assignment expression', Name:'mid', Condition: '',Value:'(low + high) / 2'}]
        );
        assert.deepEqual(
            itercode(parseCode('mid = h[i];')),
            [{Line: 1, Type: 'assignment expression', Name:'mid', Condition: '',Value:'h[i]'}]
        );
    });
});

describe('return statement tests', () => {
    it('return', () => {
        assert.deepEqual(
            itercode(parseCode('function binarySearch(){\nreturn 1;}')),
            [{Line: 1, Type: 'function declaration', Name:'binarySearch', Condition: '', Value:''},
                {Line: 2, Type: 'return statement', Name:'', Condition: '', Value:'1'}]);
        assert.deepEqual(
            itercode(parseCode('function binarySearch(){\nreturn b;}')),
            [{Line: 1, Type: 'function declaration', Name:'binarySearch', Condition: '', Value:''},
                {Line: 2, Type: 'return statement', Name:'', Condition: '', Value:'b'}]);
        assert.deepEqual(
            itercode(parseCode('function binarySearch(){\nreturn b>0;}')),
            [{Line: 1, Type: 'function declaration', Name:'binarySearch', Condition: '', Value:''},
                {Line: 2, Type: 'return statement', Name:'', Condition: '', Value:'b > 0'}]);
        assert.deepEqual(
            itercode(parseCode('function binarySearch(){\nreturn b[0];}')),
            [{Line: 1, Type: 'function declaration', Name:'binarySearch', Condition: '', Value:''},
                {Line: 2, Type: 'return statement', Name:'', Condition: '', Value:'b[0]'}]);
    });
});

describe('while statement', () => {
    it('while', () => {
        assert.deepEqual(
            itercode(parseCode('while (r!=0){}')),
            [{Line: 1, Type: 'while statement', Name:'', Condition: 'r != 0',Value:''}]
        );
    });
});

describe('if else statement test', () => {
    it('if else', () => {
        assert.deepEqual(
            itercode(parseCode('if (X == y)\n' +
                '            high = mid - 1;\n' +
                '        else if (X > V[mid])\n' +
                '            low = mid + 1;\n' +
                '        else\n' +
                '            r=t;')),
            [{Line: 1, Type: 'if statement', Name:'', Condition: 'X == y',Value:''},
                {Line: 2, Type: 'assignment expression', Name:'high', Condition: '',Value:'mid - 1'},
                {Line: 3, Type: 'else if statement', Name:'', Condition: 'X > V[mid]',Value:''},
                {Line: 4, Type: 'assignment expression', Name:'low', Condition: '',Value:'mid + 1'},
                {Line: 6, Type: 'assignment expression', Name:'r', Condition: '',Value:'t'}]
        );
    });
});

describe('if else statement test with blocks', () => {
    it('if else', () => {
        assert.deepEqual(
            itercode(parseCode('if (X==y)\n' +
                '            {high = mid-1;}\n' +
                '        else if (X>V[mid])\n' +
                '            {low = mid+1;}\n' +
                '        else if (r==8)\n' +
                '            {low = 1;}\n' +
                '        else\n' +
                '            {r=t;}')),
            [{Line: 1, Type: 'if statement', Name:'', Condition: 'X == y',Value:''},
                {Line: 2, Type: 'assignment expression', Name:'high', Condition: '',Value:'mid - 1'},
                {Line: 3, Type: 'else if statement', Name:'', Condition: 'X > V[mid]',Value:''},
                {Line: 4, Type: 'assignment expression', Name:'low', Condition: '',Value:'mid + 1'},
                {Line: 5, Type: 'else if statement', Name:'', Condition: 'r == 8',Value:''},
                {Line: 6, Type: 'assignment expression', Name:'low', Condition: '',Value:'1'},
                {Line: 8, Type: 'assignment expression', Name:'r', Condition: '',Value:'t'}]);
    });
});

describe('if else statement test with blocks', () => {
    it('if else', () => {
        assert.deepEqual(
            itercode(parseCode('if (X==y)\n' +
                '            {high = mid-1;}\n' +
                '        else\n' +
                '            {r=t;}')),
            [{Line: 1, Type: 'if statement', Name:'', Condition: 'X == y',Value:''},
                {Line: 2, Type: 'assignment expression', Name:'high', Condition: '',Value:'mid - 1'},
                {Line: 4, Type: 'assignment expression', Name:'r', Condition: '',Value:'t'}]
        );
    });
});

describe('if statement test ', () => {
    it('if ', () => {
        assert.deepEqual(
            itercode(parseCode('if (X==y)\n' +
                '            {high = mid-1;}')),
            [{Line: 1, Type: 'if statement', Name:'', Condition: 'X == y',Value:''},
                {Line: 2, Type: 'assignment expression', Name:'high', Condition: '',Value:'mid - 1'}]
        );
    });
});

describe('for statement', () => {
    it('for', () => {
        assert.deepEqual(
            itercode(parseCode('for (i=0; i<5; i++){}')),
            [{Line: 1, Type: 'for statement', Name:'', Condition: '(i=0; i < 5; i++)',Value:''}]
        );
        assert.deepEqual(
            itercode(parseCode('for (let i=0; i<5; i++){}')),
            [{Line: 1, Type: 'for statement', Name:'', Condition: '(let i=0; i < 5; i++)',Value:''}]
        );
    });
});