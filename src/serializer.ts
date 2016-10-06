import { JsonApiParser } from './parser';
import { IJsonApi } from './ijsonapi';
import * as _ from 'lodash';

export class Serializer extends JsonApiParser {
    constructor(public document){
        super();
        if(_.isArray(document)){
            this.deSerializeMultipleElements();
        }
    }

    serializeMultipleElements(document?: Array<Object>, isIncluded?: boolean){
        let jsonApiObjectCollection = [];
        let jsonApiObject = {};
        if(!isIncluded){
            jsonApiObject.data = [];
        }
        _.each(document, (item) => {
            let obj = _.pick(item, ['type', 'id']);
            let attributes = _.omit(item, Object.keys(obj));
            if (!obj.type) {
                throw 'Resource type is not defined';
            }
            if(Object.keys(attributes).length){
                obj.attributes = {};
            }
            _.each(attributes, (value, key) => {
                if(value && _.isArray(value)){
                    obj.relationships = _.extend(obj.relationships || {});
                    obj.relationships[key] = Serializer.getAttributesData(value);
                    jsonApiObject.included = Serializer.processDeepIncludes(
                        this.serializeByAttribute(value, jsonApiObject)
                    );
                }
                else if (value && _.isObject(value)){
                    obj.relationships = _.extend(obj.relationships || {});
                }
            });
        });


    }

    serializeSingleElement(document?: Object, isIncluded?: boolean){

    }

    findFromInclude(item: IJsonApi){
        return _.find(this.document.included, item);
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
}