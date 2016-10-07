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
        if (_.isObject(document)) {
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
        _.each(obj,(value, key) => {
            let newKey = key;
            let splitKey = key.split('-');
            newKey = _.concat(
                splitKey[0].charAt(0).toLowerCase() + splitKey[0].slice(1, splitKey[0].length),
                splitKey.slice(1, splitKey.length).map(i => i.charAt(0).toUpperCase() + i.slice(1, i.length))
            ).join('');
            Object.assign(obj[newKey], obj[key]);
            if (newKey !== key) {
                delete obj[key];
            }
            if (_.isObject(obj[newKey])) {
                obj[newKey] = this.toCamelNotation(obj[newKey]);
            }
            else if (_.isArray(obj[newKey])) {
                let newObjectList = [];
                for (var i = 0; i < obj[newKey].length; i++) {
                    newObjectList = newObjectList.concat(this.toCamelNotation(obj[newKey][i]));
                }
                obj[newKey] = newObjectList;
            }
        });
        return obj;
    }

    get pool(): Object{
        return JsonApiParser._pool;
    }

}