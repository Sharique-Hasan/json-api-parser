var expect = require('chai').expect;
import { JsonApiParser, Deserializer } from '../src'

describe('Deserializer::mode', () => {

    it('should pass', () => {
        JsonApiParser.configure({ id: 'Sharique', type: 'types' });
        expect(JsonApiParser._pool).to.have.property('name')
            .that.is.a('string');
    })

});