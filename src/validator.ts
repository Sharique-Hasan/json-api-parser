
import * as Ajv from 'ajv';

export class Validator {
    private _validate = Ajv({ allErrors: true, verbose: true }).compile(require('./json-api-schema.json'));
    constructor(public document) { }
    isValid(): boolean {
        return this._validate(this.document);
    }
}