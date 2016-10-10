import * as _ from 'lodash';

export class JsonApiParser {
    static _pool: Object;
    constructor(){
        if(!JsonApiParser._pool){
            throw 'Pool of classes is not configured';
        }
    }

    static configure(pool: Object){
        this._pool = pool;
    }

    static toCamelNotation(document){
        if (_.isPlainObject(document)) {
            return this.fixObjectForCamelNotification(document);
        }
        else if (_.isArray(document)) {
            let newObjectList = [];
            for (var i = 0; i < document.length; i++) {
                newObjectList = newObjectList.concat(this.fixObjectForCamelNotification(document[i]));
            }
            return newObjectList;
        }
        else {
            return document;
        }
    }

    static fixObjectForCamelNotification(obj){
        let cloned = _.extend({}, _.cloneDeep(obj));
        _.each(cloned,(value, key) => {
            let newKey = key;
            let splitKey = key.split('-');
            newKey = _.concat(
                splitKey[0].charAt(0).toLowerCase() + splitKey[0].slice(1, splitKey[0].length),
                splitKey.slice(1, splitKey.length).map(i => i.charAt(0).toUpperCase() + i.slice(1, i.length))
            ).join('');
            Object.assign(cloned[newKey], obj[key]);
            if (_.isPlainObject(obj[newKey])) {
                cloned[newKey] = this.toCamelNotation(obj[newKey]);
            }
            else if (_.isArray(obj[newKey])) {
                let newObjectList = [];
                for (var i = 0; i < obj[newKey].length; i++) {
                    newObjectList = newObjectList.concat(this.toCamelNotation(obj[newKey][i]));
                }
                cloned[newKey] = newObjectList;
            }
        });
        return cloned;
    }

    get pool(): Object{
        return JsonApiParser._pool;
    }

}