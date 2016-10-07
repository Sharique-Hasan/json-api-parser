import { JsonApiParser } from './parser';
import * as _ from 'lodash';

export class Serializer extends JsonApiParser {
    constructor(public document){
        super();
    }

    serializeMultipleElements(document?: Array<Object>, isIncluded?: boolean){
        document = document ? document : this.document;
        let obj: Object;
        let jsonApiObject: Object = {};
        if(!isIncluded){
            jsonApiObject.data = [];
        }
        _.each(document, (item) => {
            obj = _.extend({}, _.pick(item, ['type', 'id']));
            let attributes = _.omit(item, Object.keys(obj));
            if (!obj.type) {
                throw 'Resource type is not defined';
            }
            if(Object.keys(attributes).length){
                obj.attributes = {};
            }
            this.processAttributes(attributes, jsonApiObject, obj);
        });
        if (isIncluded) {
            if (!Object.keys(obj).length) {
                obj = _.omit(obj, 'relationships');
            }
            Object.assign(jsonApiObject, obj);
        }
        else {
            jsonApiObject.data.push(obj);
        }
        return jsonApiObject;
    }

    serializeSingleElement(document?: Object, isIncluded?: boolean){
        document = document ? document : this.document;
        let jsonApiObject = {};
        let obj = _.pick(document, ['type', 'id']);
        let attributes = _.omit(document, Object.keys(obj));
        if (!obj.type) {
            throw 'Resource type is not defined';
        }
        if(Object.keys(attributes).length){
            obj.attributes = {};
        }
        this.processAttributes(attributes, jsonApiObject, obj);
        if (isIncluded) {
            if (!Object.keys(obj).length) {
                obj = _.omit(obj, 'relationships');
            }
            Object.assign(jsonApiObject, obj);
        }
        else {
            jsonApiObject.data.push(obj);
        }
        return jsonApiObject;
    }

    processAttributes(attributes, jsonApiObject, instance){
        _.each(attributes, (value, key) => {
            if(value && _.isArray(value)){
                instance.relationships = _.extend(instance.relationships || {});
                instance.relationships[key] = Serializer.getAttributesData(value);
                jsonApiObject.included = Serializer.processDeepIncludes(
                    this.serializeByAttribute(value, jsonApiObject)
                );
            }
            else if (value && _.isObject(value)){
                instance.relationships = _.extend(instance.relationships || {});
                instance.relationships[key] = { data: _.pick(value, ['type', 'id']) };
                jsonApiObject.included = Serializer.processDeepIncludes(
                    this.serializeByAttribute(value, jsonApiObject)
                );
            }
            else if (!_.isNull(value) && !_.isUndefined(value) &&
                (_.isString(value) || _.isNumber(value) || _.isBoolean(value))) {
                instance.attributes[key] = value;
            }
        });
    }

    serializeByAttribute(attribute){
        if(_.isArray(attribute)){
            return _.map(attribute,
                (data) => _.isArray(data) ?
                    this.serializeMultipleElements(data, true) : this.serializeSingleElement(data, true));
        }
        return this.serializeSingleElement(attribute, true);
    }



    static getAttributesData(attributes){
        return {
            data: _.map(attributes, e => _.pick(e, ['id', 'type']))
        }
    }

    static processDeepIncludes(data, native){
        let includes = _.isArray(data) ? data : [data];
        let deepIncludes = _(includes)
            .map(i => i.included)
            .flattenDeep()
            .compact();
        if(deepIncludes.length){
            native.included = _(deepIncludes)
                .concat(includes, native.included)
                .compact();
        }
        else{
            native.included = _(includes)
                .concat(native.included)
                .compact();
        }
        return native.included;
    }

    convert(){
        let parsed;
        if(_.isArray(this.document)){
            parsed = this.serializeMultipleElements();
        }
        else{
            parsed = this.serializeSingleElement();
        }
        return parsed;
    }
}