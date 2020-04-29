const func = require('../server');
const assert = require('assert');

describe('standard server functions tests', ()=>{
    it('should equal 2', ()=>{
        const result = func.add(1,1);
        assert.deepStrictEqual(result, 2);
    })
});

//setup basic