import { JsonApiParser } from './parser';
import { IJsonApiEntity } from './ijsonapi-entity';
import { JsonApi } from './json-api'
import * as _ from 'lodash';

export class Deserializer extends JsonApiParser {
    constructor(public document){
        super();
        this.document = JsonApiParser.toCamelNotation(document);
    }

    deSerializeMultipleElements(document?: Array<IJsonApiEntity>){
        document = document || this.document.data;
        let parsed = [];
        _.each(this.document.data, (item: IJsonApiEntity) => {
            let entity = new this.pool[item.type]();
            let extend = item.attributes && Object.keys(item.attributes).length ?
                ['type', 'id', 'attributes'] : ['type', 'id'];
            Object.assign(entity, _.pick(item, extend));
            if(item.relationships){
                _.each(item.relationships, (key, relationship) => {
                    entity[key] = relationship.data;
                    if(_.isArray(entity[key])){
                        _.each(entity[key], (element) => {
                            Object.assign(element, this.deSerializeMultipleElements(this.findFromInclude(element)));
                        })
                    }
                    else{
                        Object.assign(entity[key], this.deSerializeSingleElement(entity[key]));
                    }
                });
            }
            parsed.push(entity);
        });
        return parsed;
    }

    deSerializeSingleElement(document?: IJsonApiEntity){
        let doc = document || this.document.data;
        let type = doc.type;
        let entity = new this.pool[type]();
        let extend = doc.attributes && Object.keys(doc.attributes).length ?
            ['type', 'id', 'attributes'] : ['type', 'id'];
        Object.assign(entity, _.pick(doc, extend));
        if(doc.relationships){
            _.each(doc.relationships, (key, relationship) => {
                entity[key] = relationship.data;
                if(_.isArray(entity[key])){
                    _.each(entity[key], (element) => {
                        Object.assign(element, this.deSerializeSingleElement(this.findFromInclude(element)));
                    })
                }
                else{
                    Object.assign(entity[key], this.deSerializeSingleElement(entity[key]));
                }
            });
        }
        return entity;
    }

    findFromInclude(item: IJsonApiEntity){
        return _.find(this.document.included, item);
    }

    convert(){
        let data, meta;
        if(_.isArray(document.data)){
            data = this.deSerializeMultipleElements();
        }
        else{
            data = this.deSerializeSingleElement();
        }
        meta = this.document.meta || null;
        return new JsonApi(data, meta);
    }
}