"use strict";
var expect = require('chai').expect;
var src_1 = require('../src');
describe('Deserializer::mode', function () {
    it('should pass', function () {
        src_1.JsonApiParser.configure({ id: 'Sharique', type: 'types' });
        expect(src_1.JsonApiParser._pool).to.have.property('name')
            .that.is.a('string');
    });
});
