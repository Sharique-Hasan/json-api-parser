import * as schema from './json-api-schema.json';
import * as Ajv from 'ajv';

export class Validator {
    private _validate = Ajv({ allErrors: true, verbose: true }).compile(schema);
    constructor(public document) { }
    isValid(): boolean {
        return this._validate(this.document);
    }
}