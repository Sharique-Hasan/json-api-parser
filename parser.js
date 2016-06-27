/**
 * Created by sharique on 1/21/16.
 */

(function(){

    parser = {
        parseJsonApi : function(entity){
            return parseFromJsonApi(entity.data, entity.included);
        },
        parseToJsonApi : function(entity){
            return processDuplicatedIncludes(reverseToJsonApi(entity));
        }
    };

    function processDuplicatedIncludes(data){
        data.included = _.uniq(data.included, function(item){
            return JSON.stringify(item);
        });
        return data;
    }

    function parseFromJsonApi(data, included){
        included = Array.isArray(included) ? included : [];
        var native, keysCounter, allRelationShipKeys, relationshipsKey, allRelationShipKeysLength, dataCounter, dataLength;
        if(Array.isArray(data)){
            native = [];
            for(var i = 0; i < data.length; i++){
                var nativeObject = {};
                nativeObject = _.omit(data[i], ['attributes',
                    'relationships', 'included', 'links']);
                if(data[i].attributes && Object.keys(data[i].attributes).length > 0) {
                    nativeObject = _.extend(nativeObject, data[i].attributes);
                }
                if(data[i].relationships) {
                    allRelationShipKeys = Object.keys(data[i].relationships);
                    allRelationShipKeysLength = allRelationShipKeys.length;
                    for(keysCounter = 0; keysCounter<allRelationShipKeysLength;keysCounter++){
                        relationshipsKey = allRelationShipKeys[keysCounter];
                        nativeObject[relationshipsKey] = Array.isArray(data[i].relationships[relationshipsKey].data) ? [] : {};
                        nativeObject[relationshipsKey] = _.extend(nativeObject[relationshipsKey], data[i].relationships[relationshipsKey].data);
                        //for now its has no use
                        //nativeObject[relationshipsKey] = _.extendOwn(nativeObject[relationshipsKey], data[i].relationships[relationshipsKey].links);
                        if(Array.isArray(data[i].relationships[relationshipsKey].data)){
                            dataLength = data[i].relationships[relationshipsKey].data.length;
                            for(dataCounter = 0; dataCounter < dataLength; dataCounter++){
                                nativeObject[relationshipsKey][dataCounter] = _.extend(nativeObject[relationshipsKey][dataCounter], parseFromJsonApi(_.find(included, data[i].relationships[relationshipsKey].data[dataCounter])));
                            }
                        }
                        else{
                            nativeObject[relationshipsKey] = _.extend(nativeObject[relationshipsKey], parseFromJsonApi(_.filter(included, data[i].relationships[relationshipsKey].data)));
                        }
                    }
                }
                native.push(nativeObject);
            }
        }
        else if(typeof data === 'object'){
            native = {};
            native = _.omit(data, ['attributes',
                'relationships', 'included', 'links']);
            native = _.extend(native, data.attributes);
            if(data.relationships) {
                allRelationShipKeys = Object.keys(data.relationships);
                allRelationShipKeysLength = allRelationShipKeys.length;
                for(keysCounter = 0; keysCounter<allRelationShipKeysLength;keysCounter++){
                    relationshipsKey = allRelationShipKeys[keysCounter];
                    native[relationshipsKey] = Array.isArray(data.relationships[relationshipsKey].data) ? [] : {};
                    native[relationshipsKey] = _.extend(native[relationshipsKey], data.relationships[relationshipsKey].data);
                    //for now, it has no use
                    //native[relationshipsKey] = _.extendOwn(native[relationshipsKey], data.relationships[relationshipsKey].links);
                    if(Array.isArray(data.relationships[relationshipsKey].data)){
                        dataLength = data.relationships[relationshipsKey].data.length;
                        for(dataCounter = 0; dataCounter < dataLength; dataCounter++){
                            native[relationshipsKey][dataCounter] = _.extend(native[relationshipsKey][dataCounter], parseFromJsonApi(_.filter(included, data.relationships[relationshipsKey].data[dataCounter]).length > 1 ? _.filter(included, data.relationships[relationshipsKey].data[dataCounter]) : _.filter(included, data.relationships[relationshipsKey].data[dataCounter])[0], included));
                        }
                    }
                    else{
                        native[relationshipsKey] = _.extend(native[relationshipsKey], parseFromJsonApi(_.filter(included, data.relationships[relationshipsKey].data).length > 1 ? _.filter(included, data.relationships[relationshipsKey].data) : _.filter(included, data.relationships[relationshipsKey].data)[0], included));
                    }
                }
            }
        }
        return toCamelNotation(native);
    }

    function getAttributeKeys(attributes) {
        return {
            data:_.map(attributes, function(e){
                if(e.hasOwnProperty('id') && e.hasOwnProperty('type')){
                    return _.pick(e,['id', 'type']);
                }
            })
        };
    }

    function reverseToJsonApiByAttributes(attribute){
        if(attribute.constructor === Object){
            return reverseToJsonApi(attribute, true);
        }
        return _.map(attribute,function(e){
            return reverseToJsonApi(e, true);
        });
    }

    function isStringNumberBoolean(data) {
        var keys = [String, Number, Boolean];
        return data === undefined || data === null || keys.indexOf(data.constructor) > -1;
    }

    function isArrayOfObject(data) {
        return Array.isArray(data) && data[0].constructor === Object; //atleast first object must be object
    }

    function processDeepIncluded(data, native){
        var ifIncludeExists = data.constructor === Object ? [data] : data;
        var deepIncluded = _.compact(_.flatten(ifIncludeExists.map(function(e){return e.included})));
        if(deepIncluded.length){
            native.included = _.compact([].concat(native.included, ifIncludeExists, deepIncluded));
            ifIncludeExists = ifIncludeExists.map(function(e){
                delete e.included;
                return e;
            })
        }
        else{
            native.included = _.compact([].concat(native.included, ifIncludeExists));
        }
        return native.included;
    }

    function reverseToJsonApi(data, isIncluded){
        var native = {}, nativeObject = {}, attributes, attributeKeys, attributeKey;
        //no need to process further if provided "data" is neither object or array.
        if(isStringNumberBoolean(data)) {
            return native;
        }
        if(!isIncluded){
            native.data = [];
            //native.included = [];
        }
        if(isArrayOfObject(data)){
            for(var i = 0; i < data.length; i++){
                nativeObject = {};
                nativeObject = _.extend(nativeObject,_.pick(data[i], ['type', 'id']));
                try{
                    nativeObject.type = nativeObject.type.trim().replace(' ','-');
                }
                catch (e){
                    throw 'Resource type is not defined';
                }
                attributes = _.omit(data[i], Object.keys(nativeObject));
                attributeKeys = Object.keys(attributes);
                if(attributeKeys.length > 0) {
                    //nativeObject.relationships = {};
                    nativeObject.attributes = {};
                    for(var k= 0, len = attributeKeys.length;k<len;k++) {
                        attributeKey = attributeKeys[k];
                        if(attributes[attributeKey] && Array.isArray(attributes[attributeKey])){
                            nativeObject.relationships = _.extend(nativeObject.relationships || {});

                            nativeObject.relationships[attributeKey] = getAttributeKeys(attributes[attributeKey]);
                            native.included = processDeepIncluded(reverseToJsonApiByAttributes(attributes[attributeKey], true), native);
                        }
                        else if(attributes[attributeKey] && attributes[attributeKey].constructor === Object){
                            nativeObject.relationships = _.extend(nativeObject.relationships || {});
                            nativeObject.relationships[attributeKey] = { data: _.pick(attributes[attributeKey], ['id', 'type'])};
                            native.included = processDeepIncluded(reverseToJsonApiByAttributes(attributes[attributeKey], true), native);

                        }
                        else if(attributes[attributeKey] && (attributes[attributeKey].constructor === String || attributes[attributeKey].constructor === Boolean || attributes[attributeKey].constructor === Number)){
                            nativeObject.attributes[attributeKey] = attributes[attributeKey];
                        }
                    }
                }
                if(isIncluded){
                    if(!Object.keys(nativeObject).length){
                        nativeObject = _.omit(nativeObject, 'relationships');
                    }
                    native = _.extend(native, nativeObject);
                }else{
                    native.data.push(nativeObject);
                }
            }
        }
        else if(data.constructor === Object){
            nativeObject = {};
            nativeObject = _.extend(nativeObject,_.pick(data, ['type', 'id']));
            try{
                nativeObject.type = nativeObject.type.trim().replace(' ','-');
            }
            catch (e){
                throw 'Resource type is not defined';
            }
            attributes = _.omit(data, Object.keys(nativeObject));
            attributeKeys = Object.keys(attributes);
            if(attributeKeys.length > 0) {
                //nativeObject.relationships = {};
                nativeObject.attributes = {};
                for(var j= 0,jLen=attributeKeys.length;j<jLen;j++) {
                    attributeKey = attributeKeys[j];
                    if(attributes[attributeKey] && Array.isArray(attributes[attributeKey])){
                        nativeObject.relationships = _.extend(nativeObject.relationships || {});
                        nativeObject.relationships[attributeKey] = getAttributeKeys(attributes[attributeKey]);
                        native.included = processDeepIncluded(reverseToJsonApiByAttributes(attributes[attributeKey], true), native);

                        //native.included = native.included.concat(reverseToJsonApiByAttributes(attributes[attributeKey], true));
                    }
                    else if(attributes[attributeKey] && attributes[attributeKey].constructor === Object){
                        nativeObject.relationships = _.extend(nativeObject.relationships || {});
                        nativeObject.relationships[attributeKey] = { data: _.pick(attributes[attributeKey], ['id', 'type'])};
                        nativeObject.relationships[attributeKey].data.type = nativeObject.relationships[attributeKey].data.type.trim().replace(' ','-');
                        if(!isIncluded){
                            native.included = processDeepIncluded(reverseToJsonApiByAttributes(attributes[attributeKey], true), native);
                        }
                    }
                    else if(attributes[attributeKey] && (attributes[attributeKey].constructor === String || attributes[attributeKey].constructor === Boolean || attributes[attributeKey].constructor === Number)){
                        nativeObject.attributes[attributeKey] = attributes[attributeKey];
                    }
                }
            }
            if(isIncluded){
                if(!Object.keys(nativeObject).length){
                    nativeObject = _.omit(nativeObject, 'relationships');
                }
                native = _.extend(native, nativeObject);
            }else{
                native.data = nativeObject;
            }
        }
        return native;
    }

    /**
     *
     * Make object key to camelCase
     *
     *
     * @param data
     * @returns {*}
     */
    function fixObjectForCamelNotification(data) {
        for(var key in data) {
            if(!key) {
                continue;
            }
            var newKey = key;
            if(key.indexOf('-') > 0) {
                var splittedKey = key.split('-');
                newKey = splittedKey[0].toLowerCase();
                for(var arrLen = 1;arrLen < splittedKey.length; arrLen++) {
                    newKey += splittedKey[arrLen].charAt(0).toUpperCase() + splittedKey[arrLen].slice(1);
                }
                data[newKey] = data[key];
                delete data[key];
            }
            if(_.isObject(data[newKey])) {
                data[newKey] = toCamelNotation(data[newKey]);
            }
            else if(_.isArray(data[newKey])) {
                var newObjectList = [];
                for(var i=0;i<data[newKey].length;i++) {
                    newObjectList = newObjectList.concat(toCamelNotation(data[newKey][i]));
                }
                data[newKey] = newObjectList;
            }
        }
        return data;
    }

    /**
     *
     * iterate over data (either array of object) to make it's keys camelCase
     *
     * @param data
     * @returns {*}
     */
    function toCamelNotation(data){
        if(_.isObject(data)) {
            return fixObjectForCamelNotification(data);
        }
        else if(_.isArray(data)) {
            var newObjectList = [];
            for(var i=0;i<data.length;i++) {
                newObjectList = newObjectList.concat(fixObjectForCamelNotification(data[i]));
            }
            return newObjectList;
        }
        else {
            return data;
        }
    }



})();