import { JsonApiParser } from './parser';
import { IJsonApi } from './ijsonapi';
import * as _ from 'lodash';

export class Serializer extends JsonApiParser {
    constructor(public document){
        super();
        if(_.isArray(document)){
            this.serializeMultipleElements();
        }
    }

    serializeMultipleElements(){
        let parsed = [];
        _.each(this.document.data, (item: IJsonApi) => {
            let entity = new this.pool[item.type]();
            let extend = item.attributes && Object.keys(item.attributes).length ?
                ['type', 'id', 'attributes'] : ['type', 'id'];
            Object.assign(entity, _.pick(item, extend));
            if(item.relationships){
                _.each(item.relationships, (key, relationship) => {
                    entity[key] = relationship.data;
                    if(_.isArray(entity[key])){
                        _.each(entity[key], (element) => {
                            Object.assign(element, this.serializeSingleElement(this.findFromInclude(element)));
                        })
                    }
                    else{
                        Object.assign(entity[key], this.serializeSingleElement(entity[key]));
                    }
                });
            }
            parsed.push(entity);
        });
    }

    serializeSingleElement(document?: IJsonApi){
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
                        Object.assign(element, this.serializeSingleElement(this.findFromInclude(element)));
                    })
                }
                else{
                    Object.assign(entity[key], this.serializeSingleElement(entity[key]));
                }
            });
        }
    }

    findFromInclude(item: IJsonApi){
        return _.find(this.document.included, item);
    }
}